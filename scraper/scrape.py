import json
import logging
import re
import time
import urllib.parse
import urllib.request
import http.cookiejar
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("gem_scraper")

# Comprehensive high-impact keyword clusters covering Tech, AI, Cloud, Cybersecurity, Smart Mobility, Automation, Electronics
DEFAULT_KEYWORDS = [
    # AI, ML & Data Intelligence
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Chatbot",
    "Computer Vision",
    "Natural Language Processing",
    "Data Analytics",
    "Business Intelligence",
    "Big Data",

    # Cloud, DevOps & Software Development
    "Cloud Computing",
    "Cloud Hosting",
    "Software Development",
    "Web Application",
    "Mobile Application",
    "Learning Management System",
    "ERP Software",
    "Language Learning Software",

    # Cybersecurity & Defense Tech
    "Cybersecurity",
    "Network Security",
    "Information Security",
    "Vulnerability Assessment",
    "SIEM",
    "Firewall",

    # Smart Mobility & Clean Tech
    "EV Charging",
    "Electric Vehicle",
    "Smart Parking",
    "Intelligent Transportation",
    "Fleet Management",
    "Traffic Management System",

    # Automation, IoT & Robotics
    "IoT",
    "Internet of Things",
    "Robotics",
    "Drone",
    "UAV",
    "Industrial Automation",
    "SCADA",
    "CCTV Surveillance",
    "Biometric Attendance",

    # Electronics & Hardware
    "Server Rack",
    "Microcontroller",
    "Smart Energy Meter",
    "Electronic Hardware"
]

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = REPO_ROOT / "data" / "bids.json"
APP_PUBLIC_DATA_FILE = REPO_ROOT / "app" / "public" / "data" / "bids.json"

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


def calculate_match_score(
    title: str,
    category: str,
    full_cats: str,
    matched_keywords: List[str],
    is_high_value: bool,
    quantity: int,
    end_date_str: str
) -> Tuple[int, str]:
    """
    Computes a 0-100 relevance Match Score and classification label:
    - Analyzes keyword occurrence density in title and category descriptions.
    - Factors in high-value qualification flag, scale (quantity), and urgency.
    """
    score = 0
    searchable_text = f"{title} {category} {full_cats}".lower()

    # Base match from query keywords
    primary_hits = sum(1 for kw in matched_keywords if kw.lower() in searchable_text)
    score += min(primary_hits * 18, 45)

    # Core tech boost keywords
    high_impact_tech = [
        "ai", "artificial intelligence", "machine learning", "deep learning",
        "cloud", "cybersecurity", "security", "software", "analytics",
        "iot", "robotics", "drone", "ev charging", "smart", "automation"
    ]
    tech_hit_count = sum(1 for term in high_impact_tech if re.search(r'\b' + re.escape(term) + r'\b', searchable_text))
    score += min(tech_hit_count * 7, 25)

    # High value qualification by Government portal
    if is_high_value:
        score += 15

    # Scale factor
    if quantity > 50:
        score += 8
    elif quantity > 5:
        score += 5

    # Active status / End date proximity
    if end_date_str:
        try:
            # Format: 2026-12-09T18:00:00Z
            clean_date = end_date_str.replace("Z", "+00:00")
            dt = datetime.fromisoformat(clean_date)
            now = datetime.now(timezone.utc)
            days_remaining = (dt - now).days
            if 3 <= days_remaining <= 30:
                score += 7
            elif days_remaining > 0:
                score += 4
        except Exception:
            pass

    score = min(max(score, 10), 99)

    if score >= 75:
        tier = "HIGH"
    elif score >= 50:
        tier = "MEDIUM"
    else:
        tier = "LOW"

    return score, tier


def normalize_doc(doc: Dict[str, Any], query_keyword: str) -> Dict[str, Any]:
    b_id = str(doc.get("id") or (doc.get("b_id") and doc["b_id"][0]) or "")
    bid_num = (doc.get("b_bid_number") or [""])[0]
    category = (doc.get("b_category_name") or [""])[0]
    full_cats = (doc.get("bd_category_name") or [""])[0]
    title = (doc.get("bbt_title") or [""])[0]
    dept = (doc.get("ba_official_details_deptName") or [""])[0]
    ministry = (doc.get("ba_official_details_minName") or [""])[0]
    start_date = (doc.get("final_start_date_sort") or [""])[0]
    end_date = (doc.get("final_end_date_sort") or [""])[0]
    qty = (doc.get("b_total_quantity") or [0])[0]
    bid_to_ra = (doc.get("b_bid_to_ra") or [0])[0]
    is_boq = (doc.get("bd_details_is_boq") or [False])[0]
    is_high_value = bool((doc.get("is_high_value") or [False])[0])

    matched_kw_list = [query_keyword] if query_keyword else []
    match_score, priority_tier = calculate_match_score(
        title=title,
        category=category,
        full_cats=full_cats,
        matched_keywords=matched_kw_list,
        is_high_value=is_high_value,
        quantity=qty if isinstance(qty, (int, float)) else 0,
        end_date_str=end_date
    )

    # Estimate budget tier indicator
    estimated_value_indicator = "High Value (>= ₹2 Crore)" if is_high_value else "Standard Scale"

    return {
        "id": b_id,
        "bid_number": bid_num,
        "category": category,
        "full_categories": full_cats,
        "title": title,
        "department": dept,
        "ministry": ministry,
        "start_date": start_date,
        "end_date": end_date,
        "quantity": qty,
        "reverse_auction": bool(bid_to_ra),
        "is_boq": bool(is_boq),
        "is_high_value": is_high_value,
        "estimated_value_indicator": estimated_value_indicator,
        "match_score": match_score,
        "priority_tier": priority_tier,
        "doc_url": f"https://bidplus.gem.gov.in/showbidDocument/{b_id}",
        "matched_keywords": matched_kw_list,
        "scraped_at": datetime.now(timezone.utc).isoformat()
    }


def sync_data_files(payload: Dict[str, Any]) -> None:
    """Safely writes payload to data/bids.json and copies/syncs to app/public/data/bids.json."""
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved {payload['total_bids']} bids to {DATA_FILE}")

    # Synchronize with Next.js app public directory
    APP_PUBLIC_DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(APP_PUBLIC_DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    logger.info(f"Synced {payload['total_bids']} bids to {APP_PUBLIC_DATA_FILE}")


def run_scraper(keywords: Optional[List[str]] = None, max_pages_per_keyword: int = 2) -> Dict[str, Any]:
    if keywords is None:
        keywords = DEFAULT_KEYWORDS

    client = GeMClient()
    existing_bids: Dict[str, Dict[str, Any]] = {}

    # Load from DATA_FILE or APP_PUBLIC_DATA_FILE if available
    source_file = DATA_FILE if DATA_FILE.exists() else (APP_PUBLIC_DATA_FILE if APP_PUBLIC_DATA_FILE.exists() else None)
    if source_file:
        try:
            with open(source_file, "r", encoding="utf-8") as f:
                saved = json.load(f)
                for item in saved.get("bids", []):
                    # Ensure legacy fields upgrade gracefully
                    if "match_score" not in item:
                        score, tier = calculate_match_score(
                            title=item.get("title", ""),
                            category=item.get("category", ""),
                            full_cats=item.get("full_categories", ""),
                            matched_keywords=item.get("matched_keywords", []),
                            is_high_value=bool(item.get("is_high_value", False)),
                            quantity=item.get("quantity", 0) if isinstance(item.get("quantity", 0), (int, float)) else 0,
                            end_date_str=item.get("end_date", "")
                        )
                        item["match_score"] = score
                        item["priority_tier"] = tier
                        item.setdefault("is_high_value", False)
                        item.setdefault("ministry", "")
                        item.setdefault("estimated_value_indicator", "High Value (>= ₹2 Crore)" if item.get("is_high_value") else "Standard Scale")
                    existing_bids[item["id"]] = item
            logger.info(f"Loaded {len(existing_bids)} existing bids from {source_file}")
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
                        # Re-calculate match score with expanded keywords
                        score, tier = calculate_match_score(
                            title=existing.get("title") or clean["title"],
                            category=existing.get("category") or clean["category"],
                            full_cats=existing.get("full_categories") or clean["full_categories"],
                            matched_keywords=existing.get("matched_keywords", []),
                            is_high_value=clean["is_high_value"] or existing.get("is_high_value", False),
                            quantity=clean["quantity"],
                            end_date_str=clean["end_date"] or existing.get("end_date", "")
                        )
                        existing["match_score"] = score
                        existing["priority_tier"] = tier
                        existing["is_high_value"] = clean["is_high_value"]
                        existing["estimated_value_indicator"] = clean["estimated_value_indicator"]
                        existing["ministry"] = clean["ministry"] or existing.get("ministry", "")
                        existing["end_date"] = clean["end_date"] or existing.get("end_date")
                        existing["category"] = clean["category"] or existing.get("category")
                        existing["scraped_at"] = clean["scraped_at"]
                        updated_count += 1
                    else:
                        existing_bids[bid_id] = clean
                        new_count += 1

                time.sleep(1.0)  # Gentle delay between queries
            except Exception as e:
                logger.error(f"Error querying '{kw}' page {page}: {e}")
                break

    all_bids = list(existing_bids.values())
    # Sort primarily by match_score descending, secondarily by end_date descending
    all_bids.sort(key=lambda x: (x.get("match_score", 0), x.get("end_date", "")), reverse=True)

    payload = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "total_bids": len(all_bids),
        "bids": all_bids
    }

    sync_data_files(payload)

    logger.info(f"Done! Scraped {new_count} new bids, updated {updated_count}. Total stored: {len(all_bids)}")
    return payload


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Scrape Government e-Marketplace (GeM) bids.")
    parser.add_argument("--keywords", nargs="+", help="Specific keywords to search for")
    parser.add_argument("--pages", type=int, default=2, help="Max pages per keyword (10 bids/page)")
    args = parser.parse_args()

    run_scraper(keywords=args.keywords, max_pages_per_keyword=args.pages)
