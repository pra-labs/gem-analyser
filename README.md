# ⚡ GeM Tender Analyser (`gem-analyser`)

> High-speed public procurement scanner, real-time crawler, and interactive dashboard for Government e-Marketplace (GeM) tenders tailored for software, AI/ML, data analytics, IoT, and mobility solutions.

[![Scraper Status](https://github.com/pra-labs/gem-analyser/actions/workflows/scraper.yml/badge.svg)](https://github.com/pra-labs/gem-analyser/actions/workflows/scraper.yml)
[![PraLabs](https://img.shields.io/badge/Studio-PraLabs-blue.svg)](https://pralabs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Why GeM Analyser?

The official Government e-Marketplace (`bidplus.gem.gov.in`) portal has slow pagination, frequent session timeouts, and weak keyword relevance filtering. 

**GeM Tender Analyser** solves this by:
1. **Automated Continuous Scraping**: GitHub Actions queries the GeM internal API every 6 hours and merges live tenders.
2. **Instant Search & Highlighting**: Zero-latency full-text client-side searching across bid numbers, descriptions, departments, and keywords.
3. **Smart Urgency Alerts**: Visual urgency tags (`Urgent (≤3d)`, `Closing Soon (≤7d)`).
4. **Direct PDF Links**: 1-click access to download the official tender specification document.
5. **No External Python Dependencies**: The scraper runs purely on Python standard library (`urllib`, `http.cookiejar`, `json`, `re`).

---

## 🏗️ Architecture

```text
gem-analyser/
├── .github/workflows/
│   └── scraper.yml        # Scheduled runner (every 6h) to pull live GeM tenders & commit
├── data/
│   └── bids.json          # Master database of deduplicated, active tenders
├── scraper/
│   └── scrape.py          # Pure Python GeM API scraper with auto CSRF session handling
└── web/
    └── index.html         # Responsive, dark-mode tender discovery UI
```

---

## 🚀 Quickstart

### 1. Manual Scrape
You can run the scraper locally without installing any third-party dependencies:

```bash
# Scrape default keywords (AI, ML, Chatbots, Data Analytics, Smart Parking, etc.)
python3 scraper/scrape.py --pages 2

# Scrape specific custom keywords
python3 scraper/scrape.py --keywords "Computer Vision" "Electric Vehicle" --pages 3
```

### 2. View the Dashboard Locally
Run any lightweight static server:

```bash
cd gem-analyser
python3 -m http.server 8080
# Open http://localhost:8080/web/ in your browser
```

---

## 🎯 Target Categories Monitored

* **AI & Machine Learning**: Conversational AI, Chatbots, Computer Vision, Audio/Video analytics
* **Data Science & BI**: Dashboards, Data Lakehouses, Reporting Systems
* **Smart Cities & IoT**: Parking Management, EV Charging CMS, Edge Sensors
* **Software Engineering**: Custom Software Development, Portal & Mobile App Dev

---

## 📄 License
MIT © [PraLabs](https://github.com/pra-labs)
