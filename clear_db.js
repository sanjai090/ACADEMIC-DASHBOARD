const db = require('./server/database');

async function clearDB() {
    try {
        console.log("Clearing all users (except admin) from PostgreSQL...");
        const result = await db.query("DELETE FROM users WHERE reg_no != 'admin'");
        console.log(`Database cleared successfully. Deleted ${result.rowCount} users.`);
        process.exit(0);
    } catch (err) {
        console.error("Error clearing DB:", err);
        process.exit(1);
    }
}

setTimeout(clearDB, 1000);
