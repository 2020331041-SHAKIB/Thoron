// Enrollment functionality for Thoron Coaching Center
class EnrollmentManager {
    constructor() {
        this.classData = {
            "5": { "name": "ক্লাস ৫", "fee": 800, "subjects": ["বাংলা", "ইংরেজি", "গণিত"] },
            "6": { "name": "ক্লাস ৬", "fee": 900, "subjects": ["বাংলা", "ইংরেজি", "গণিত", "বিজ্ঞান"] },
            "7": { "name": "ক্লাস ৭", "fee": 1000, "subjects": ["বাংলা", "ইংরেজি", "গণিত", "বিজ্ঞান", "আইসিটি"] },
            "8": { "name": "ক্লাস ৮", "fee": 1100, "subjects": ["বাংলা", "ইংরেজি", "গণিত", "বিজ্ঞান", "আইসিটি"] },
            "9": { "name": "ক্লাস ৯", "fee": 1200, "subjects": ["বাংলা", "ইংরেজি", "গণিত", "পদার্থ", "রসায়ন", "জীববিজ্ঞান"] },
            "10": { "name": "ক্লাস ১০", "fee": 1300, "subjects": ["বাংলা", "ইংরেজি", "গণিত", "পদার্থ", "রসায়ন", "জীববিজ্ঞান"] }
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const enrollmentForm = document.getElementById('enrollmentForm');
        if (enrollmentForm) {
            enrollmentForm.addEventListener('submit', this.handleEnrollment.bind(this));
        }

        // Class selection change handler
        const classSelect = document.getElementById('class');
        if (classSelect) {
            classSelect.addEventListener('change', this.showClassInfo.bind(this));
        }

        // Phone number formatting
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', this.formatPhoneNumber.bind(this));
        });

        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', this.validateEmail.bind(this));
        }
    }

    async handleEnrollment(e) {
        e.preventDefault();

        // Show loading state
        this.showLoading(true);
        this.hideMessages();

        try {
            // Validate form
            const formData = this.getFormData();
            this.validateFormData(formData);

            // Simulate API delay
            await this.delay(1500);

            // Generate enrollment ID
            const enrollmentId = this.generateEnrollmentId();

            // Create enrollment object
            const enrollment = {
                id: enrollmentId,
                ...formData,
                submissionDate: new Date().toISOString(),
                status: 'pending'
            };

            // Save enrollment (simulate API call)
            await this.saveEnrollment(enrollment);

            // Show success message
            this.showSuccess(`
                আপনার ভর্তির আবেদন সফলভাবে জমা হয়েছে!
                <br><br>
                <strong>আবেদন নম্বর:</strong> ${enrollmentId}
                <br>
                <strong>পরবর্তী করণীয়:</strong>
                <br>• আমাদের অফিসে যোগাযোগ করুন
                <br>• ভর্তি ফি জমা দিন
                <br>• প্রয়োজনীয় কাগজপত্র নিয়ে আসুন
                <br><br>
                <em>আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</em>
            `);

            // Reset form after 3 seconds
            setTimeout(() => {
                enrollmentForm.reset();
                this.hideClassInfo();
            }, 3000);

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    getFormData() {
        const form = document.getElementById('enrollmentForm');
        const formData = new FormData(form);

        return {
            studentName: formData.get('studentName'),
            class: formData.get('class'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            guardianName: formData.get('guardianName'),
            guardianPhone: formData.get('guardianPhone'),
            relation: formData.get('relation'),
            previousSchool: formData.get('previousSchool'),
            notes: formData.get('notes'),
            terms: formData.get('terms')
        };
    }

    validateFormData(data) {
        // Required field validation
        const requiredFields = {
            studentName: 'শিক্ষার্থীর নাম',
            class: 'ক্লাস',
            email: 'ইমেইল ঠিকানা',
            phone: 'মোবাইল নম্বর',
            address: 'ঠিকানা',
            guardianName: 'অভিভাবকের নাম',
            guardianPhone: 'অভিভাবকের মোবাইল'
        };

        for (const [field, label] of Object.entries(requiredFields)) {
            if (!data[field] || data[field].trim() === '') {
                throw new Error(`${label} পূরণ করা আবশ্যক।`);
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('সঠিক ইমেইল ঠিকানা দিন।');
        }

        // Phone validation
        const phoneRegex = /^01[3-9]\d{8}$/;
        if (!phoneRegex.test(data.phone)) {
            throw new Error('সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)।');
        }

        if (!phoneRegex.test(data.guardianPhone)) {
            throw new Error('অভিভাবকের সঠিক মোবাইল নম্বর দিন।');
        }

        // Terms validation
        if (!data.terms) {
            throw new Error('নিয়মাবলী ও শর্তাদি মেনে নেওয়া আবশ্যক।');
        }

        // Name validation
        if (data.studentName.length < 3) {
            throw new Error('শিক্ষার্থীর নাম কমপক্ষে ৩ অক্ষরের হতে হবে।');
        }

        if (data.guardianName.length < 3) {
            throw new Error('অভিভাবকের নাম কমপক্ষে ৩ অক্ষরের হতে হবে।');
        }
    }

    showClassInfo() {
        const classSelect = document.getElementById('class');
        const classInfoDiv = document.getElementById('classInfo');
        const classDetailsDiv = document.getElementById('classDetails');

        const selectedClass = classSelect.value;

        if (selectedClass && this.classData[selectedClass]) {
            const classInfo = this.classData[selectedClass];

            classDetailsDiv.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p><strong>ক্লাস:</strong> ${classInfo.name}</p>
                        <p><strong>মাসিক ফি:</strong> ৳${classInfo.fee}</p>
                    </div>
                    <div>
                        <p><strong>বিষয়সমূহ:</strong></p>
                        <p class="text-lime-600">${classInfo.subjects.join(', ')}</p>
                    </div>
                </div>
            `;

            classInfoDiv.classList.remove('hidden');
        } else {
            this.hideClassInfo();
        }
    }

    hideClassInfo() {
        const classInfoDiv = document.getElementById('classInfo');
        classInfoDiv.classList.add('hidden');
    }

    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');

        // Limit to 11 digits
        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        e.target.value = value;

        // Real-time validation feedback
        const phoneRegex = /^01[3-9]\d{8}$/;
        if (value.length === 11 && !phoneRegex.test(value)) {
            e.target.classList.add('border-red-500');
        } else {
            e.target.classList.remove('border-red-500');
        }
    }

    validateEmail(e) {
        const email = e.target.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email && !emailRegex.test(email)) {
            e.target.classList.add('border-red-500');
        } else {
            e.target.classList.remove('border-red-500');
        }
    }

    generateEnrollmentId() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const time = String(date.getTime()).slice(-4);

        return `ENR${year}${month}${day}${time}`;
    }

    async saveEnrollment(enrollment) {
        // In a real application, this would send data to a server
        // For now, we'll save to localStorage as a simulation

        try {
            const existingEnrollments = JSON.parse(localStorage.getItem('thoronEnrollments') || '[]');
            existingEnrollments.push(enrollment);
            localStorage.setItem('thoronEnrollments', JSON.stringify(existingEnrollments));

            console.log('Enrollment saved:', enrollment);
            return { success: true, id: enrollment.id };
        } catch (error) {
            throw new Error('ডেটা সংরক্ষণে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
        }
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const submitBtn = document.getElementById('submitBtn');

        if (show) {
            loadingState.classList.remove('hidden');
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            loadingState.classList.add('hidden');
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        const errorSpan = errorDiv.querySelector('span');

        errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded';
        errorSpan.innerHTML = message;
        errorDiv.classList.remove('hidden');

        // Scroll to error message
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Auto hide after 8 seconds
        setTimeout(() => {
            this.hideMessages();
        }, 8000);
    }

    showSuccess(message) {
        const successDiv = document.getElementById('successMessage');
        const successSpan = successDiv.querySelector('span');

        successSpan.innerHTML = message;
        successDiv.classList.remove('hidden');

        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    hideMessages() {
        const errorDiv = document.getElementById('errorMessage');
        const successDiv = document.getElementById('successMessage');

        errorDiv.classList.add('hidden');
        successDiv.classList.add('hidden');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize enrollment manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EnrollmentManager();
});

// Export for use in other modules
window.EnrollmentManager = EnrollmentManager;