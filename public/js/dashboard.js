let userSummary = [];
let performanceChart = null;

const initDashboard = async () => {
    try {
        const userRes = await fetch('/api/me');
        const userData = await userRes.json();
        
        if (!userData.loggedIn) {
            window.location.href = "index.html";
            return;
        }

        document.getElementById('user-name').innerText = userData.user.full_name || 'Student';
        
        let dobText = '-';
        if (userData.user.date_of_birth) {
            const d = new Date(userData.user.date_of_birth);
            dobText = d.toLocaleDateString('en-GB');
        }
        document.getElementById('user-name').dataset.dob = dobText;

        document.getElementById('user-reg').innerText = userData.user.reg_no;
        document.getElementById('user-avatar').innerText = (userData.user.full_name || 'S').charAt(0);

        await refreshDashboardStyles();
        await loadStats();

        // Populate Semester dropdown in Update tab
        populateSemDropdown(userData.user.current_semester);

    } catch (err) {
        console.error("Initialization Failed.", err);
    }
};

const logout = async () => {
    await fetch('/api/logout');
    window.location.href = "index.html";
};

const loadStats = async () => {
    const res = await fetch('/api/results/summary');
    userSummary = await res.json();
    
    // Calculate total CGPA
    let totalPoints = 0;
    let totalCredits = 0;
    userSummary.forEach(sem => {
        totalPoints += (sem.gpa * sem.total_credits);
        totalCredits += sem.total_credits;
    });

    const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    document.getElementById('cgpa-value').innerText = cgpa;
    document.getElementById('credits-value').innerText = totalCredits;
    document.getElementById('sem-count').innerText = userSummary.length;

    updateChart();
    updateSummaryTable();
    updateReportDropdown();
};

const updateChart = () => {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    if (performanceChart) performanceChart.destroy();

    const labels = userSummary.map(s => `Sem ${s.semester}`);
    const gpas = userSummary.map(s => s.gpa);

    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Semester GPA',
                data: gpas,
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: '#4cc9f0'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { min: 0, max: 10, ticks: { color: '#94a3b8' } },
                x: { ticks: { color: '#94a3b8' } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
};

const updateSummaryTable = () => {
    const body = document.getElementById('summary-body');
    body.innerHTML = '';
    userSummary.forEach(sem => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Semester ${sem.semester}</td>
            <td style="font-weight: 600; color: var(--secondary-color);">${sem.gpa}</td>
            <td>${sem.total_credits}</td>
            <td><span style="background: rgba(34, 197, 94, 0.1); color: var(--success); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">PASSED</span></td>
        `;
        body.appendChild(row);
    });
};

const showTab = (tabName) => {
    const tabs = ['overview', 'reports', 'update'];
    tabs.forEach(t => {
        document.getElementById(`tab-${t}`).style.display = t === tabName ? 'block' : 'none';
        const link = document.querySelectorAll('.sidebar-link')[tabs.indexOf(t)];
        if (t === tabName) link.classList.add('active');
        else link.classList.remove('active');
    });
};

const addUpdateSubjectRow = () => {
    const list = document.getElementById('update-subject-list');
    const row = document.createElement('div');
    row.className = 'form-group animate-in';
    row.style.display = 'flex';
    row.style.gap = '1rem';
    row.style.marginTop = '1rem';

    row.innerHTML = `
        <div style="flex: 2;"><input type="text" class="up-sub-name" placeholder="Subject Name"></div>
        <div style="flex: 0.5;"><input type="number" class="up-sub-credits" placeholder="Credits" value="4"></div>
        <div style="flex: 1;">
            <select class="up-sub-grade">
                <option value="O">O (10)</option>
                <option value="A+">A+ (9)</option>
                <option value="A">A (8)</option>
                <option value="B+">B+ (7)</option>
                <option value="B">B (6)</option>
                <option value="C">C (5)</option>
                <option value="U">U (0)</option>
            </select>
        </div>
        <button class="btn" style="width: auto; background: transparent; color: var(--error);" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
    `;
    list.appendChild(row);
};

const submitUpdate = async () => {
    const semester = parseInt(document.getElementById('update-sem').value);
    const rows = document.querySelectorAll('.up-sub-name');
    const subjects = [];

    rows.forEach(row => {
        const parent = row.parentElement.parentElement;
        const name = row.value;
        const credits = parseInt(parent.querySelector('.up-sub-credits').value);
        const grade = parent.querySelector('.up-sub-grade').value;
        if (name && credits) subjects.push({ name, credits, grade });
    });

    if (subjects.length === 0) return alert("Add at least one subject.");

    const res = await fetch('/api/upload-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester, subjects })
    });
    
    if (res.ok) {
        alert("Results updated!");
        loadStats();
        showTab('overview');
    }
};

const updateReportDropdown = () => {
    const select = document.getElementById('report-sem-select');
    select.innerHTML = '<option value="">Select Semester Report</option>';
    userSummary.forEach(sem => {
        const opt = document.createElement('option');
        opt.value = sem.semester;
        opt.innerText = `Semester ${sem.semester}`;
        select.appendChild(opt);
    });
};

const generateConsolidated = () => {
    const preview = document.getElementById('report-preview');
    const content = document.getElementById('report-content');
    preview.style.display = 'block';

    const cgpa = document.getElementById('cgpa-value').innerText;
    const totalCredits = document.getElementById('credits-value').innerText;

    content.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 1rem; margin-bottom: 2rem;">
            <h1 style="color: black !important; margin: 0;">CONSOLIDATED STATEMENT OF GRADES</h1>
            <p style="color: black !important; margin: 0;">OFFICIAL TRANSCRIPT</p>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2rem;">
            <div>
                <strong>Name:</strong> ${document.getElementById('user-name').innerText}<br>
                <strong>Reg No:</strong> ${document.getElementById('user-reg').innerText}<br>
                <strong>Date of Birth:</strong> ${document.getElementById('user-name').dataset.dob || '-'}
            </div>
            <div style="text-align: right;">
                <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
                <strong>System:</strong> 10-Point Scale
            </div>
        </div>
        <table style="width: 100%; border: 1px solid #000; color: black !important;">
            <thead>
                <tr style="background: #eee;">
                    <th style="color: black !important;">Semester</th>
                    <th style="color: black !important;">GPA</th>
                    <th style="color: black !important;">Credits</th>
                </tr>
            </thead>
            <tbody>
                ${userSummary.map(s => `
                    <tr>
                        <td style="color: black !important; padding: 5px;">Semester ${s.semester}</td>
                        <td style="color: black !important; padding: 5px;">${s.gpa}</td>
                        <td style="color: black !important; padding: 5px;">${s.total_credits}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="margin-top: 3rem; text-align: right;">
            <div style="font-size: 1.5rem; font-weight: bold;">OVERALL CGPA: ${cgpa}</div>
            <div style="font-size: 1rem;">TOTAL CREDITS: ${totalCredits}</div>
        </div>
    `;
};

const generateSemesterReport = async () => {
    const sem = document.getElementById('report-sem-select').value;
    if (!sem) return alert("Select a semester.");

    const res = await fetch(`/api/results/detailed/${sem}`);
    const details = await res.json();

    const preview = document.getElementById('report-preview');
    const content = document.getElementById('report-content');
    preview.style.display = 'block';

    content.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 1rem; margin-bottom: 2rem;">
            <h1 style="color: black !important; margin: 0;">SEMESTER GRADE SHEET</h1>
            <p style="color: black !important; margin: 0;">SEMESTER ${sem}</p>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2rem;">
            <div>
                <strong>Name:</strong> ${document.getElementById('user-name').innerText}<br>
                <strong>Reg No:</strong> ${document.getElementById('user-reg').innerText}<br>
                <strong>Date of Birth:</strong> ${document.getElementById('user-name').dataset.dob || '-'}
            </div>
            <div style="text-align: right;"><strong>Semester:</strong> ${sem}</div>
        </div>
        <table style="width: 100%; border: 1px solid #000; color: black !important;">
            <thead>
                <tr style="background: #eee;">
                    <th style="color: black !important;">Subject Name</th>
                    <th style="color: black !important;">Credits</th>
                    <th style="color: black !important;">Grade</th>
                </tr>
            </thead>
            <tbody>
                ${details.map(d => `
                    <tr>
                        <td style="color: black !important; padding: 5px;">${d.subject_name}</td>
                        <td style="color: black !important; padding: 5px;">${d.credits}</td>
                        <td style="color: black !important; padding: 5px;">${d.grade}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
};

const populateSemDropdown = (current) => {
    const upSelect = document.getElementById('update-sem');
    upSelect.value = current;
};

const refreshDashboardStyles = () => {
    // Add 5 initial rows to update
    for (let i = 0; i < 6; i++) addUpdateSubjectRow();
};

initDashboard();
