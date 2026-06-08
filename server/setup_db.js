const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function setupDatabase() {
    const client = process.env.DATABASE_URL
        ? new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        })
        : new Client({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'cgpa_db',
            port: parseInt(process.env.DB_PORT || '5432'),
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        });

    try {
        console.log('Connecting to PostgreSQL...');
        await client.connect();

        console.log("Creating 'users' table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                reg_no VARCHAR(50) PRIMARY KEY,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) DEFAULT '',
                date_of_birth DATE,
                current_semester INT DEFAULT 1,
                onboarding_complete BOOLEAN DEFAULT FALSE
            );
        `);

        console.log("Creating 'results' table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS results (
                id SERIAL PRIMARY KEY,
                reg_no VARCHAR(50) REFERENCES users(reg_no) ON DELETE CASCADE,
                semester INT,
                subject_name VARCHAR(255),
                grade VARCHAR(10),
                credits INT,
                grade_points INT
            );
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_results_reg_semester ON results(reg_no, semester);
        `);

        console.log("Creating 'semester_summaries' table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS semester_summaries (
                reg_no VARCHAR(50) REFERENCES users(reg_no) ON DELETE CASCADE,
                semester INT,
                gpa NUMERIC(4,2) DEFAULT 0.00,
                total_credits INT DEFAULT 0,
                PRIMARY KEY (reg_no, semester)
            );
        `);

        console.log("Checking for 'admin' user...");
        const { rows } = await client.query('SELECT reg_no FROM users WHERE reg_no = $1', ['admin']);
        if (rows.length === 0) {
            console.log("Creating default 'admin' user...");
            await client.query(
                'INSERT INTO users (reg_no, password, full_name, date_of_birth, current_semester, onboarding_complete) VALUES ($1, $2, $3, $4, $5, $6)',
                ['admin', 'admin123', 'Administrator', null, 0, true]
            );
        }

        console.log('Database and tables initialized successfully.');
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('Database setup failed:', err);
        try { await client.end(); } catch (e) {}
        process.exit(1);
    }
}

setupDatabase();
