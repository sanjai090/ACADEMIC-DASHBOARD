require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'cgpa-secret-key-12345',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

const gradeToPoints = (grade) => {
    const points = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'U': 0 };
    return points[grade] || 0;
};

// --- AUTH ROUTES ---

// Registration
app.post('/api/register', async (req, res) => {
    const { reg_no, password, full_name, date_of_birth, current_semester } = req.body;
    try {
        const { rows: existing } = await db.query('SELECT reg_no FROM users WHERE reg_no = $1', [reg_no]);
        if (existing.length > 0) {
            return res.status(500).json({ error: 'User already exists or database error.' });
        }

        await db.query(
            'INSERT INTO users (reg_no, password, full_name, date_of_birth, current_semester, onboarding_complete) VALUES ($1, $2, $3, $4, $5, $6)',
            [reg_no, password, full_name || '', date_of_birth || null, current_semester || 1, false]
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'User already exists or database error.' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { reg_no, password } = req.body;

    try {
        const { rows } = await db.query('SELECT * FROM users WHERE reg_no = $1', [reg_no]);

        if (rows.length === 0) {
            if (reg_no === 'admin' && password === 'admin123') {
                req.session.user = { reg_no: 'admin', full_name: 'Administrator', isAdmin: true };
                return res.json({ success: true, user: req.session.user, isAdmin: true });
            }
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = rows[0];

        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        user.onboarding_complete = !!user.onboarding_complete;

        if (user.reg_no === 'admin') {
            req.session.user = { reg_no: 'admin', full_name: 'Administrator', isAdmin: true };
            return res.json({ success: true, user: req.session.user, isAdmin: true });
        }

        req.session.user = user;
        res.json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get Current User
app.get('/api/me', async (req, res) => {
    if (req.session.user) {
        if (req.session.user.isAdmin) {
            return res.json({ loggedIn: true, user: req.session.user, isAdmin: true });
        }
        try {
            const { rows } = await db.query('SELECT * FROM users WHERE reg_no = $1', [req.session.user.reg_no]);
            if (rows.length > 0) {
                const userData = rows[0];
                userData.onboarding_complete = !!userData.onboarding_complete;
                req.session.user = userData;
                res.json({ loggedIn: true, user: userData });
            } else {
                res.json({ loggedIn: false });
            }
        } catch (err) {
            res.status(500).json({ error: 'DB error' });
        }
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.post('/api/change-password', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    const { current_password, new_password } = req.body;
    const reg_no = req.session.user.reg_no;

    try {
        const { rows } = await db.query('SELECT * FROM users WHERE reg_no = $1', [reg_no]);

        if (rows.length === 0) {
            if (reg_no === 'admin' && current_password === 'admin123') {
                await db.query(
                    'INSERT INTO users (reg_no, password, full_name, date_of_birth, current_semester, onboarding_complete) VALUES ($1, $2, $3, $4, $5, $6)',
                    ['admin', new_password, 'Administrator', null, 0, true]
                );
                return res.json({ success: true });
            }
            return res.status(401).json({ error: 'Incorrect current password.' });
        }

        const user = rows[0];
        if (user.password !== current_password) {
            return res.status(401).json({ error: 'Incorrect current password.' });
        }

        await db.query('UPDATE users SET password = $1 WHERE reg_no = $2', [new_password, reg_no]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to change password.' });
    }
});

// --- DATA ROUTES ---

app.post('/api/upload-results', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    const { reg_no } = req.session.user;
    const { semester, subjects } = req.body;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        await client.query('DELETE FROM results WHERE reg_no = $1 AND semester = $2', [reg_no, Number(semester)]);

        let totalPoints = 0;
        let totalCredits = 0;

        for (const sub of subjects) {
            const points = gradeToPoints(sub.grade);
            await client.query(
                'INSERT INTO results (reg_no, semester, subject_name, grade, credits, grade_points) VALUES ($1, $2, $3, $4, $5, $6)',
                [reg_no, Number(semester), sub.name, sub.grade, Number(sub.credits), points]
            );
            totalPoints += (points * Number(sub.credits));
            totalCredits += Number(sub.credits);
        }

        const gpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;

        // Upsert semester summary (PostgreSQL syntax)
        await client.query(
            `INSERT INTO semester_summaries (reg_no, semester, gpa, total_credits)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (reg_no, semester) DO UPDATE SET gpa = EXCLUDED.gpa, total_credits = EXCLUDED.total_credits`,
            [reg_no, Number(semester), gpa, totalCredits]
        );

        await client.query('COMMIT');
        res.json({ success: true, gpa });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to upload results.' });
    } finally {
        client.release();
    }
});

app.post('/api/complete-onboarding', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    const { reg_no } = req.session.user;
    try {
        await db.query('UPDATE users SET onboarding_complete = true WHERE reg_no = $1', [reg_no]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Cloud update failed' });
    }
});

app.get('/api/results/summary', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const { rows } = await db.query(
            'SELECT * FROM semester_summaries WHERE reg_no = $1 ORDER BY semester ASC',
            [req.session.user.reg_no]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Query failed' });
    }
});

app.get('/api/results/detailed/:semester', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const { rows } = await db.query(
            'SELECT * FROM results WHERE reg_no = $1 AND semester = $2',
            [req.session.user.reg_no, Number(req.params.semester)]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Query failed' });
    }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/students', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const { rows } = await db.query(`
            SELECT u.reg_no, u.full_name, u.current_semester,
                   COALESCE(
                       SUM(s.gpa * s.total_credits) / NULLIF(SUM(s.total_credits), 0),
                       0
                   ) AS cgpa
            FROM users u
            LEFT JOIN semester_summaries s ON u.reg_no = s.reg_no
            WHERE u.reg_no != 'admin'
            GROUP BY u.reg_no, u.full_name, u.current_semester
        `);

        const result = rows.map(r => ({
            reg_no: r.reg_no,
            full_name: r.full_name,
            current_semester: r.current_semester,
            cgpa: parseFloat(Number(r.cgpa).toFixed(2))
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`);
});