import { Database } from "duckdb-async";

export async function initDB() {

    try {
        const db = await Database.create("./pemilu2024-kpu.duckdb");

        const con = await db.connect();

        // Create a table if it doesn't exist
        await con.run(`
            CREATE TABLE IF NOT EXISTS provinsi_data (
                id INTEGER PRIMARY KEY NOT NULL,
                nama TEXT NOT NULL,
                kode TEXT NOT NULL,
                tingkat INTEGER NOT NULL,
                lastupdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS kota_data (
                id INTEGER PRIMARY KEY NOT NULL,
                nama TEXT NOT NULL,
                kode TEXT NOT NULL,
                tingkat INTEGER NOT NULL,
                lastupdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS kecamatan_data (
                id INTEGER PRIMARY KEY NOT NULL,
                nama TEXT NOT NULL,
                kode TEXT NOT NULL,
                tingkat INTEGER NOT NULL,
                lastupdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS kelurahan_data (
                id INTEGER PRIMARY KEY NOT NULL,
                nama TEXT NOT NULL,
                kode TEXT NOT NULL,
                tingkat INTEGER NOT NULL,
                lastupdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS tps_data (
                id INTEGER PRIMARY KEY NOT NULL,
                nama TEXT NOT NULL,
                kode TEXT NOT NULL,
                tingkat INTEGER NOT NULL,
                lastupdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS suara_data (
                id VARCHAR(36) PRIMARY KEY NOT NULL,
                origin_url TEXT NOT NULL,
                jumlah_suara_pasangan01_anies_imin INTEGER,
                jumlah_suara_pasangan02_prabowo_gibran INTEGER,
                jumlah_suara_pasangan03_ganjar_mahfud INTEGER,
                image_urls TEXT,
                suara_sah INTEGER,
                suara_tidak_sah INTEGER,
                suara_total INTEGER,
                pemilih_dpt_total INTEGER,
                pemilih_dpt_lelaki INTEGER,
                pemilih_dpt_perempuan INTEGER,
                pengguna_dpt_total INTEGER,
                pengguna_dpt_lelaki INTEGER,
                pengguna_dpt_perempuan INTEGER,
                pengguna_dptb_total INTEGER,
                pengguna_dptb_lelaki INTEGER,
                pengguna_dptb_perempuan INTEGER,
                pengguna_total INTEGER,
                pengguna_total_lelaki INTEGER,
                pengguna_total_perempuan INTEGER,
                pengguna_non_dpt_total INTEGER,
                pengguna_non_dpt_lelaki INTEGER,
                pengguna_non_dpt_perempuan INTEGER,
                psu TEXT,
                status_suara BOOLEAN,
                status_adm BOOLEAN,
                ts TIMESTAMP,
                lastupdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Table created or already exists.');
        return con;
    }
    catch (error) {
        console.error('Error working with the database:', error);
    }
}

export async function insertPemiluData(db, pemiluData) {
    const { url, province, district, sub_district, village, tps, dpt_voters, dptb_voters, dpk_voters, total_voters, candidate01_anies_imin_votes, candidate02_prabowo_gibran_votes, candidate03_ganjar_mahfud_votes, valid_votes, invalid_votes, total_valid_and_invalid_votes } = pemiluData;

    const insertQuery = `INSERT INTO election_data (
        url,
        province, 
        district, 
        sub_district, 
        village, 
        tps, 
        dpt_voters, 
        dptb_voters, 
        dpk_voters, 
        total_voters, 
        candidate01_anies_imin_votes, 
        candidate02_prabowo_gibran_votes, 
        candidate03_ganjar_mahfud_votes, 
        valid_votes, 
        invalid_votes, 
        total_valid_and_invalid_votes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

    const insert_data = [url, province, district, sub_district, village, tps, dpt_voters, dptb_voters, dpk_voters, total_voters, candidate01_anies_imin_votes, candidate02_prabowo_gibran_votes, candidate03_ganjar_mahfud_votes, valid_votes, invalid_votes, total_valid_and_invalid_votes];

    try {
        const result = await db.run(insertQuery, insert_data);
        console.log(`A row has been inserted with rowid: ${result.lastID}`);
    } catch (error) {
        console.error(error);
    }
}

export async function closeDB(db) {
    console.log(db)
    return await db.close();
}