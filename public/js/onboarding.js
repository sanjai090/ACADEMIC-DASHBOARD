let userCurrentSem = 1;
let currentOnboardingSem = 1;
let allSemesterData = [];

const showToast = (message, type = 'error') => {
    alert(message); // Simple alert for onboarding errors
};

const startResultsEntry = () => {
    userCurrentSem = parseInt(document.getElementById('user-current-sem').value);
    
    // If they are in Semester 1, nothing to "previous" enter
    if (userCurrentSem === 1) {
        completeOnboardingStatus();
        return;
    }

    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-results').style.display = 'block';
    
    currentOnboardingSem = 1;
    renderSemesterEntry();
};

const renderSemesterEntry = () => {
    document.getElementById('sem-title').innerText = `Semester ${currentOnboardingSem} Results`;
    document.getElementById('sem-desc').innerText = `Enter subjects, credits, and grades for Semester ${currentOnboardingSem}.`;
    
    const list = document.getElementById('subject-list');
    list.innerHTML = '';
    
    // Start with 5 empty rows
    for (let i = 0; i < 5; i++) {
        addSubjectRow();
    }

    const nextBtn = document.getElementById('next-sem-btn');
    if (currentOnboardingSem === userCurrentSem - 1) {
        nextBtn.innerHTML = `Finish Onboarding <i class="fa-solid fa-check"></i>`;
    } else {
        nextBtn.innerHTML = `Next: Semester ${currentOnboardingSem + 1} <i class="fa-solid fa-chevron-right"></i>`;
    }
};

const addSubjectRow = () => {
    const list = document.getElementById('subject-list');
    const row = document.createElement('div');
    row.className = 'form-group animate-in';
    row.style.display = 'flex';
    row.style.gap = '1rem';
    row.style.alignItems = 'center';
    row.style.marginBottom = '1rem';

    row.innerHTML = `
        <div style="flex: 2;">
            <input type="text" class="subject-name" placeholder="Subject Name" required>
        </div>
        <div style="flex: 0.5;">
            <input type="number" class="subject-credits" placeholder="Credits" value="4" min="1" max="10">
        </div>
        <div style="flex: 1;">
            <select class="subject-grade">
                <option value="O">O (10)</option>
                <option value="A+">A+ (9)</option>
                <option value="A">A (8)</option>
                <option value="B+">B+ (7)</option>
                <option value="B">B (6)</option>
                <option value="C">C (5)</option>
                <option value="U">U (0 - Fail)</option>
            </select>
        </div>
        <button class="btn" style="width: auto; background: transparent; color: var(--error);" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
    `;
    list.appendChild(row);
};

const processNextSemester = async () => {
    const list = document.getElementById('subject-list');
    const rows = list.querySelectorAll('.subject-name');
    const subjects = [];

    Array.from(rows).forEach(row => {
        const parent = row.parentElement.parentElement;
        const name = row.value;
        const credits = parseInt(parent.querySelector('.subject-credits').value);
        const grade = parent.querySelector('.subject-grade').value;

        if (name && credits) {
            subjects.push({ name, credits, grade });
        }
    });

    if (subjects.length === 0) {
        showToast("Please enter at least one subject.");
        return;
    }

    // Save to Database via API
    try {
        const response = await fetch('/api/upload-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ semester: currentOnboardingSem, subjects })
        });

        const data = await response.json();
        if (data.success) {
            if (currentOnboardingSem < userCurrentSem - 1) {
                currentOnboardingSem++;
                renderSemesterEntry();
            } else {
                completeOnboardingStatus();
            }
        } else {
            showToast("Failed to save data. Try again.");
        }
    } catch (err) {
        showToast("Server error during data submission.");
    }
};

const completeOnboardingStatus = async () => {
    try {
        await fetch('/api/complete-onboarding', { method: 'POST' });
        window.location.href = "dashboard.html";
    } catch (err) {
        showToast("Failed to finalize onboarding.");
    }
};

// Check if already fully onboarded
(async () => {
    const response = await fetch('/api/me');
    const data = await response.json();
    if (data.loggedIn && data.user.onboarding_complete) {
        window.location.href = "dashboard.html";
    }
})();
