const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306')
};

const dbName = process.env.DB_NAME || 'cgpa_db';

async function setupDatabase() {
    let connection;
    try {
        console.log(`Connecting to MySQL server at ${dbConfig.host}:${dbConfig.port}...`);
        connection = await mysql.createConnection(dbConfig);
        
        console.log(`Creating database '${dbName}' if not exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.query(`USE \`${dbName}\``);
        
        console.log("Creating 'users' table...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                reg_no VARCHAR(50) PRIMARY KEY,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) DEFAULT '',
                date_of_birth DATE NULL,
                current_semester INT DEFAULT 1,
                onboarding_complete BOOLEAN DEFAULT FALSE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        console.log("Creating 'results' table...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reg_no VARCHAR(50),
                semester INT,
                subject_name VARCHAR(255),
                grade VARCHAR(10),
                credits INT,
                grade_points INT,
                FOREIGN KEY (reg_no) REFERENCES users(reg_no) ON DELETE CASCADE,
                INDEX idx_reg_semester (reg_no, semester)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        console.log("Creating 'semester_summaries' table...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS semester_summaries (
                reg_no VARCHAR(50),
                semester INT,
                gpa DECIMAL(4, 2) DEFAULT 0.00,
                total_credits INT DEFAULT 0,
                PRIMARY KEY (reg_no, semester),
                FOREIGN KEY (reg_no) REFERENCES users(reg_no) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        console.log("Checking for 'admin' user...");
        const [rows] = await connection.query('SELECT * FROM users WHERE reg_no = ?', ['admin']);
        if (rows.length === 0) {
            console.log("Creating default 'admin' user in users table...");
            await connection.query(`
                INSERT INTO users (reg_no, password, full_name, date_of_birth, current_semester, onboarding_complete)
                VALUES (?, ?, ?, ?, ?, ?)
            `, ['admin', 'admin123', 'Administrator', null, 0, true]);
        }

        console.log("Database and tables initialized successfully.");
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error("Database setup failed:", err);
        if (connection) {
            try {
                await connection.end();
            } catch (e) {
                console.error("Failed to close connection:", e);
            }
        }
        process.exit(1);
    }
}

setupDatabase();
