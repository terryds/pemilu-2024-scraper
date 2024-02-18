# Pemilu 2024 Scraper

Fast, simple script to scrape from Pemilu KPU 2024 (Indonesian General Election)

- Data retrieved from Sirekap API that's being called from pemilu2024.kpu.go.id (take a look at the browser's network request)
- Added batching mechanism (search for 'while' loop in scrape_pilpres.js), feel free to adjust to your machine's requirement
- Dump all data to DuckDB

To do:
- [x] Script
- [ ] Better documentation, code comments, refactor
- [ ] Landing page (github pages or others)
- [ ] Data visualization with DuckDB

Currently, the scraping is only for presidential election votes.
Will add support for legislative votes later.