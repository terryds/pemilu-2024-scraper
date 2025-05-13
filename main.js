// import scrapePage from "./scrapePage.js";
import { initDB, closeDB } from "./duckdb_instance.js";
import { fetchAndSaveAllKecamatan, fetchAndSaveAllKelurahan, fetchAndSaveAllKota, fetchAndSaveAllProvinsi, fetchAndSaveAllTPS, fetchAndSaveAllSuara } from "./scrape_pilpres.js";

// Helper function to run a task with proper error handling
async function runTask(taskName, taskFn, ...args) {
    console.log(`\n[${new Date().toISOString()}] Starting task: ${taskName}`);
    try {
        await taskFn(...args);
        console.log(`\n[${new Date().toISOString()}] Successfully completed task: ${taskName}`);
        return true;
    } catch (error) {
        console.error(`\n[${new Date().toISOString()}] Error in task ${taskName}:`, error);
        return false;
    }
}

// Main execution function
async function main() {
    let con;
    try {
        console.log(`\n[${new Date().toISOString()}] Initializing database...`);
        con = await initDB();
        console.log("Database initialized successfully.");

        // Uncomment tasks as needed
        // await runTask('Fetch and save all provinsi', fetchAndSaveAllProvinsi, con);
        // await runTask('Fetch and save all kota', fetchAndSaveAllKota, con);
        // await runTask('Fetch and save all kecamatan', fetchAndSaveAllKecamatan, con);
        
        // Continue only if the previous task was successful
        if (await runTask('Fetch and save all kelurahan', fetchAndSaveAllKelurahan, con)) {
            if (await runTask('Fetch and save all TPS', fetchAndSaveAllTPS, con)) {
                await runTask('Fetch and save all suara', fetchAndSaveAllSuara, con);
            }
        }
    } catch (error) {
        console.error('Critical error in main execution:', error);
    } finally {
        if (con) {
            try {
                console.log(`\n[${new Date().toISOString()}] Closing database connection...`);
                await closeDB(con);
                console.log('Database connection closed successfully.');
            } catch (closeError) {
                console.error('Error closing database connection:', closeError);
            }
        }
    }
}

// Start the execution
main().catch(err => {
    console.error('Unhandled error in main process:', err);
    process.exit(1);
});
