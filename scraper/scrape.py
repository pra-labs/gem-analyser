import json
import logging
import re
import time
import urllib.parse
import urllib.request
import http.cookiejar
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("gem_scraper")

DEFAULT_KEYWORDS = [
    "Artificial Intelligence",
    "Machine Learning",
    "Chatbot",
    "Smart Parking",
    "Data Analytics",
    "Software Development",
    "Language Learning Software",
    "Learning Management System",
    "EV Charging",
    "Computer Vision",
    "IoT",
    "Business Intelligence"
]

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "bids.json"

class GeMClient:
    BASE_URL = "https://bidplus.gem.gov.in"
    USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

    def __init__(self):
        self.cj = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cj))
        self.csrf_token: Optional[str] = None

    def refresh_csrf(self) -> str:
        req = urllib.request.Request(
            f"{self.BASE_URL}/all-bids",
            headers={"User-Agent": self.USER_AGENT}
        )
        with self.opener.open(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="ignore")

        match = re.search(r'csrf_bd_gem_nk[\'\"]?\s*[:=]\s*[\'\"]([a-f0-9]+)[\'\"]', html)
        if not match:
            raise RuntimeError("Could not find CSRF token on GeM page")
        self.csrf_token = match.group(1)
        logger.info(f"Refreshed CSRF token: {self.csrf_token[:8]}...")
        return self.csrf_token

    def search_bids(self, keyword: str, page: int = 1, sort: str = "Bid-End-Date-Latest") -> Dict[str, Any]:
        if not self.csrf_token:
            self.refresh_csrf()

        postdata = {
            "page": page,
            "param": {
                "searchBid": keyword,
                "searchType": "fullText"
            },
            "filter": {
                "sort": sort
            }
        }
        post_fields = urllib.parse.urlencode({
            "payload": json.dumps(postdata),
            "csrf_bd_gem_nk": self.csrf_token
        }).encode("utf-8")

        req = urllib.request.Request(
            f"{self.BASE_URL}/all-bids-data",
            data=post_fields,
            headers={
                "User-Agent": self.USER_AGENT,
                "X-Requested-With": "XMLHttpRequest",
                "Referer": f"{self.BASE_URL}/all-bids",
                "Origin": self.BASE_URL,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            }
        )

        try:
            with self.opener.open(req, timeout=20) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data
        except Exception as e:
            logger.warning(f"Error fetching page {page} for keyword '{keyword}': {e}. Retrying once with fresh CSRF...")
            self.refresh_csrf()
            post_fields = urllib.parse.urlencode({
                "payload": json.dumps(postdata),
                "csrf_bd_gem_nk": self.csrf_token
            }).encode("utf-8")
            req.data = post_fields
            with self.opener.open(req, timeout=20) as resp:
                return json.loads(resp.read().decode("utf-8"))

def normalize_doc(doc: Dict[str, Any], query_keyword: str) -> Dict[str, Any]:
    b_id = str(doc.get("id") or (doc.get("b_id") and doc["b_id"][0]) or "")
    bid_num = (doc.get("b_bid_number") or [""])[0]
    category = (doc.get("b_category_name") or [""])[0]
    full_cats = (doc.get("bd_category_name") or [""])[0]
    title = (doc.get("bbt_title") or [""])[0]
    dept = (doc.get("ba_official_details_deptName") or [""])[0]
    start_date = (doc.get("final_start_date_sort") or [""])[0]
    end_date = (doc.get("final_end_date_sort") or [""])[0]
    qty = (doc.get("b_total_quantity") or [0])[0]
    bid_to_ra = (doc.get("b_bid_to_ra") or [0])[0]
    is_boq = (doc.get("bd_details_is_boq") or [False])[0]

    return {
        "id": b_id,
        "bid_number": bid_num,
        "category": category,
        "full_categories": full_cats,
        "title": title,
        "department": dept,
        "start_date": start_date,
        "end_date": end_date,
        "quantity": qty,
        "reverse_auction": bool(bid_to_ra),
        "is_boq": bool(is_boq),
        "doc_url": f"https://bidplus.gem.gov.in/showbidDocument/{b_id}",
        "matched_keywords": [query_keyword],
        "scraped_at": datetime.now(timezone.utc).isoformat()
    }

def run_scraper(keywords: Optional[List[str]] = None, max_pages_per_keyword: int = 3):
    if keywords is None:
        keywords = DEFAULT_KEYWORDS

    client = GeMClient()
    existing_bids: Dict[str, Dict[str, Any]] = {}

    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                for item in saved.get("bids", []):
                    existing_bids[item["id"]] = item
            logger.info(f"Loaded {len(existing_bids)} existing bids from {DATA_FILE}")
        except Exception as e:
            logger.error(f"Failed to load existing bids: {e}")

    new_count = 0
    updated_count = 0

    for kw in keywords:
        logger.info(f"--> Searching GeM for: '{kw}'")
        for page in range(1, max_pages_per_keyword + 1):
            try:
                res = client.search_bids(kw, page=page)
                docs = res.get("response", {}).get("response", {}).get("docs", [])
                total_found = res.get("response", {}).get("response", {}).get("numFound", 0)
                logger.info(f"    Page {page}: found {len(docs)} / {total_found} bids")

                if not docs:
                    break

                for d in docs:
                    clean = normalize_doc(d, kw)
                    bid_id = clean["id"]
                    if not bid_id:
                        continue

                    if bid_id in existing_bids:
                        existing = existing_bids[bid_id]
                        if kw not in existing.get("matched_keywords", []):
                            existing.setdefault("matched_keywords", []).append(kw)
                        # Keep latest dates and metadata
                        existing["end_date"] = clean["end_date"] or existing.get("end_date")
                        existing["category"] = clean["category"] or existing.get("category")
                        existing["scraped_at"] = clean["scraped_at"]
                        updated_count += 1
                    else:
                        existing_bids[bid_id] = clean
                        new_count += 1

                time.sleep(1.0)  # Gentle delay between pages
            except Exception as e:
                logger.error(f"Error querying '{kw}' page {page}: {e}")
                break

    all_bids = list(existing_bids.values())
    # Sort by end date descending
    all_bids.sort(key=lambda x: x.get("end_date", ""), reverse=True)

    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "total_bids": len(all_bids),
        "bids": all_bids
    }

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    logger.info(f"Done! Scraped {new_count} new bids, updated {updated_count}. Total stored: {len(all_bids)}")
    return payload

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Scrape Government e-Marketplace (GeM) bids.")
    parser.add_argument("--keywords", nargs="+", help="Specific keywords to search for")
    parser.add_argument("--pages", type=int, default=2, help="Max pages per keyword (10 bids/page)")
    args = parser.parse_args()

    run_scraper(keywords=args.keywords, max_pages_per_keyword=args.pages)
