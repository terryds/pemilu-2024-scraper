import axios from 'axios'

import { returnNullOrInteger } from './helper.js';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const axios_config = {
	headers: {
		"Referer": "https://pemilu2024.kpu.go.id"
	}
};

export async function fetchAndSaveAllProvinsi(db) {
    try {
        console.log('Begin Provinsi')
        const { data } = await axios.get("https://sirekap-obj-data.kpu.go.id/wilayah/pemilu/ppwp/0.json", axios_config);

        const insertQuery = `INSERT INTO provinsi_data (
            id,
            nama,
            kode,
            tingkat
          ) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING;`;
    
        const insertData = data;

        console.log(insertData)

        await db.run('BEGIN TRANSACTION');

        const stmt = await db.prepare(insertQuery);

        for (const row of insertData) {
            console.log(row)
            await stmt.run(row.id, row.nama, row.kode, row.tingkat);
        }

        await stmt.finalize();
        // Commit transaction
        await db.run('COMMIT');

        console.log('Rows Provinsi inserted successfully');

    } catch (error) {
        console.error(error)
        await db.run('ROLLBACK');
        
    }
}

export async function fetchAndSaveAllKota(db) {
    try {
        console.log('Begin Kota')
        const selectQuery = `SELECT kode, id FROM provinsi_data`;

        const rows = await db.all(selectQuery);

        let requestPromises = [];
        let provinsi_ids = []

        for (const row of rows) {
            requestPromises.push(axios.get(`https://sirekap-obj-data.kpu.go.id/wilayah/pemilu/ppwp/${row.kode}.json`, axios_config))
            provinsi_ids.push(row.id)
        }

        await db.run('BEGIN TRANSACTION');

        const responses = await Promise.all(requestPromises);

        const insertQuery = `INSERT INTO kota_data (
            id,
            nama,
            kode,
            tingkat,
            provinsi_id
        ) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING;`;

        const stmt = await db.prepare(insertQuery);

        for (let index = 0; index < responses.length; index++) {
            const response = responses[index];
            console.log(response.data);
            response.data.forEach(async (row) => {
                console.log(row);
                await stmt.run(row.id, row.nama, row.kode, row.tingkat, provinsi_ids[index]);
            })
        }

        await stmt.finalize();

        await db.run('COMMIT');
        
        console.log('Rows Kota inserted successfully');


    } catch (error) {
        console.error(error);
        await db.run('ROLLBACK');

    }
}

export async function fetchAndSaveAllKecamatan(db) {
    try {
        console.log('Begin Kecamatan')
        const selectQuery = `SELECT kode, id FROM kota_data`;

        const rows = await db.all(selectQuery);

        let requestPromises = [];
        let kota_ids = [];

        for (const row of rows) {
            requestPromises.push(axios.get(`https://sirekap-obj-data.kpu.go.id/wilayah/pemilu/ppwp/${row.kode.substring(0, 2)}/${row.kode}.json`, axios_config))
            kota_ids.push(row.id)
        }

        await db.run('BEGIN TRANSACTION');

        const responses = await Promise.all(requestPromises);

        const insertQuery = `INSERT INTO kecamatan_data (
            id,
            nama,
            kode,
            tingkat,
            kota_id
          ) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING;`;

        const stmt = await db.prepare(insertQuery);

        for (let index = 0; index < responses.length; index++) {
            const response = responses[index];
            console.log(response.data);
            response.data.forEach(async (row) => {
                console.log(row);
                await stmt.run(row.id, row.nama, row.kode, row.tingkat, kota_ids[index]);
            })
        }

        await stmt.finalize();

        await db.run('COMMIT');

        console.log('Rows Kecamatan inserted successfully');

    } catch (error) {
        console.error(error)
        await db.run('ROLLBACK');
    }
}

export async function fetchAndSaveAllKelurahan(db) {
    try {
        console.log('Begin Kelurahan')
        const selectQuery = `SELECT kode, id FROM kecamatan_data`;

        const rows = await db.all(selectQuery);

        let requestPromises = [];
        let kecamatan_ids = [];

        for (const row of rows) {
            let row_promise = axios.get(`https://sirekap-obj-data.kpu.go.id/wilayah/pemilu/ppwp/${row.kode.substring(0, 2)}/${row.kode.substring(0, 4)}/${row.kode}.json`, axios_config);
            requestPromises.push(() => row_promise);
            kecamatan_ids.push(row.id);
        }

        await db.run('BEGIN TRANSACTION');

        let results = [];

        while (requestPromises.length > 0) {
            console.log("in loop");
            console.log(`length: ${requestPromises.length}`);
            const batch = requestPromises.splice(0, 100);
            console.log(`length after splice: ${requestPromises.length}`);
            let batch_results = await Promise.all(batch.map(f => f()));
            let batch_results_data = batch_results.map(response => response.data);
            // console.log("batch result completed", batch_results_data);
            results.push(...batch_results_data);
        }
        
        const insertQuery = `INSERT INTO kelurahan_data (
            id,
            nama,
            kode,
            tingkat,
            kecamatan_id
          ) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING;`;

        const stmt = await db.prepare(insertQuery);

        for (let index = 0; index < results.length; index++) {
            const result = results[index];
            console.log(result);
            result.forEach(async (row) => {
                console.log(row);
                await stmt.run(row.id, row.nama, row.kode, row.tingkat, kecamatan_ids[index]);
            })
        }

        await stmt.finalize();

        await db.run('COMMIT');

        console.log('Rows Kelurahan inserted successfully');

    } catch (error) {
        console.error(error)
        await db.run('ROLLBACK');

    }
}

export async function fetchAndSaveAllTPS(db) {
    try {        
        console.log('Begin TPS');
        const selectQuery = `SELECT kode, id FROM kelurahan_data`;

        const rows = await db.all(selectQuery);
        let requestPromises = [];
        let kelurahan_ids = [];


        console.log("start loop")
        for (const row of rows) {
            requestPromises.push(() => axios.get(`https://sirekap-obj-data.kpu.go.id/wilayah/pemilu/ppwp/${row.kode.substring(0, 2)}/${row.kode.substring(0, 4)}/${row.kode.substring(0, 6)}/${row.kode}.json`, axios_config));
            kelurahan_ids.push(row.id);
        }
        console.log("end loop")

        await db.run('BEGIN TRANSACTION');

        let results = [];

        while (requestPromises.length > 0) {
            console.log("in loop", requestPromises.length);
            let batch = requestPromises.splice(0, 100);
            let batch_results;
            try {
                batch_results = await Promise.all(batch.map(f => f()));
            } catch (error) {
                console.error(error)
                console.log("got some error, will sleep 1 sec and try again")
                await sleep(1000)
                batch_results = await Promise.all(batch.map(f => f()));
            }
            let batch_results_data = batch_results.map(response => response.data);
            results.push(...batch_results_data);
        }

        const insertQuery = `INSERT INTO tps_data (
            id,
            nama,
            kode,
            tingkat,
            kelurahan_id
          ) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING;`;

        const stmt = await db.prepare(insertQuery);

        for (let index = 0; index < results.length; index++) {
            const result = results[index];
            console.log(result);
            result.forEach(async (row) => {
                console.log(row);
                await stmt.run(row.id, row.nama, row.kode, row.tingkat, kelurahan_ids[index]);
            })
        }

        await stmt.finalize();

        await db.run('COMMIT');

        console.log('Rows TPS inserted successfully');

    } catch (error) {
        console.error(error)
        await db.run('ROLLBACK');
    }
}


export async function fetchAndSaveAllSuara(db) {
    try {
        console.log("begin fetch and save all suara")
        const selectQuery = `SELECT kode, id FROM tps_data`;

        const rows = await db.all(selectQuery);

        let kode_as_id = [];

        let requestPromises = [];

        let tps_ids = [];

        let results = [];

        console.log("before for of loop")
        for (const row of rows) {
            requestPromises.push(() => axios.get(`https://sirekap-obj-data.kpu.go.id/pemilu/hhcw/ppwp/${row.kode.substring(0, 2)}/${row.kode.substring(0, 4)}/${row.kode.substring(0, 6)}/${row.kode.substring(0, 10)}/${row.kode}.json`, axios_config));
            kode_as_id.push(row.kode);
            tps_ids.push(row.id);
        }
        console.log("after for of loop")


        while (requestPromises.length > 0) {
            console.log("in loop", requestPromises.length);
            let batch = requestPromises.splice(0, 200);
            let batch_results;
            try {
                batch_results = await Promise.all(batch.map(f => f()));
            } catch (error) {
                console.error(error)
                console.log("got some error, will sleep 1 sec and try again")
                await sleep(1000)
                batch_results = await Promise.all(batch.map(f => f()));
            }
            let batch_results_data = batch_results.map(response => response.data);
            results.push(...batch_results_data);
        }
        
        await db.run('BEGIN TRANSACTION');

        const insertQuery = `INSERT INTO suara_data (
            id,
            origin_url,
            jumlah_suara_pasangan01_anies_imin,
            jumlah_suara_pasangan02_prabowo_gibran,
            jumlah_suara_pasangan03_ganjar_mahfud,
            image_urls,
            suara_sah,
            suara_tidak_sah,
            suara_total,
            pemilih_dpt_total,
            pemilih_dpt_lelaki,
            pemilih_dpt_perempuan,
            pengguna_dpt_total,
            pengguna_dpt_lelaki,
            pengguna_dpt_perempuan,
            pengguna_dptb_total,
            pengguna_dptb_lelaki,
            pengguna_dptb_perempuan,
            pengguna_total,
            pengguna_total_lelaki,
            pengguna_total_perempuan,
            pengguna_non_dpt_total,
            pengguna_non_dpt_lelaki,
            pengguna_non_dpt_perempuan,
            psu,
            status_suara,
            status_adm,
            ts,
            tps_id
          ) VALUES (?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?) ON CONFLICT DO NOTHING;`;

        const stmt = await db.prepare(insertQuery);

        for (let index = 0; index < results.length; index++) {
            const result = results[index];
            console.log(kode_as_id[index]);
            console.log(result);
            let origin_url = `https://pemilu2024.kpu.go.id/pilpres/hitung-suara/${kode_as_id[index].substring(0, 2)}/${kode_as_id[index].substring(0, 4)}/${kode_as_id[index].substring(0, 6)}/${kode_as_id[index].substring(0, 10)}/${kode_as_id[index]}`;

            let jumlah_suara_pasangan01_anies_imin = (result.chart && result.chart["100025"]) ? returnNullOrInteger(result.chart["100025"]) : null;
            let jumlah_suara_pasangan02_prabowo_gibran = (result.chart && result.chart["100026"]) ? returnNullOrInteger(result.chart["100026"]) : null;
            let jumlah_suara_pasangan03_ganjar_mahfud = (result.chart && result.chart["100027"]) ? returnNullOrInteger(result.chart["100027"]) : null;
            let image_urls  = (result.images && Array.isArray(result.images)) ? result.images.join(', ') : null;
            let suara_sah = (result.administrasi && result.administrasi.suara_sah) ? returnNullOrInteger(result.administrasi.suara_sah) : null;
            let suara_tidak_sah  = (result.administrasi && result.administrasi.suara_tidak_sah) ? returnNullOrInteger(result.administrasi.suara_tidak_sah) : null;
            let suara_total = (result.administrasi && result.administrasi.suara_total) ? returnNullOrInteger(result.administrasi.suara_total) : null;
            let pemilih_dpt_total  = (result.administrasi && result.administrasi.pemilih_dpt_j) ? returnNullOrInteger(result.administrasi.pemilih_dpt_j) : null;
            let pemilih_dpt_lelaki  = (result.administrasi && result.administrasi.pemilih_dpt_l) ? returnNullOrInteger(result.administrasi.pemilih_dpt_l) : null;
            let pemilih_dpt_perempuan = (result.administrasi && result.administrasi.pemilih_dpt_p) ? returnNullOrInteger(result.administrasi.pemilih_dpt_p) : null;
            let pengguna_dpt_total = (result.administrasi && result.administrasi.pengguna_dpt_j) ? returnNullOrInteger(result.administrasi.pengguna_dpt_j) : null;
            let pengguna_dpt_lelaki  = (result.administrasi && result.administrasi.pengguna_dpt_l) ? returnNullOrInteger(result.administrasi.pengguna_dpt_l) : null;
            let pengguna_dpt_perempuan  = (result.administrasi && result.administrasi.pengguna_dpt_p) ? returnNullOrInteger(result.administrasi.pengguna_dpt_p) : null;
            let pengguna_dptb_total  = (result.administrasi && result.administrasi.pengguna_dptb_j) ? returnNullOrInteger(result.administrasi.pengguna_dptb_j) : null;
            let pengguna_dptb_lelaki   = (result.administrasi && result.administrasi.pengguna_dptb_l) ? returnNullOrInteger(result.administrasi.pengguna_dptb_l) : null;
            let pengguna_dptb_perempuan  = (result.administrasi && result.administrasi.pengguna_dptb_p) ? returnNullOrInteger(result.administrasi.pengguna_dptb_p) : null;
            let pengguna_total = (result.administrasi && result.administrasi.pengguna_total_j) ? returnNullOrInteger(result.administrasi.pengguna_total_j) : null;
            let pengguna_total_lelaki  = (result.administrasi && result.administrasi.pengguna_total_l) ? returnNullOrInteger(result.administrasi.pengguna_total_l) : null;
            let pengguna_total_perempuan  = (result.administrasi && result.administrasi.pengguna_total_p) ? returnNullOrInteger(result.administrasi.pengguna_total_p) : null;
            let pengguna_non_dpt_total = (result.administrasi && result.administrasi.pengguna_non_dpt_j) ? returnNullOrInteger(result.administrasi.pengguna_non_dpt_j) : null;
            let pengguna_non_dpt_lelaki = (result.administrasi && result.administrasi.pengguna_non_dpt_l) ? returnNullOrInteger(result.administrasi.pengguna_non_dpt_l) : null;
            let pengguna_non_dpt_perempuan = (result.administrasi && result.administrasi.pengguna_non_dpt_p) ? returnNullOrInteger(result.administrasi.pengguna_non_dpt_p) : null;
            let psu = result.psu ?? null;
            let status_suara = result.status_suara ?? null;
            let status_adm = result.status_adm ?? null;
            let ts = result.ts ?? null;

            await stmt.run(
                kode_as_id[index],
                origin_url,
                jumlah_suara_pasangan01_anies_imin,
                jumlah_suara_pasangan02_prabowo_gibran,
                jumlah_suara_pasangan03_ganjar_mahfud,
                image_urls,
                suara_sah,
                suara_tidak_sah,
                suara_total,
                pemilih_dpt_total,
                pemilih_dpt_lelaki,
                pemilih_dpt_perempuan,
                pengguna_dpt_total,
                pengguna_dpt_lelaki,
                pengguna_dpt_perempuan,
                pengguna_dptb_total,
                pengguna_dptb_lelaki,
                pengguna_dptb_perempuan,
                pengguna_total,
                pengguna_total_lelaki,
                pengguna_total_perempuan,
                pengguna_non_dpt_total,
                pengguna_non_dpt_lelaki,
                pengguna_non_dpt_perempuan,
                psu,
                status_suara,
                status_adm,
                ts,
                tps_ids[index]
            );
            
        }

        await stmt.finalize();

        await db.run('COMMIT');

        console.log('Rows Suara inserted successfully');
    } catch (error) {
        console.error(error);
        await db.run('ROLLBACK');

    }
}

