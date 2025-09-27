// Authentication functionality for Thoron Coaching Center
class AuthManager {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Password toggle
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', this.togglePasswordVisibility.bind(this));
        }

        // Check if user is already logged in
        this.checkAuthStatus();
    }

    async handleLogin(e) {
        e.preventDefault();

        const studentId = document.getElementById('studentId').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // Show loading state
        this.showLoading(true);
        this.hideError();

        try {
            // Simulate API delay
            await this.delay(1000);

            // Load student data
            const students = await this.loadStudents();

            // Find student by ID or email
            const student = students.find(s =>
                s.studentId.toLowerCase() === studentId.toLowerCase() ||
                s.email.toLowerCase() === studentId.toLowerCase()
            );

            if (!student) {
                throw new Error('শিক্ষার্থী খুঁজে পাওয়া যায়নি। আইডি বা ইমেইল ঠিক আছে কিনা পরীক্ষা করুন।');
            }

            if (student.password !== password) {
                throw new Error('পাসওয়ার্ড ভুল। দয়া করে সঠিক পাসওয়ার্ড দিন।');
            }

            if (student.status !== 'active') {
                throw new Error('আপনার একাউন্ট নিষ্ক্রিয়। অফিসে যোগাযোগ করুন।');
            }

            // Store login info
            const loginData = {
                studentId: student.id,
                studentInfo: {
                    id: student.studentId,
                    name: student.name,
                    class: student.class,
                    email: student.email
                },
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe
            };

            if (rememberMe) {
                localStorage.setItem('thoronAuth', JSON.stringify(loginData));
            } else {
                sessionStorage.setItem('thoronAuth', JSON.stringify(loginData));
            }

            // Show success and redirect
            this.showSuccess('সফলভাবে লগইন হয়েছে! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async loadStudents() {
        try {
            const response = await fetch('data/students.json');
            if (!response.ok) {
                throw new Error('ডেটা লোড করতে সমস্যা হয়েছে');
            }
            const data = await response.json();
            return data.students;
        } catch (error) {
            // Fallback to demo data if JSON file is not available
            console.warn('JSON file not accessible, using demo data');
            return [
                {
                    id: "student_001",
                    studentId: "TH2025001",
                    name: "আহমেদ রহমান",
                    email: "ahmed@example.com",
                    phone: "01712345678",
                    password: "password123",
                    class: "10",
                    status: "active"
                },
                {
                    id: "student_002",
                    studentId: "TH2025002",
                    name: "ফাতিমা খাতুন",
                    email: "fatima@example.com",
                    phone: "01812345678",
                    password: "password456",
                    class: "9",
                    status: "active"
                }
            ];
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.querySelector('#togglePassword i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash text-gray-400 hover:text-gray-600';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye text-gray-400 hover:text-gray-600';
        }
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const loginBtn = document.getElementById('loginBtn');

        if (show) {
            loadingState.classList.remove('hidden');
            loginBtn.disabled = true;
            loginBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            loadingState.classList.add('hidden');
            loginBtn.disabled = false;
            loginBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        const errorSpan = errorDiv.querySelector('span');

        errorSpan.textContent = message;
        errorDiv.classList.remove('hidden');

        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.classList.add('hidden');
    }

    showSuccess(message) {
        const errorDiv = document.getElementById('errorMessage');
        const errorSpan = errorDiv.querySelector('span');

        errorDiv.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded';
        errorSpan.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    checkAuthStatus() {
        const authData = this.getAuthData();
        if (authData && window.location.pathname.includes('login.html')) {
            // User is already logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    }

    getAuthData() {
        const sessionAuth = sessionStorage.getItem('thoronAuth');
        const localAuth = localStorage.getItem('thoronAuth');

        if (sessionAuth) {
            return JSON.parse(sessionAuth);
        }

        if (localAuth) {
            const authData = JSON.parse(localAuth);
            // Check if login is within 7 days for remember me
            const loginTime = new Date(authData.loginTime);
            const now = new Date();
            const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);

            if (daysDiff <= 7) {
                return authData;
            } else {
                localStorage.removeItem('thoronAuth');
            }
        }

        return null;
    }

    logout() {
        localStorage.removeItem('thoronAuth');
        sessionStorage.removeItem('thoronAuth');
        window.location.href = 'login.html';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Export for use in other modules
window.AuthManager = AuthManager;