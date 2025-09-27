// Dashboard functionality for Thoron Coaching Center
class DashboardManager {
    constructor() {
        this.authManager = new AuthManager();
        this.currentStudent = null;
        this.performanceChart = null;

        this.initializeDashboard();
    }

    async initializeDashboard() {
        // Check authentication
        const authData = this.authManager.getAuthData();
        if (!authData) {
            window.location.href = 'login.html';
            return;
        }

        try {
            // Load student data
            await this.loadStudentData(authData.studentId);

            // Initialize UI components
            this.setupEventListeners();
            this.updateCurrentDate();
            this.updateStudentInfo();
            this.loadRecentResults();
            this.initializePerformanceChart();
            this.calculateStats();

        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.showError('ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে।');
        }
    }

    async loadStudentData(studentId) {
        try {
            const response = await fetch('data/students.json');
            if (!response.ok) {
                throw new Error('Student data not found');
            }

            const data = await response.json();
            this.currentStudent = data.students.find(s => s.id === studentId);

            if (!this.currentStudent) {
                throw new Error('Student not found');
            }
        } catch (error) {
            // Fallback to demo data
            console.warn('Using demo student data');
            this.currentStudent = {
                id: "student_001",
                studentId: "TH2025001",
                name: "আহমেদ রহমান",
                email: "ahmed@example.com",
                phone: "01712345678",
                class: "10",
                enrollmentDate: "2025-01-15",
                guardianName: "মোহাম্মদ রহমান",
                guardianPhone: "01712345679",
                address: "নেত্রকোনা সদর, নেত্রকোনা",
                status: "active",
                results: [
                    {
                        examType: "monthly",
                        month: "January",
                        year: 2025,
                        subjects: {
                            bangla: 85,
                            english: 78,
                            math: 92,
                            science: 88,
                            religion: 90
                        },
                        totalMarks: 433,
                        percentage: 86.6,
                        grade: "A+",
                        date: "2025-01-25"
                    },
                    {
                        examType: "weekly",
                        month: "January",
                        year: 2025,
                        subjects: {
                            bangla: 88,
                            english: 82,
                            math: 95,
                            science: 90,
                            religion: 92
                        },
                        totalMarks: 447,
                        percentage: 89.4,
                        grade: "A+",
                        date: "2025-01-18"
                    }
                ]
            };
        }
    }

    setupEventListeners() {
        // Profile dropdown
        const profileDropdown = document.getElementById('profileDropdown');
        const dropdownMenu = document.getElementById('dropdownMenu');

        profileDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdownMenu.classList.add('hidden');
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Quick action buttons
        this.setupQuickActions();
    }

    setupQuickActions() {
        const quickActionButtons = document.querySelectorAll('.bg-blue-50, .bg-green-50, .bg-purple-50, .bg-orange-50');

        quickActionButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                switch(index) {
                    case 0: // Download results
                        this.downloadResults();
                        break;
                    case 1: // Exam schedule
                        this.showExamSchedule();
                        break;
                    case 2: // Curriculum
                        this.showCurriculum();
                        break;
                    case 3: // Contact teacher
                        this.contactTeacher();
                        break;
                }
            });
        });
    }

    updateCurrentDate() {
        const currentDateElement = document.getElementById('currentDate');
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };

        // Bengali date format
        const banglaDate = now.toLocaleDateString('bn-BD', options);
        currentDateElement.textContent = banglaDate;
    }

    updateStudentInfo() {
        if (!this.currentStudent) return;

        // Update header info
        document.getElementById('studentName').textContent = this.currentStudent.name;
        document.getElementById('studentClass').textContent = `ক্লাস ${this.currentStudent.class}`;

        // Update welcome section
        document.getElementById('welcomeName').textContent = this.currentStudent.name;
        document.getElementById('studentIdDisplay').textContent = this.currentStudent.studentId;
    }

    loadRecentResults() {
        const resultsContainer = document.getElementById('recentResults');

        if (!this.currentStudent || !this.currentStudent.results) {
            resultsContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-clipboard text-3xl mb-4"></i>
                    <p>এখনো কোন পরীক্ষার ফলাফল নেই</p>
                </div>
            `;
            return;
        }

        const results = this.currentStudent.results.slice(0, 3); // Show last 3 results

        resultsContainer.innerHTML = results.map(result => `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-semibold text-gray-900">
                            ${result.examType === 'monthly' ? 'মাসিক পরীক্ষা' : 'সাপ্তাহিক পরীক্ষা'}
                        </h4>
                        <p class="text-sm text-gray-600">${result.month} ${result.year}</p>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getGradeColorClass(result.grade)}">
                            ${result.grade}
                        </span>
                        <p class="text-sm text-gray-600 mt-1">${result.percentage}%</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                    ${Object.entries(result.subjects).map(([subject, marks]) => `
                        <div class="flex justify-between">
                            <span class="text-gray-600">${this.getSubjectName(subject)}:</span>
                            <span class="font-medium">${marks}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="mt-3 pt-3 border-t border-gray-100">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">মোট নম্বর:</span>
                        <span class="font-semibold text-gray-900">${result.totalMarks}/500</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    calculateStats() {
        if (!this.currentStudent || !this.currentStudent.results) {
            return;
        }

        const results = this.currentStudent.results;

        // Calculate average marks
        const totalPercentage = results.reduce((sum, result) => sum + result.percentage, 0);
        const averagePercentage = (totalPercentage / results.length).toFixed(1);

        // Get latest grade
        const latestGrade = results[0]?.grade || '--';

        // Calculate attendance (mock data)
        const attendanceRate = Math.floor(Math.random() * 10) + 85; // 85-95%

        // Total exams
        const totalExams = results.length;

        // Update stats cards
        document.getElementById('averageMarks').textContent = `${averagePercentage}%`;
        document.getElementById('currentGrade').textContent = latestGrade;
        document.getElementById('attendanceRate').textContent = `${attendanceRate}%`;
        document.getElementById('totalExams').textContent = totalExams;
    }

    initializePerformanceChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');

        if (!this.currentStudent || !this.currentStudent.results) {
            return;
        }

        const results = this.currentStudent.results.slice(-6); // Last 6 results

        const labels = results.map(result => `${result.month.slice(0, 3)} ${result.year}`);
        const data = results.map(result => result.percentage);

        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'পারফরম্যান্স (%)',
                    data: data,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(34, 197, 94)',
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                }
            }
        });
    }

    getSubjectName(subject) {
        const subjectMap = {
            bangla: 'বাংলা',
            english: 'ইংরেজি',
            math: 'গণিত',
            science: 'বিজ্ঞান',
            religion: 'ধর্ম',
            physics: 'পদার্থ',
            chemistry: 'রসায়ন',
            biology: 'জীববিজ্ঞান',
            ict: 'আইসিটি'
        };

        return subjectMap[subject] || subject;
    }

    getGradeColorClass(grade) {
        switch(grade) {
            case 'A+':
                return 'bg-green-100 text-green-800';
            case 'A':
                return 'bg-blue-100 text-blue-800';
            case 'A-':
                return 'bg-indigo-100 text-indigo-800';
            case 'B':
                return 'bg-yellow-100 text-yellow-800';
            case 'C':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    // Quick Action Methods
    downloadResults() {
        if (!this.currentStudent || !this.currentStudent.results) {
            alert('কোন ফলাফল পাওয়া যায়নি।');
            return;
        }

        // Create downloadable content
        const results = this.currentStudent.results;
        let content = `ত্বরণ কোচিং সেন্টার\nশিক্ষার্থীর ফলাফল\n\n`;
        content += `নাম: ${this.currentStudent.name}\n`;
        content += `আইডি: ${this.currentStudent.studentId}\n`;
        content += `ক্লাস: ${this.currentStudent.class}\n\n`;

        results.forEach((result, index) => {
            content += `${index + 1}. ${result.examType === 'monthly' ? 'মাসিক' : 'সাপ্তাহিক'} পরীক্ষা - ${result.month} ${result.year}\n`;
            content += `গ্রেড: ${result.grade}, শতকরা: ${result.percentage}%\n`;
            content += `মোট নম্বর: ${result.totalMarks}/500\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentStudent.studentId}_results.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showExamSchedule() {
        alert('পরীক্ষার সময়সূচী:\n\n• মাসিক পরীক্ষা: প্রতি মাসের ২০ তারিখ\n• সাপ্তাহিক পরীক্ষা: প্রতি শনিবার\n• অর্ধবার্ষিক: জুন মাস\n• বার্ষিক: নভেম্বর মাস');
    }

    showCurriculum() {
        const classSubjects = {
            '5': ['বাংলা', 'ইংরেজি', 'গণিত'],
            '6': ['বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান'],
            '7': ['বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান', 'আইসিটি'],
            '8': ['বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান', 'আইসিটি'],
            '9': ['বাংলা', 'ইংরেজি', 'গণিত', 'পদার্থ', 'রসায়ন', 'জীববিজ্ঞান'],
            '10': ['বাংলা', 'ইংরেজি', 'গণিত', 'পদার্থ', 'রসায়ন', 'জীববিজ্ঞান']
        };

        const subjects = classSubjects[this.currentStudent.class] || [];
        alert(`ক্লাস ${this.currentStudent.class} এর পাঠ্যক্রম:\n\n${subjects.join('\n')}`);
    }

    contactTeacher() {
        alert('শিক্ষকের সাথে যোগাযোগ:\n\nShovo Sir: 0132525236885\nHena Mam: 01716411875\nNurul Sir: 01714734060\n\nঅথবা অফিসে সরাসরি যোগাযোগ করুন।');
    }

    logout() {
        if (confirm('আপনি কি লগআউট করতে চান?')) {
            this.authManager.logout();
        }
    }

    showError(message) {
        console.error(message);
        // You could implement a toast notification here
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});