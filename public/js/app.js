// ============================================================
// CSE CURRICULUM - Anna University Regulation 2021
// Source: cse.pdf (subjects & credits per semester)
// ============================================================
const CSE_CURRICULUM = {
    1: [
        { name: "Professional English - I",                 code: "23ENT11", credits: 3 }, 
        { name: "Matrices and Calculus",                    code: "23MAT11", credits: 4 }, 
        { name: "Engineering Physics",                      code: "23PHT11", credits: 3 },
        { name: "Engineering Chemistry",                    code: "23CYT11", credits: 3 },
        { name: "Problem Solving and Python Programming",   code: "23CST11", credits: 3 },
        { name: "Heritage Of Tamils",                       code: "23TAT11", credits: 1 },
        { name: "Problem Solving and Python Lab",           code: "23CSL11", credits: 2 },
        { name: "Physics and Chemistry Lab",                code: "23PCL11", credits: 2 },
        { name: "English Laboratory",                       code: "23ENL11", credits: 1 }


    ],
    2: [
        { name: "Professional English - II",                    code: "23ENT21", credits: 2 },
        { name: " Numerical Methods and Statistics ",           code: "23MAT21", credits:4  },
        { name: "Physics for Information Science",              code: "23PHT21", credits: 3 },
        { name: "Basic of Electrical And Electronics Engineering",  code: "23EET22", credits: 3 },
        { name: "Engineering Graphics",                         code: "23MET21", credits: 4 },
        { name: "Programming in C",                             code: "23CST21", credits: 3 },
        { name: "Tamils And Technology",                        code: "23TAT21", credits: 1 },
        { name: "Engineering Practices Laboratory",             code: "23MEL21", credits: 2 },
        { name: "Prodramming In C Laboratory ",                 code: "23CSL21", credits: 2 },
        { name: "Communication Laboratory  ",                   code: "23ENL21", credits: 2 }
    ],
    3: [
        { name: "Discrete Mathematics",                         code: "23MAT31", credits: 4 },
        { name: "Foundation Of Data Science",                   code: "23CST31", credits: 3 },
        { name: "Data Structures",                              code: "23CST32", credits: 3 },
        { name: "Object Oriented Programming",                  code: "23CST33", credits: 3 },
        { name: "Digital Princilpels And Computer Organization",code: "23ECI32", credits: 4 },
        { name: "Entrepreneureship And Startups",               code: "23EST31", credits: 1 },
        { name: "Data Science Laboratory",                      code: "23CSl31", credits: 2 },
        { name: "Data Structures Lab",                          code: "23CSL32", credits: 1.5 },
        { name: "OOPS Lab",                                     code: "23CSL33", credits: 2 }
    ],
    4: [
        { name: "Database Management Systems",                  code: "23CST41", credits: 3 },
        { name: "Theory Of Computation",                        code: "23CST42", credits: 3 },
        { name: "Operating Systems",                            code: "23CSI41", credits: 4 },
        { name: "Artificial intelligence And Machine Learning", code: "23CSI42", credits: 4 },
        { name: "Design and Analysis of Algorithms",            code: "23CSI43", credits: 3 },
        { name: "Environmental Science And Sustainability",     code: "23CYT41", credits: 2 },
        { name: "Database Management Systems Laboratory",       code: "23CSL41", credits: 1.5 }
    ],
    5: [
        { name: "Cryptography and Cyber Security",            code: "23CST51", credits: 3 },
        { name: "Distributed Computing",                      code: "23CST52", credits: 3 },
        { name: "Computer Networks",                          code: "23CSI51", credits: 4 },
        { name: "Objected Oriented Software Engineering",     code: "23CSI52", credits: 4 },
        { name: "Professional Ellective I",                   code: "-",       credits: 3 },
        { name: "Professional Ellective II",                  code: "-",       credits: 3 },
        { name: "Soft And Analytical Skills - II",            code: "23MDC51", credits: 0 },
        { name: "Mandatory Course - IV",                      code: "-",       credits: 0 }
    ],
    6: [
        { name: "Compiler Design",                   code: "23CSI61", credits: 4 },
        { name: "Embedded Systems And IoT",          code: "23ECI62", credits: 4 },
        { name: "Professional Ellective III",        code: "-",       credits: 3 },
        { name: "Professional Ellective IV",         code: "-",       credits: 3 },
        { name: "Professional Ellective V",          code: "-",       credits: 3 },
        { name: "Professional Ellective VI",         code: "-",       credits: 3 },
        { name: "Open Elective -I",                  code: "-",       credits: 3 },
        { name: "Mandatory Course - V",              code: "-",       credits: 0 },
    ],
    7: [
        { name: "Human Values And Ethics",              code: "23UHV71", credits: 2 },
        { name: "Elective - Management",                code: "-",       credits: 3 },
        { name: "Open Elective -II",                    code: "-",       credits: 3 },
        { name: "Open Elective -III",                   code: "-",       credits: 3 },
        { name: "Open Elective -IV",                    code: "-",       credits: 3 },
    ],
    8: [
        { name: "Summer Internship",             code: "GE4081", credits: 2 },
        { name: "Mini Project",                  code: "OE4002", credits: 2 },
    ]
};

const GRADE_POINTS = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'U': 0 };

let isLoginMode = true;
let currentCaptcha = "";
let onboarding_user_sem = 1;
let current_wizard_sem = 1;

// ============================================================
// AUTH
// ============================================================
function toggleAuth(e) {
    if (e) e.preventDefault();
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText   = isLoginMode ? 'Welcome Back' : 'Create Account';
    document.getElementById('auth-desc').innerText    = isLoginMode ? 'Sign in to access your dashboard.' : 'Register to start tracking your CGPA.';
    document.getElementById('btn-auth').innerText     = isLoginMode ? 'Sign In' : 'Register';
    document.getElementById('toggle-msg').innerText   = isLoginMode ? 'New student?' : 'Already registered?';
    document.querySelector('[onclick="toggleAuth(event)"]').innerText = isLoginMode ? 'Create Account' : 'Sign In';
    document.getElementById('name-group').style.display = isLoginMode ? 'none' : 'block';
}

function generateCaptcha() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    currentCaptcha = result;
    document.getElementById('captcha-img').innerText = currentCaptcha;
}

async function handleAuth() {
    const reg_no    = document.getElementById('reg-no').value.trim();
    const password  = document.getElementById('password').value;
    const captcha   = document.getElementById('captcha-input').value.trim();
    const full_name = document.getElementById('full-name').value.trim();
    const date_of_birth = document.getElementById('date-of-birth').value.trim();

    if (!reg_no || !password) { alert("Please fill in Register Number and Password."); return; }
    if (captcha.toUpperCase() !== currentCaptcha) { alert("Wrong captcha! Try again."); generateCaptcha(); return; }

    const endpoint = isLoginMode ? '/api/login' : '/api/register';
    const body = { reg_no, password, full_name, date_of_birth };

    try {
        const res  = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json();
        if (data.success) {
            if (data.isAdmin) {
                checkSession();
                return;
            }
            if (!isLoginMode) { alert("Account created! Please sign in."); toggleAuth(); }
            else checkSession();
        } else {
            alert(data.error || "Authentication failed. Please try again.");
            document.getElementById('reg-no').value = '';
            document.getElementById('password').value = '';
            document.getElementById('captcha-input').value = '';
            generateCaptcha();
        }
    } catch { alert("Cannot reach server. Is the server running?"); }
}

// ============================================================
// ONBOARDING WIZARD
// ============================================================
function startOnboardingWizard() {
    onboarding_user_sem = parseInt(document.getElementById('current-sem-select').value);
    if (onboarding_user_sem === 1) { completeOnboarding(); return; }

    document.getElementById('onboarding-step-1').style.display = 'none';
    document.getElementById('onboarding-wizard').style.display = 'block';
    current_wizard_sem = 1;
    renderWizardStep();
}

function renderWizardStep() {
    // Progress bar
    const progress = Math.round(((current_wizard_sem - 1) / (onboarding_user_sem - 1)) * 100);
    document.getElementById('onboard-progress-bar').style.width = progress + '%';
    document.getElementById('onboard-progress-text').innerText  = `Semester ${current_wizard_sem} of ${onboarding_user_sem - 1}`;

    document.getElementById('wizard-sem-title').innerText = `Semester ${current_wizard_sem} — Enter Your Grades`;
    document.getElementById('wizard-sem-desc').innerText  =
        `Subjects are pre-filled from the CSE curriculum. Select the grade you received for each subject.`;

    const container = document.getElementById('wizard-subjects');
    container.innerHTML = '';

    const subjects = CSE_CURRICULUM[current_wizard_sem] || [];
    if (subjects.length > 0) {
        subjects.forEach(s => addWizardRow(s.name, s.code, s.credits));
    } else {
        for (let i = 0; i < 5; i++) addWizardRow();
    }

    const nextBtn = document.getElementById('wizard-next-btn');
    const isLast  = current_wizard_sem >= onboarding_user_sem - 1;
    nextBtn.innerHTML = isLast
        ? `<i class="fa-solid fa-check"></i> Complete Setup & Go to Dashboard`
        : `Save Sem ${current_wizard_sem} & Continue to Sem ${current_wizard_sem + 1} <i class="fa-solid fa-arrow-right"></i>`;
}

function addWizardRow(name = "", code = "", credits = 4) {
    const row = document.createElement('div');
    row.className = 'wizard-row animate-in';
    row.style.cssText = 'display:flex;gap:1rem;align-items:center;margin-bottom:1rem;background:rgba(255,255,255,0.03);padding:0.75rem;border-radius:0.75rem;border:1px solid rgba(255,255,255,0.06);';
    row.innerHTML = `
        <div style="flex:2.5">
            <div style="font-weight:600;font-size:0.9rem;">${name || `<input type="text" class="wiz-sub-name" placeholder="Subject Name" style="width:100%">`}</div>
            ${name ? `<input type="hidden" class="wiz-sub-name" value="${name}">` : ''}
            ${code ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">${code}</div>` : ''}
        </div>
        <div style="flex:0.7;text-align:center">
            <div style="font-size:0.75rem;color:var(--text-muted);">Credits</div>
            <div style="font-weight:700;font-size:1.1rem;color:var(--secondary-color);">${credits}</div>
            <input type="hidden" class="wiz-sub-credits" value="${credits}">
        </div>
        <div style="flex:1.2">
            <label style="font-size:0.75rem;color:var(--text-muted)">Grade</label>
            <select class="wiz-sub-grade" style="width:100%;background:#1e293b;color:#fff;border:1px solid var(--glass-border);padding:0.5rem;border-radius:0.5rem;">
                <option value="O">O — Outstanding (10)</option>
                <option value="A+">A+ — Excellent (9)</option>
                <option value="A">A — Very Good (8)</option>
                <option value="B+">B+ — Good (7)</option>
                <option value="B">B — Above Average (6)</option>
                <option value="C">C — Average (5)</option>
                <option value="U">U — Fail (0)</option>
            </select>
        </div>
    `;
    document.getElementById('wizard-subjects').appendChild(row);
}

async function processWizardStep() {
    const nameInputs    = document.querySelectorAll('#wizard-subjects .wiz-sub-name');
    const creditInputs  = document.querySelectorAll('#wizard-subjects .wiz-sub-credits');
    const gradeSelects  = document.querySelectorAll('#wizard-subjects .wiz-sub-grade');
    const subjects = [];

    nameInputs.forEach((el, i) => {
        const name    = el.value.trim();
        const credits = parseInt(creditInputs[i].value);
        const grade   = gradeSelects[i].value;
        if (name && !isNaN(credits)) subjects.push({ name, credits, grade });
    });

    if (subjects.length === 0) { alert("Please fill in at least one subject."); return; }

    const btn = document.getElementById('wizard-next-btn');
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

    try {
        const res = await fetch('/api/upload-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ semester: current_wizard_sem, subjects })
        });

        if (!res.ok) throw new Error('Server error');

        if (current_wizard_sem < onboarding_user_sem - 1) {
            current_wizard_sem++;
            renderWizardStep();
        } else {
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Finalising...`;
            completeOnboarding();
        }
    } catch {
        alert("Failed to save. Please try again.");
        btn.disabled = false;
        renderWizardStep();
    }
}

async function completeOnboarding() {
    await fetch('/api/complete-onboarding', { method: 'POST' });
    checkSession();
}

// ============================================================
// DASHBOARD
// ============================================================
let mainChart = null;

async function initDashboard(user) {
    document.getElementById('user-display-name').innerText   = user.full_name || 'Student';
    // Format the date if it exists
    let dobText = '-';
    if (user.date_of_birth) {
        const d = new Date(user.date_of_birth);
        dobText = d.toLocaleDateString('en-GB'); // Converts to DD/MM/YYYY
    }
    document.getElementById('user-display-name').dataset.dob = dobText;
    
    document.getElementById('user-display-reg').innerText    = user.reg_no;
    document.getElementById('user-display-avatar').innerText = (user.full_name || 'S').charAt(0).toUpperCase();
    await loadDashboardStats();
}

async function loadDashboardStats() {
    const res       = await fetch('/api/results/summary');
    const summaries = await res.json();

    let totalGradePoints = 0, totalCredits = 0;

    const body = document.getElementById('summary-body');
    body.innerHTML = '';
    summaries.forEach(s => {
        totalGradePoints += s.gpa * s.total_credits;
        totalCredits     += s.total_credits;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Semester ${s.semester}</td>
            <td style="font-weight:700;color:var(--secondary-color);">${parseFloat(s.gpa).toFixed(2)}</td>
            <td>${s.total_credits}</td>
            <td><span style="background:rgba(34,197,94,0.15);color:var(--success);padding:2px 8px;border-radius:4px;font-size:0.75rem;">PASSED</span></td>
        `;
        body.appendChild(row);
    });

    const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
    document.getElementById('val-cgpa').innerText    = cgpa;
    document.getElementById('val-credits').innerText = totalCredits;
    document.getElementById('val-sems').innerText    = summaries.length;

    updateMainChart(summaries);
    populateReportDropdown(summaries);
}

function updateMainChart(summaries) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (mainChart) mainChart.destroy();
    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: summaries.map(s => `Sem ${s.semester}`),
            datasets: [{
                label: 'GPA',
                data: summaries.map(s => parseFloat(s.gpa).toFixed(2)),
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67,97,238,0.1)',
                fill: true, tension: 0.4,
                pointRadius: 6, pointBackgroundColor: '#4cc9f0'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { min: 0, max: 10, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function populateReportDropdown(summaries) {
    const sel = document.getElementById('sem-report-select');
    sel.innerHTML = '<option value="">-- Pick a Semester --</option>';
    summaries.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.semester;
        opt.innerText = `Semester ${s.semester} (GPA: ${parseFloat(s.gpa).toFixed(2)})`;
        sel.appendChild(opt);
    });
}

function showTab(tab) {
    ['overview','reports','update','settings'].forEach((t, i) => {
        document.getElementById(`tab-${t}`).style.display = t === tab ? 'block' : 'none';
        const link = document.querySelectorAll('.student-link')[i];
        if (link) { link.classList.toggle('active', t === tab); }
    });
}

function logout() {
    fetch('/api/logout').then(() => { 
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active')); 
        const printDiv = document.getElementById('print-view');
        if (printDiv) {
            printDiv.style.display = 'none';
            document.getElementById('print-content').innerHTML = '';
        }
        document.getElementById('reg-no').value = '';
        document.getElementById('password').value = '';
        document.getElementById('captcha-input').value = '';
        generateCaptcha();
        checkSession(); 
    });
}

// ============================================================
// REPORTS
// ============================================================
async function generateReport(type) {
    if (!window.jspdf) {
        alert("PDF library is not loaded.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const name     = document.getElementById('user-display-name').innerText;
    const dob      = document.getElementById('user-display-name').dataset.dob || '-';
    const reg      = document.getElementById('user-display-reg').innerText;
    const cgpa     = document.getElementById('val-cgpa').innerText;

    // Header section
    doc.setFontSize(14);
    doc.setTextColor(21, 128, 61);
    doc.text("SHREE VENKATESHWARA HI-TECH ENGINEERING COLLEGE", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text("Approved by AICTE and Affiliated to Anna University", 105, 26, { align: "center" });
    doc.text("Gobi Main Rd, Sri Kalaivani Nagar, Othhakkuthirai, Tamil Nadu - 638 455.", 105, 31, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text("PROVISIONAL RESULTS", 105, 42, { align: "center" });
    doc.setFont(undefined, 'normal');

    // Student Info Table
    doc.autoTable({
        startY: 50,
        body: [
            [{ content: 'Name:', styles: { fontStyle: 'bold' } }, name, { content: 'Regulation:', styles: { fontStyle: 'bold' } }, '2023'],
            [{ content: 'Register Number:', styles: { fontStyle: 'bold' } }, reg, { content: 'Gender:', styles: { fontStyle: 'bold' } }, 'Male'],
            [{ content: 'Date of Birth:', styles: { fontStyle: 'bold' } }, dob, { content: 'Branch:', styles: { fontStyle: 'bold' } }, 'B.E. - CSE']
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 1 }
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    let tableData = [];

    if (type === 'consolidated') {
        const res       = await fetch('/api/results/summary');
        const summaries = await res.json();
        
        for (const s of summaries) {
            const sem = s.semester;
            const detRes = await fetch(`/api/results/detailed/${sem}`);
            const details = await detRes.json();
            
            details.forEach(d => {
                let code = "-";
                if (CSE_CURRICULUM[sem]) {
                    let f = CSE_CURRICULUM[sem].find(sub => sub.name === d.subject_name);
                    if (f) code = f.code;
                }
                let resText = (d.grade === 'U') ? 'FAIL' : 'PASS';
                tableData.push([sem.toString(), code, d.subject_name, d.grade, resText]);
            });

            // Add GPA row
            tableData.push([
                { content: 'GPA', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, 
                { content: parseFloat(s.gpa).toFixed(2), colSpan: 2, styles: { halign: 'center', textColor: [21, 128, 61], fontStyle: 'bold' } }
            ]);
        }
        
        // Add CGPA row
        tableData.push([
            { content: 'CGPA', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [226, 232, 240] } }, 
            { content: cgpa, colSpan: 2, styles: { halign: 'center', textColor: [21, 128, 61], fontStyle: 'bold', fillColor: [226, 232, 240] } }
        ]);

    } else {
        const sem = document.getElementById('sem-report-select').value;
        if (!sem) { alert("Please select a semester."); return; }

        const res     = await fetch(`/api/results/detailed/${sem}`);
        const details = await res.json();

        let totalCP = 0, totalC = 0;
        details.forEach(d => { totalCP += (GRADE_POINTS[d.grade] || 0) * d.credits; totalC += d.credits; });
        const semGPA = totalC > 0 ? (totalCP / totalC).toFixed(2) : '0.00';

        details.forEach(d => {
            let code = "-";
            if (CSE_CURRICULUM[sem]) {
                let f = CSE_CURRICULUM[sem].find(sub => sub.name === d.subject_name);
                if (f) code = f.code;
            }
            let resText = (d.grade === 'U') ? 'FAIL' : 'PASS';
            tableData.push([sem.toString(), code, d.subject_name, d.grade, resText]);
        });

        tableData.push([
            { content: 'GPA', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, 
            { content: semGPA, colSpan: 2, styles: { halign: 'center', textColor: [21, 128, 61], fontStyle: 'bold' } }
        ]);
        tableData.push([
            { content: 'CGPA', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [226, 232, 240] } }, 
            { content: cgpa, colSpan: 2, styles: { halign: 'center', textColor: [21, 128, 61], fontStyle: 'bold', fillColor: [226, 232, 240] } }
        ]);
    }

    doc.autoTable({
        startY: finalY,
        head: [['SEM NO', 'COURSE CODE', 'COURSE NAME', 'GRADE', 'RESULT']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [67, 97, 238], halign: 'center' },
        columnStyles: {
            0: { halign: 'center', cellWidth: 20 },
            1: { cellWidth: 35 },
            2: { cellWidth: 'auto' },
            3: { halign: 'center', cellWidth: 20 },
            4: { halign: 'center', cellWidth: 20 }
        },
        styles: { fontSize: 9 }
    });

    const fileName = type === 'consolidated' ? `${reg}_Consolidated_Report.pdf` : `${reg}_Sem_${document.getElementById('sem-report-select').value}_Report.pdf`;
    doc.save(fileName);
}

// ============================================================
// UPDATE EXISTING SEMESTER  (existing user tab)
// ============================================================
async function loadUpdateSubjects() {
    const sem = parseInt(document.getElementById('update-sem-choice').value);
    const container = document.getElementById('update-subjects');
    const actions   = document.getElementById('update-actions');
    container.innerHTML = '';

    if (!sem) { actions.style.display = 'none'; return; }

    actions.style.display = 'block';

    // Try to load already-saved subjects for this semester
    try {
        const res  = await fetch(`/api/results/detailed/${sem}`);
        const saved = await res.json();

        if (saved && saved.length > 0) {
            // Pre-fill from DB
            saved.forEach(s => addUpdateRow(s.subject_name, s.credits, s.grade));
        } else {
            // Pre-fill from curriculum
            const subjects = CSE_CURRICULUM[sem] || [];
            if (subjects.length > 0) {
                subjects.forEach(s => addUpdateRow(s.name, s.credits));
            } else {
                addUpdateRow(); addUpdateRow(); addUpdateRow();
            }
        }
    } catch {
        addUpdateRow(); addUpdateRow(); addUpdateRow();
    }
}

function addUpdateRow(name = "", credits = 4, grade = "O") {
    const row = document.createElement('div');
    row.className = 'animate-in';
    row.style.cssText = 'display:flex;gap:1rem;align-items:center;margin-bottom:0.75rem;background:rgba(255,255,255,0.03);padding:0.75rem;border-radius:0.75rem;border:1px solid rgba(255,255,255,0.06);';
    row.innerHTML = `
        <div style="flex:2.5;">
            <input type="text" class="upd-sub-name" placeholder="Subject Name" value="${name}" style="width:100%;background:#1e293b;color:#fff;border:1px solid var(--glass-border);padding:0.5rem 0.75rem;border-radius:0.5rem;">
        </div>
        <div style="flex:0.7;text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);">Credits</div>
            <input type="number" class="upd-sub-credits" value="${credits}" min="1" max="10" style="width:100%;text-align:center;background:#1e293b;color:var(--secondary-color);border:1px solid var(--glass-border);padding:0.5rem;border-radius:0.5rem;font-weight:700;">
        </div>
        <div style="flex:1.2;">
            <select class="upd-sub-grade" style="width:100%;background:#1e293b;color:#fff;border:1px solid var(--glass-border);padding:0.5rem;border-radius:0.5rem;">
                <option value="O"  ${grade==='O'  ?'selected':''}>O — Outstanding (10)</option>
                <option value="A+" ${grade==='A+' ?'selected':''}>A+ — Excellent (9)</option>
                <option value="A"  ${grade==='A'  ?'selected':''}>A — Very Good (8)</option>
                <option value="B+" ${grade==='B+' ?'selected':''}>B+ — Good (7)</option>
                <option value="B"  ${grade==='B'  ?'selected':''}>B — Above Avg (6)</option>
                <option value="C"  ${grade==='C'  ?'selected':''}>C — Average (5)</option>
                <option value="U"  ${grade==='U'  ?'selected':''}>U — Fail (0)</option>
            </select>
        </div>
        <button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:var(--error);cursor:pointer;font-size:1.1rem;"><i class="fa-solid fa-trash"></i></button>
    `;
    document.getElementById('update-subjects').appendChild(row);
}

async function saveUpdate() {
    const sem = parseInt(document.getElementById('update-sem-choice').value);
    if (!sem) { alert("Please select a semester first."); return; }

    const nameEls    = document.querySelectorAll('#update-subjects .upd-sub-name');
    const creditEls  = document.querySelectorAll('#update-subjects .upd-sub-credits');
    const gradeEls   = document.querySelectorAll('#update-subjects .upd-sub-grade');
    const subjects   = [];

    nameEls.forEach((el, i) => {
        const name    = el.value.trim();
        const credits = parseInt(creditEls[i].value);
        const grade   = gradeEls[i].value;
        if (name && !isNaN(credits)) subjects.push({ name, credits, grade });
    });

    if (subjects.length === 0) { alert("Please add at least one subject."); return; }

    const btn = document.querySelector('#tab-update .btn:last-child');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
        const res = await fetch('/api/upload-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ semester: sem, subjects })
        });
        if (!res.ok) throw new Error();
        alert(`Semester ${sem} results saved successfully!`);
        await loadDashboardStats();   // Refresh chart + stats
        showTab('overview');
    } catch {
        alert("Failed to save. Please try again.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Save Results';
    }
}

// ============================================================
// SESSION CHECK & ROUTING
// ============================================================
async function checkSession() {
    try {
        const res  = await fetch('/api/me');
        const data = await res.json();
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

        if (data.loggedIn) {
            if (data.isAdmin) {
                document.getElementById('view-admin').classList.add('active');
                initAdminDashboard();
            } else if (data.user.onboarding_complete) {
                document.getElementById('view-dashboard').classList.add('active');
                initDashboard(data.user);
            } else {
                document.getElementById('view-onboarding').classList.add('active');
            }
        } else {
            document.getElementById('view-auth').classList.add('active');
        }
    } catch {
        document.getElementById('view-auth').classList.add('active');
    }
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
let adminStudentData = [];

async function initAdminDashboard() {
    try {
        const res = await fetch('/api/admin/students');
        adminStudentData = await res.json();
        
        // Show default tab
        showAdminTab('directory');
        
        // Render Initial Directory
        renderAdminDirectory(adminStudentData);
        
        // Render Toppers Board
        renderToppersBoard();
    } catch (e) {
        alert("Failed to load student data.");
    }
}

function showAdminTab(tab) {
    ['directory','reports','toppers','settings'].forEach((t, i) => {
        document.getElementById(`admin-tab-${t}`).style.display = t === tab ? 'block' : 'none';
        const link = document.querySelectorAll('.admin-link')[i];
        if (link) { link.classList.toggle('active', t === tab); }
    });
}

function filterAdminDirectory() {
    const minCgpa = parseFloat(document.getElementById('admin-dir-cgpa').value) || 0;
    const semFilter = document.getElementById('admin-dir-sem').value;

    const filtered = adminStudentData.filter(s => {
        const passCgpa = parseFloat(s.cgpa) >= minCgpa;
        const passSem = semFilter ? s.current_semester.toString() === semFilter : true;
        return passCgpa && passSem;
    });
    renderAdminDirectory(filtered);
}

function renderAdminDirectory(data) {
    const tbody = document.getElementById('admin-dir-body');
    tbody.innerHTML = '';
    data.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${s.reg_no}</td>
            <td>${s.full_name || 'N/A'}</td>
            <td style="text-align: center;">${s.current_semester}</td>
            <td style="text-align: center; font-weight: bold; color: var(--secondary-color);">${parseFloat(s.cgpa).toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderToppersBoard() {
    // Sort students by CGPA descending
    const sorted = [...adminStudentData].sort((a, b) => parseFloat(b.cgpa) - parseFloat(a.cgpa));
    // Get top 20
    const top20 = sorted.slice(0, 20);
    
    const tbody = document.getElementById('admin-toppers-body');
    tbody.innerHTML = '';
    top20.forEach((s, index) => {
        const tr = document.createElement('tr');
        
        // Give special styling to top 3 ranks
        let rankHtml = `<span>${index + 1}</span>`;
        if (index === 0) rankHtml = `<span style="color: gold; font-size: 1.2rem;"><i class="fa-solid fa-crown"></i> 1</span>`;
        if (index === 1) rankHtml = `<span style="color: silver; font-size: 1.1rem;"><i class="fa-solid fa-medal"></i> 2</span>`;
        if (index === 2) rankHtml = `<span style="color: #cd7f32; font-size: 1.1rem;"><i class="fa-solid fa-medal"></i> 3</span>`;
        
        tr.innerHTML = `
            <td style="text-align: center; font-weight: bold;">${rankHtml}</td>
            <td>${s.reg_no}</td>
            <td>${s.full_name || 'N/A'}</td>
            <td style="text-align: center;">${s.current_semester}</td>
            <td style="text-align: center; font-weight: bold; color: var(--secondary-color);">${parseFloat(s.cgpa).toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function generateAdminReport() {
    if (!window.jspdf) {
        alert("PDF library is not loaded.");
        return;
    }
    const minCgpa = parseFloat(document.getElementById('admin-rep-cgpa').value) || 0;
    const semFilter = document.getElementById('admin-rep-sem').value;

    const filtered = adminStudentData.filter(s => {
        const passCgpa = parseFloat(s.cgpa) >= minCgpa;
        const passSem = semFilter ? s.current_semester.toString() === semFilter : true;
        return passCgpa && passSem;
    });
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header section
    doc.setFontSize(14);
    doc.setTextColor(21, 128, 61);
    doc.text("SHREE VENKATESHWARA HI-TECH ENGINEERING COLLEGE", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text("Approved by AICTE and Affiliated to Anna University", 105, 26, { align: "center" });
    doc.text("Gobi Main Rd, Sri Kalaivani Nagar, Othhakkuthirai, Tamil Nadu - 638 455.", 105, 31, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text("STUDENT CGPA REPORT", 105, 42, { align: "center" });
    doc.setFont(undefined, 'normal');
    
    doc.setFontSize(10);
    let filterText = `Filters Applied -> Minimum CGPA >= ${minCgpa}`;
    if (semFilter) {
        filterText += ` | Semester: ${semFilter}`;
    }
    doc.text(filterText, 14, 50);
    
    const tableData = filtered.map(s => [
        s.reg_no,
        s.full_name || 'N/A',
        s.current_semester.toString(),
        parseFloat(s.cgpa).toFixed(2)
    ]);
    
    doc.autoTable({
        startY: 55,
        head: [['Register Number', 'Name', 'Semester', 'CGPA']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [67, 97, 238], halign: 'center' },
        columnStyles: {
            0: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' }
        }
    });
    
    doc.save(`Filtered_Student_Report.pdf`);
}

async function changePassword(role) {
    const currPwdId = role === 'admin' ? 'admin-curr-pwd' : 'student-curr-pwd';
    const newPwdId = role === 'admin' ? 'admin-new-pwd' : 'student-new-pwd';
    const current_password = document.getElementById(currPwdId).value;
    const new_password = document.getElementById(newPwdId).value;

    if (!current_password || !new_password) {
        alert("Please enter both current and new passwords.");
        return;
    }

    try {
        const res = await fetch('/api/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ current_password, new_password })
        });
        const data = await res.json();
        if (data.success) {
            alert("Password updated successfully!");
            document.getElementById(currPwdId).value = "";
            document.getElementById(newPwdId).value = "";
        } else {
            alert(data.error || "Failed to update password.");
        }
    } catch {
        alert("Server error.");
    }
}

// Init
generateCaptcha();
checkSession();
