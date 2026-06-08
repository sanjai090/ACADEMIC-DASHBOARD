require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const connectDB = require('./database');
const { User, Result, SemesterSummary } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

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
        const existing = await User.findOne({ reg_no });
        if (existing) {
            return res.status(500).json({ error: 'User already exists.' });
        }

        await User.create({
            reg_no,
            password,
            full_name: full_name || '',
            date_of_birth: date_of_birth || null,
            current_semester: current_semester || 1,
            onboarding_complete: false
        });

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
        const user = await User.findOne({ reg_no });

        if (!user) {
            if (reg_no === 'admin' && password === 'admin123') {
                req.session.user = { reg_no: 'admin', full_name: 'Administrator', isAdmin: true };
                return res.json({ success: true, user: req.session.user, isAdmin: true });
            }
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const userData = user.toObject();

        if (userData.reg_no === 'admin') {
            req.session.user = { reg_no: 'admin', full_name: 'Administrator', isAdmin: true };
            return res.json({ success: true, user: req.session.user, isAdmin: true });
        }

        req.session.user = userData;
        res.json({ success: true, user: userData });
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
            const user = await User.findOne({ reg_no: req.session.user.reg_no });
            if (user) {
                const userData = user.toObject();
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
        const user = await User.findOne({ reg_no });

        if (!user) {
            if (reg_no === 'admin' && current_password === 'admin123') {
                await User.create({
                    reg_no: 'admin',
                    password: new_password,
                    full_name: 'Administrator',
                    date_of_birth: null,
                    current_semester: 0,
                    onboarding_complete: true
                });
                return res.json({ success: true });
            }
            return res.status(401).json({ error: 'Incorrect current password.' });
        }

        if (user.password !== current_password) {
            return res.status(401).json({ error: 'Incorrect current password.' });
        }

        await User.updateOne({ reg_no }, { password: new_password });
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

    try {
        await Result.deleteMany({ reg_no, semester: Number(semester) });

        let totalPoints = 0;
        let totalCredits = 0;
        
        const resultsToInsert = subjects.map(sub => {
            const points = gradeToPoints(sub.grade);
            totalPoints += (points * Number(sub.credits));
            totalCredits += Number(sub.credits);
            return {
                reg_no,
                semester: Number(semester),
                subject_name: sub.name,
                grade: sub.grade,
                credits: Number(sub.credits),
                grade_points: points
            };
        });

        await Result.insertMany(resultsToInsert);

        const gpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;

        await SemesterSummary.findOneAndUpdate(
            { reg_no, semester: Number(semester) },
            { gpa, total_credits: totalCredits },
            { upsert: true, new: true }
        );

        res.json({ success: true, gpa });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload results.' });
    }
});

app.post('/api/complete-onboarding', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    const { reg_no } = req.session.user;
    try {
        await User.updateOne({ reg_no }, { onboarding_complete: true });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Cloud update failed' });
    }
});

app.get('/api/results/summary', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const summaries = await SemesterSummary.find({ reg_no: req.session.user.reg_no }).sort({ semester: 1 });
        res.json(summaries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Query failed' });
    }
});

app.get('/api/results/detailed/:semester', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const results = await Result.find({ reg_no: req.session.user.reg_no, semester: Number(req.params.semester) });
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Query failed' });
    }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/students', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) return res.status(401).json({ error: 'Unauthorized' });
    try {
        // Aggregate to calculate CGPA
        const result = await User.aggregate([
            { $match: { reg_no: { $ne: 'admin' } } },
            {
                $lookup: {
                    from: 'semestersummaries',
                    localField: 'reg_no',
                    foreignField: 'reg_no',
                    as: 'summaries'
                }
            },
            {
                $project: {
                    reg_no: 1,
                    full_name: 1,
                    current_semester: 1,
                    cgpa: {
                        $cond: {
                            if: { $gt: [{ $size: '$summaries' }, 0] },
                            then: {
                                $divide: [
                                    {
                                        $reduce: {
                                            input: '$summaries',
                                            initialValue: 0,
                                            in: { $add: ['$$value', { $multiply: ['$$this.gpa', '$$this.total_credits'] }] }
                                        }
                                    },
                                    {
                                        $reduce: {
                                            input: '$summaries',
                                            initialValue: 0,
                                            in: { $add: ['$$value', '$$this.total_credits'] }
                                        }
                                    }
                                ]
                            },
                            else: 0
                        }
                    }
                }
            }
        ]);

        const formattedResult = result.map(r => ({
            reg_no: r.reg_no,
            full_name: r.full_name,
            current_semester: r.current_semester,
            cgpa: r.cgpa ? parseFloat(r.cgpa.toFixed(2)) : 0
        }));

        res.json(formattedResult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`);
});