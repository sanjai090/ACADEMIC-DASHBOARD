let currentCaptcha = "";
let isLoginMode = true;

const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar chars like 0, O, I, 1 for clarity
    let result = "";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentCaptcha = result;
    document.getElementById('captcha-img').innerText = currentCaptcha;
};

const showToast = (message, type = 'error') => {
    const toast = document.getElementById('error-toast');
    toast.innerText = message;
    toast.style.display = 'block';
    toast.style.background = type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';
    toast.style.borderColor = type === 'error' ? 'var(--error)' : 'var(--success)';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
};

const toggleAuthMode = (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;

    const title = document.getElementById('form-title');
    const desc = document.getElementById('form-desc');
    const submitBtn = document.getElementById('submit-auth');
    const toggleLink = document.getElementById('toggle-auth');
    const toggleMsg = document.getElementById('toggle-msg');
    const registerFields = document.getElementById('register-fields');

    if (isLoginMode) {
        title.innerText = "Welcome Back";
        desc.innerText = "Please sign in to your student account.";
        submitBtn.innerText = "Sign In";
        toggleMsg.innerText = "Don't have an account?";
        toggleLink.innerText = "Create One";
        registerFields.style.display = "none";
    } else {
        title.innerText = "Join CGPA PRO";
        desc.innerText = "Start tracking your academic progress today.";
        submitBtn.innerText = "Create Account";
        toggleMsg.innerText = "Already a student?";
        toggleLink.innerText = "Sign In instead";
        registerFields.style.display = "block";
    }
};

const handleAuth = async () => {
    const regNo = document.getElementById('reg-no').value;
    const password = document.getElementById('password').value;
    const captchaInput = document.getElementById('captcha-input').value;

    if (!regNo || !password) return showToast("Please fill all fields.");
    if (captchaInput.toUpperCase() !== currentCaptcha) {
        showToast("Invalid Captcha code.");
        generateCaptcha();
        return;
    }

    const payload = { reg_no: regNo, password: password };
    
    if (!isLoginMode) {
        payload.full_name = document.getElementById('full-name').value;
        payload.current_semester = parseInt(document.getElementById('current-sem').value);
        if (!payload.full_name) return showToast("Full Name is required.");
    }

    const endpoint = isLoginMode ? '/api/login' : '/api/register';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            showToast(isLoginMode ? "Logged in successfully!" : "Account created!", "success");
            // If just registered, auto-login or redirect to onboard
            if (isLoginMode) {
                // Check onboarding status
                if (data.user.onboarding_complete) {
                    window.location.href = "dashboard.html";
                } else {
                    window.location.href = "onboarding.html";
                }
            } else {
                // Auto-toggle to login so they can sign in
                isLoginMode = false;
                toggleAuthMode({ preventDefault: () => {} });
                showToast("Now please login.", "success");
            }
        } else {
            showToast(data.error || "Authentication failed.");
        }
    } catch (err) {
        showToast("Server error. Please try again.");
    }
};

document.getElementById('toggle-auth').addEventListener('click', toggleAuthMode);
document.getElementById('submit-auth').addEventListener('click', handleAuth);

// Initial Load
generateCaptcha();

// Check if already logged in
const checkSession = async () => {
    const response = await fetch('/api/me');
    const data = await response.json();
    if (data.loggedIn) {
        if (data.user.onboarding_complete) {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "onboarding.html";
        }
    }
};
checkSession();
