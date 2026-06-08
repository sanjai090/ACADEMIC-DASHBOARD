const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Support both a full DATABASE_URL (Render provides this) or individual env vars
const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    })
    : new Pool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cgpa_db',
        port: parseInt(process.env.DB_PORT || '5432'),
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

console.log('PostgreSQL connection pool initialized.');

module.exports = {
    pool,
    query: (sql, params) => pool.query(sql, params)
};
