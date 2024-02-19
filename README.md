# Pemilu 2024 Scraper to DuckDB

Fast, simple script to scrape from Pemilu KPU 2024 (Indonesian General Election)

- Data retrieved from Sirekap API that's being called from pemilu2024.kpu.go.id (take a look at the browser's network request)
- Added batching mechanism (search for 'while' loop in scrape_pilpres.js), feel free to adjust to your machine's requirement
- Dump all data to DuckDB

To do:
- [x] Script
- [ ] Better documentation, code comments, cleaning the code
- [ ] Landing page (github pages or others)
- [ ] Data visualization with DuckDB

Currently, the scraping is only for presidential election votes.
Will add support for legislative votes later.

# Why DuckDB?

It's blazingly fast.
I tried to query the total sum of the votes & the result was very instant (less than one second) considering the table has ~100 million rows.
Give it a try if you haven't used DuckDB: https://duckdb.org 
I also use DBeaver for the GUI (it supports DuckDB!): https://dbeaver.io

# Database

You can check the generated DuckDB file at `pemilu2024-kpu.duckdb`

If you don't want to run the script yourself & want to directly download the database, you can [download the generated database through our Release page](https://github.com/terryds/pemilu-2024-scraper/releases)
However, please note that the database might not contain the latest data.

# Usage

Run 
```
npm install
node main.js
```

I'm using Node version v18.16.0 as of now.
If you already have generated a database before and want to run this again, you need to delete `pemilu2024-kpu.duckdb`



# Possible issue

## Axios error related to buffer memory

Try reducing the batch size processing in the code.

For example, in scrape_pilpres line 213 function "fetchAndSaveAllTPS"
```
        while (requestPromises.length > 0) {
            console.log("in loop", requestPromises.length);
            let batch = requestPromises.splice(0, 100);
            let batch_results = await Promise.all(batch.map(f => f()));
            let batch_results_data = batch_results.map(response => response.data);
            results.push(...batch_results_data);
        }
```
I haven't applied the batch processing in scraping kota, kecamatan, and provinsi data though.
If your machine generates error because of the lack of memory, you can try batching it as well


**Feel free to create an issue if you encounter other error**

# LICENSE

This project is released under the MIT License.

While this project is open-source and free to use, I would appreciate it if users could provide credit when using or referencing my work in their projects or publications.
A simple acknowledgment or link back to this repository would be greatly appreciated

# Contact

Terry Djony
- LinkedIn: https://www.linkedin.com/in/terry-djony/
- Twitter: https://twitter.com/Terry_Djony