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
                provinsi_id INTEGER REFERENCES provinsi_data(id),
                lastupdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS kecamatan_data (
                id INTEGER PRIMARY KEY NOT NULL,
                nama TEXT NOT NULL,
                kode TEXT NOT NULL,
                tingkat INTEGER NOT NULL,
                kota_id INTEGER REFERENCES kota_data(id),
                lastupdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS kelurahan_data (
                id INTEGER PRIMARY KEY NOT NULL,
                nama TEXT NOT NULL,
                kode TEXT NOT NULL,
                tingkat INTEGER NOT NULL,
                kecamatan_id INTEGER REFERENCES kecamatan_data(id),
                lastupdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS tps_data (
                id INTEGER PRIMARY KEY NOT NULL,
                nama TEXT NOT NULL,
                kode TEXT NOT NULL,
                tingkat INTEGER NOT NULL,
                kelurahan_id INTEGER REFERENCES kelurahan_data(id),
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
                tps_id INTEGER REFERENCES tps_data(id),
                lastupdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            );
            CREATE VIEW suara_detailed_view AS
                SELECT 
                    sd.id,
                    sd.origin_url,
                    sd.jumlah_suara_pasangan01_anies_imin,
                    sd.jumlah_suara_pasangan02_prabowo_gibran,
                    sd.jumlah_suara_pasangan03_ganjar_mahfud,
                    sd.image_urls,
                    sd.suara_sah,
                    sd.suara_tidak_sah,
                    sd.suara_total,
                    sd.pemilih_dpt_total,
                    sd.pemilih_dpt_lelaki,
                    sd.pemilih_dpt_perempuan,
                    sd.pengguna_dpt_total,
                    sd.pengguna_dpt_lelaki,
                    sd.pengguna_dpt_perempuan,
                    sd.pengguna_dptb_total,
                    sd.pengguna_dptb_lelaki,
                    sd.pengguna_dptb_perempuan,
                    sd.pengguna_total,
                    sd.pengguna_total_lelaki,
                    sd.pengguna_total_perempuan,
                    sd.pengguna_non_dpt_total,
                    sd.pengguna_non_dpt_lelaki,
                    sd.pengguna_non_dpt_perempuan,
                    sd.psu,
                    sd.status_suara,
                    sd.status_adm,
                    sd.ts,
                    sd.lastupdated,
                    tps.nama AS nama_tps,
                    kel.nama AS nama_kelurahan,
                    kec.nama AS nama_kecamatan,
                    kot.nama AS nama_kota,
                    prov.nama AS nama_provinsi
                FROM 
                    suara_data sd
                    JOIN tps_data tps ON sd.tps_id = tps.id
                    JOIN kelurahan_data kel ON tps.kelurahan_id = kel.id
                    JOIN kecamatan_data kec ON kel.kecamatan_id = kec.id
                    JOIN kota_data kot ON kec.kota_id = kot.id
                    JOIN provinsi_data prov ON kot.provinsi_id = prov.id;

        `);

        console.log('Table created or already exists.');
        return con;
    }
    catch (error) {
        console.error('Error working with the database:', error);
    }
}

export async function closeDB(db) {
    console.log(db)
    return await db.close();
}