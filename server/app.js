const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { db, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, orderBy, updateDoc, writeBatch } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(session({
    secret: 'cgpa-secret-key-12345',
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
        // Check if user already exists
        const userRef = doc(db, 'users', reg_no);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return res.status(500).json({ error: 'User already exists or database error.' });
        }

        await setDoc(userRef, {
            reg_no,
            password,
            full_name: full_name || '',
            date_of_birth: date_of_birth || '',
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
        const userRef = doc(db, 'users', reg_no);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Default admin fallback if not in DB
            if (reg_no === 'admin' && password === 'admin123') {
                req.session.user = { reg_no: 'admin', full_name: 'Administrator', isAdmin: true };
                return res.json({ success: true, user: req.session.user, isAdmin: true });
            }
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = userSnap.data();

        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

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
            const userRef = doc(db, 'users', req.session.user.reg_no);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
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
        // Special case for default admin fallback
        if (reg_no === 'admin') {
            const adminRef = doc(db, 'users', 'admin');
            const adminSnap = await getDoc(adminRef);
            let isValid = false;

            if (!adminSnap.exists()) {
                if (current_password === 'admin123') isValid = true;
            } else {
                if (adminSnap.data().password === current_password) isValid = true;
            }

            if (!isValid) return res.status(401).json({ error: 'Incorrect current password.' });

            if (!adminSnap.exists()) {
                await setDoc(adminRef, {
                    reg_no: 'admin',
                    password: new_password,
                    full_name: 'Administrator',
                    current_semester: 0,
                    onboarding_complete: true
                });
            } else {
                await updateDoc(adminRef, { password: new_password });
            }
            return res.json({ success: true });
        } else {
            // Normal user
            const userRef = doc(db, 'users', reg_no);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists() || userSnap.data().password !== current_password) {
                return res.status(401).json({ error: 'Incorrect current password.' });
            }

            await updateDoc(userRef, { password: new_password });
            res.json({ success: true });
        }
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
        // Clear existing results for this semester
        const resultsRef = collection(db, 'results');
        const existingQuery = query(resultsRef, where('reg_no', '==', reg_no), where('semester', '==', Number(semester)));
        const existingSnap = await getDocs(existingQuery);
        
        const batch = writeBatch(db);
        existingSnap.forEach((docSnap) => {
            batch.delete(docSnap.ref);
        });
        await batch.commit();

        let totalPoints = 0;
        let totalCredits = 0;

        for (const sub of subjects) {
            const points = gradeToPoints(sub.grade);
            const resultDocRef = doc(collection(db, 'results'));
            await setDoc(resultDocRef, {
                reg_no,
                semester: Number(semester),
                subject_name: sub.name,
                grade: sub.grade,
                credits: Number(sub.credits),
                grade_points: points
            });
            totalPoints += (points * sub.credits);
            totalCredits += sub.credits;
        }

        const gpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;

        // Upsert semester summary (doc ID = reg_no_semester)
        const summaryId = `${reg_no}_sem${semester}`;
        const summaryRef = doc(db, 'semester_summaries', summaryId);
        await setDoc(summaryRef, {
            reg_no,
            semester: Number(semester),
            gpa,
            total_credits: totalCredits
        });

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
        const userRef = doc(db, 'users', reg_no);
        await updateDoc(userRef, { onboarding_complete: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Cloud update failed' });
    }
});

app.get('/api/results/summary', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const summariesRef = collection(db, 'semester_summaries');
        const q = query(summariesRef, where('reg_no', '==', req.session.user.reg_no), orderBy('semester', 'asc'));
        const snap = await getDocs(q);

        const rows = [];
        snap.forEach((docSnap) => {
            rows.push(docSnap.data());
        });
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Query failed' });
    }
});

app.get('/api/results/detailed/:semester', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const resultsRef = collection(db, 'results');
        const q = query(resultsRef, where('reg_no', '==', req.session.user.reg_no), where('semester', '==', Number(req.params.semester)));
        const snap = await getDocs(q);

        const rows = [];
        snap.forEach((docSnap) => {
            rows.push(docSnap.data());
        });
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
        // Get all users
        const usersSnap = await getDocs(collection(db, 'users'));
        const users = [];
        usersSnap.forEach((docSnap) => {
            users.push(docSnap.data());
        });

        // Get all semester summaries
        const summariesSnap = await getDocs(collection(db, 'semester_summaries'));
        const summaries = {};
        summariesSnap.forEach((docSnap) => {
            const data = docSnap.data();
            if (!summaries[data.reg_no]) summaries[data.reg_no] = [];
            summaries[data.reg_no].push(data);
        });

        // Calculate CGPA for each user
        const result = users.map(user => {
            const userSummaries = summaries[user.reg_no] || [];
            let totalWeightedGpa = 0;
            let totalCredits = 0;
            for (const s of userSummaries) {
                totalWeightedGpa += s.gpa * s.total_credits;
                totalCredits += s.total_credits;
            }
            const cgpa = totalCredits > 0 ? parseFloat((totalWeightedGpa / totalCredits).toFixed(2)) : 0;
            return {
                reg_no: user.reg_no,
                full_name: user.full_name,
                current_semester: user.current_semester,
                cgpa
            };
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`);
});