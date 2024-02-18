// import scrapePage from "./scrapePage.js";
import { initDB, closeDB } from "./duckdb_instance.js";
import { fetchAndSaveAllKecamatan, fetchAndSaveAllKelurahan, fetchAndSaveAllKota, fetchAndSaveAllProvinsi, fetchAndSaveAllTPS, fetchAndSaveAllSuara } from "./scrape_pilpres.js";

try {
    const con = await initDB();
    console.log("init db")
    console.log(con);

    // await fetchAndSaveAllProvinsi(con);

    // await fetchAndSaveAllKota(con);

    // await fetchAndSaveAllKecamatan(con);

    // await fetchAndSaveAllKelurahan(con);

    // await fetchAndSaveAllTPS(con);

    await fetchAndSaveAllSuara(con);

    await closeDB(con);
}
catch (error) {
    console.error(error)
}
