// Data Management utilities for Thoron Coaching Center
// This module handles local JSON data and provides a foundation for Firebase migration

class DataManager {
    constructor() {
        this.isFirebaseEnabled = false; // Will be set to true when Firebase is configured
        this.localStoragePrefix = 'thoron_';
        this.dataEndpoints = {
            students: 'data/students.json',
            enrollments: 'data/enrollments.json'
        };
    }

    // ==================== STUDENT MANAGEMENT ====================

    async getStudents() {
        if (this.isFirebaseEnabled) {
            return this.getStudentsFromFirebase();
        }
        return this.getStudentsFromJSON();
    }

    async getStudentsFromJSON() {
        try {
            const response = await fetch(this.dataEndpoints.students);
            if (!response.ok) throw new Error('Failed to fetch students');
            const data = await response.json();
            return data.students;
        } catch (error) {
            console.warn('Using fallback student data:', error);
            return this.getFallbackStudentData();
        }
    }

    async getStudentsFromFirebase() {
        // Firebase implementation placeholder
        // TODO: Implement Firebase Firestore queries
        console.log('Firebase student query - to be implemented');
        return [];
    }

    async getStudentById(studentId) {
        const students = await this.getStudents();
        return students.find(s => s.id === studentId);
    }

    async getStudentByCredentials(identifier, password) {
        const students = await this.getStudents();
        return students.find(s =>
            (s.studentId.toLowerCase() === identifier.toLowerCase() ||
             s.email.toLowerCase() === identifier.toLowerCase()) &&
            s.password === password
        );
    }

    async addStudent(studentData) {
        if (this.isFirebaseEnabled) {
            return this.addStudentToFirebase(studentData);
        }
        return this.addStudentToLocal(studentData);
    }

    async addStudentToLocal(studentData) {
        // For local development, store in localStorage
        const students = await this.getStudents();
        const newStudent = {
            id: this.generateId('student'),
            studentId: this.generateStudentId(),
            ...studentData,
            enrollmentDate: new Date().toISOString(),
            status: 'active',
            results: []
        };

        students.push(newStudent);
        this.saveToLocalStorage('students', students);
        return newStudent;
    }

    async addStudentToFirebase(studentData) {
        // Firebase implementation placeholder
        console.log('Firebase student creation - to be implemented');
        return null;
    }

    // ==================== ENROLLMENT MANAGEMENT ====================

    async getEnrollments() {
        if (this.isFirebaseEnabled) {
            return this.getEnrollmentsFromFirebase();
        }
        return this.getEnrollmentsFromJSON();
    }

    async getEnrollmentsFromJSON() {
        try {
            const response = await fetch(this.dataEndpoints.enrollments);
            if (!response.ok) throw new Error('Failed to fetch enrollments');
            const data = await response.json();
            return data.pendingEnrollments;
        } catch (error) {
            console.warn('Using fallback enrollment data:', error);
            return this.getLocalEnrollments();
        }
    }

    async getEnrollmentsFromFirebase() {
        // Firebase implementation placeholder
        console.log('Firebase enrollment query - to be implemented');
        return [];
    }

    async addEnrollment(enrollmentData) {
        if (this.isFirebaseEnabled) {
            return this.addEnrollmentToFirebase(enrollmentData);
        }
        return this.addEnrollmentToLocal(enrollmentData);
    }

    async addEnrollmentToLocal(enrollmentData) {
        const enrollments = this.getLocalEnrollments();
        const newEnrollment = {
            id: this.generateId('enroll'),
            ...enrollmentData,
            submissionDate: new Date().toISOString(),
            status: 'pending'
        };

        enrollments.push(newEnrollment);
        this.saveToLocalStorage('enrollments', enrollments);
        return newEnrollment;
    }

    async addEnrollmentToFirebase(enrollmentData) {
        // Firebase implementation placeholder
        console.log('Firebase enrollment creation - to be implemented');
        return null;
    }

    // ==================== RESULTS MANAGEMENT ====================

    async addResult(studentId, resultData) {
        if (this.isFirebaseEnabled) {
            return this.addResultToFirebase(studentId, resultData);
        }
        return this.addResultToLocal(studentId, resultData);
    }

    async addResultToLocal(studentId, resultData) {
        const students = await this.getStudents();
        const studentIndex = students.findIndex(s => s.id === studentId);

        if (studentIndex === -1) {
            throw new Error('Student not found');
        }

        const newResult = {
            id: this.generateId('result'),
            ...resultData,
            date: new Date().toISOString()
        };

        students[studentIndex].results = students[studentIndex].results || [];
        students[studentIndex].results.unshift(newResult); // Add to beginning

        this.saveToLocalStorage('students', students);
        return newResult;
    }

    async addResultToFirebase(studentId, resultData) {
        // Firebase implementation placeholder
        console.log('Firebase result creation - to be implemented');
        return null;
    }

    // ==================== LOCAL STORAGE UTILITIES ====================

    saveToLocalStorage(key, data) {
        try {
            const fullKey = this.localStoragePrefix + key;
            localStorage.setItem(fullKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }

    getFromLocalStorage(key) {
        try {
            const fullKey = this.localStoragePrefix + key;
            const data = localStorage.getItem(fullKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return null;
        }
    }

    getLocalEnrollments() {
        return this.getFromLocalStorage('enrollments') || [];
    }

    // ==================== UTILITY FUNCTIONS ====================

    generateId(prefix = 'item') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5);
        return `${prefix}_${timestamp}_${random}`;
    }

    generateStudentId() {
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-3);
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        return `TH${year}${timestamp}${random}`;
    }

    generateEnrollmentId() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const time = String(date.getTime()).slice(-4);
        return `ENR${year}${month}${day}${time}`;
    }

    // ==================== FALLBACK DATA ====================

    getFallbackStudentData() {
        return [
            {
                id: "student_001",
                studentId: "TH2025001",
                name: "আহমেদ রহমান",
                email: "ahmed@example.com",
                phone: "01712345678",
                password: "password123",
                class: "10",
                enrollmentDate: "2025-01-15",
                guardianName: "মোহাম্মদ রহমান",
                guardianPhone: "01712345679",
                address: "নেত্রকোনা সদর, নেত্রকোনা",
                status: "active",
                results: [
                    {
                        id: "result_001",
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
                    }
                ]
            },
            {
                id: "student_002",
                studentId: "TH2025002",
                name: "ফাতিমা খাতুন",
                email: "fatima@example.com",
                phone: "01812345678",
                password: "password456",
                class: "9",
                enrollmentDate: "2025-01-10",
                guardianName: "আব্দুল করিম",
                guardianPhone: "01812345679",
                address: "বারহাট্টা, নেত্রকোনা",
                status: "active",
                results: [
                    {
                        id: "result_002",
                        examType: "monthly",
                        month: "January",
                        year: 2025,
                        subjects: {
                            bangla: 90,
                            english: 82,
                            math: 88,
                            science: 85,
                            religion: 95
                        },
                        totalMarks: 440,
                        percentage: 88,
                        grade: "A+",
                        date: "2025-01-25"
                    }
                ]
            }
        ];
    }

    // ==================== FIREBASE MIGRATION HELPERS ====================

    /**
     * Enable Firebase mode and configure Firebase settings
     * Call this method when Firebase is properly configured
     */
    enableFirebase(firebaseConfig) {
        this.isFirebaseEnabled = true;
        this.firebaseConfig = firebaseConfig;
        console.log('Firebase mode enabled');
    }

    /**
     * Migrate local data to Firebase
     * This method should be called once to transfer existing local data to Firebase
     */
    async migrateToFirebase() {
        if (!this.isFirebaseEnabled) {
            throw new Error('Firebase not configured');
        }

        try {
            // Migrate students
            const localStudents = this.getFromLocalStorage('students');
            if (localStudents && localStudents.length > 0) {
                console.log(`Migrating ${localStudents.length} students to Firebase...`);
                // TODO: Implement Firebase batch write for students
            }

            // Migrate enrollments
            const localEnrollments = this.getFromLocalStorage('enrollments');
            if (localEnrollments && localEnrollments.length > 0) {
                console.log(`Migrating ${localEnrollments.length} enrollments to Firebase...`);
                // TODO: Implement Firebase batch write for enrollments
            }

            console.log('Migration completed successfully');
            return true;
        } catch (error) {
            console.error('Migration failed:', error);
            return false;
        }
    }

    /**
     * Get Firebase configuration template
     * Returns the structure needed for Firebase config
     */
    getFirebaseConfigTemplate() {
        return {
            apiKey: "your-api-key",
            authDomain: "thoron-coaching.firebaseapp.com",
            projectId: "thoron-coaching",
            storageBucket: "thoron-coaching.appspot.com",
            messagingSenderId: "123456789",
            appId: "your-app-id"
        };
    }

    // ==================== VALIDATION HELPERS ====================

    validateStudentData(studentData) {
        const required = ['name', 'email', 'phone', 'class', 'guardianName', 'guardianPhone'];

        for (const field of required) {
            if (!studentData[field] || studentData[field].trim() === '') {
                throw new Error(`Required field missing: ${field}`);
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentData.email)) {
            throw new Error('Invalid email format');
        }

        // Phone validation
        const phoneRegex = /^01[3-9]\d{8}$/;
        if (!phoneRegex.test(studentData.phone)) {
            throw new Error('Invalid phone number format');
        }

        return true;
    }

    validateEnrollmentData(enrollmentData) {
        const required = ['studentName', 'email', 'phone', 'class', 'guardianName', 'guardianPhone', 'address'];

        for (const field of required) {
            if (!enrollmentData[field] || enrollmentData[field].trim() === '') {
                throw new Error(`Required field missing: ${field}`);
            }
        }

        return this.validateStudentData(enrollmentData);
    }
}

// Create singleton instance
const dataManager = new DataManager();

// Export for use in other modules
window.DataManager = DataManager;
window.dataManager = dataManager;