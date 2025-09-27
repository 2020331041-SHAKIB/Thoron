# Firebase Setup Guide for Thoron Coaching Center

This guide helps you migrate from the current JSON-based data storage to Firebase for production use.

## Prerequisites

1. Google/Gmail account
2. Basic understanding of Firebase console
3. Access to the project files

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Project name: `thoron-coaching-center`
4. Enable Google Analytics (optional)
5. Complete project creation

## Step 2: Configure Firestore Database

1. In Firebase console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select your preferred location (asia-south1 for Bangladesh)

### Database Structure

Create these collections in Firestore:

```
thoron-coaching-center/
├── students/
│   └── {studentId}/
│       ├── id: string
│       ├── studentId: string
│       ├── name: string
│       ├── email: string
│       ├── phone: string
│       ├── password: string (hashed in production)
│       ├── class: string
│       ├── enrollmentDate: timestamp
│       ├── guardianName: string
│       ├── guardianPhone: string
│       ├── address: string
│       ├── status: string
│       └── results: array
│
├── enrollments/
│   └── {enrollmentId}/
│       ├── id: string
│       ├── studentName: string
│       ├── email: string
│       ├── phone: string
│       ├── class: string
│       ├── guardianName: string
│       ├── guardianPhone: string
│       ├── address: string
│       ├── submissionDate: timestamp
│       ├── status: string
│       └── notes: string
│
└── results/
    └── {resultId}/
        ├── studentId: string
        ├── examType: string
        ├── month: string
        ├── year: number
        ├── subjects: object
        ├── totalMarks: number
        ├── percentage: number
        ├── grade: string
        └── date: timestamp
```

## Step 3: Web App Configuration

1. In Firebase console, click on "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web" (</>)
4. App nickname: `thoron-web-app`
5. Register app
6. Copy the Firebase configuration object

## Step 4: Update Project Files

### 4.1 Create Firebase Config File

Create `js/firebase-config.js`:

```javascript
// Firebase configuration
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "thoron-coaching.firebaseapp.com",
    projectId: "thoron-coaching",
    storageBucket: "thoron-coaching.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id-here"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 4.2 Add Firebase SDK

Add these script tags to your HTML files (before your custom JS):

```html
<!-- Firebase v9 SDK -->
<script type="module">
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
  import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
  import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
</script>
```

### 4.3 Enable Firebase in DataManager

In your main application initialization:

```javascript
// Enable Firebase mode
dataManager.enableFirebase(firebaseConfig);

// Optional: Migrate existing local data
dataManager.migrateToFirebase();
```

## Step 5: Implement Firebase Methods

Update `js/dataManager.js` to implement Firebase methods:

### Students Collection

```javascript
async getStudentsFromFirebase() {
    const studentsRef = collection(db, 'students');
    const snapshot = await getDocs(studentsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async addStudentToFirebase(studentData) {
    const studentsRef = collection(db, 'students');
    const docRef = await addDoc(studentsRef, {
        ...studentData,
        enrollmentDate: serverTimestamp(),
        status: 'active',
        results: []
    });
    return { id: docRef.id, ...studentData };
}
```

### Enrollments Collection

```javascript
async addEnrollmentToFirebase(enrollmentData) {
    const enrollmentsRef = collection(db, 'enrollments');
    const docRef = await addDoc(enrollmentsRef, {
        ...enrollmentData,
        submissionDate: serverTimestamp(),
        status: 'pending'
    });
    return { id: docRef.id, ...enrollmentData };
}
```

## Step 6: Security Rules

Set up Firestore security rules in Firebase console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Students can read their own data
    match /students/{studentId} {
      allow read: if request.auth != null && request.auth.uid == studentId;
      allow write: if request.auth != null && request.auth.uid == studentId;
    }

    // Allow enrollment submissions
    match /enrollments/{enrollmentId} {
      allow create: if true; // Anyone can submit enrollment
      allow read, update: if request.auth != null; // Only authenticated users can read/update
    }

    // Results are read-only for students
    match /results/{resultId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admin can write results
    }
  }
}
```

## Step 7: Authentication Setup

### 7.1 Enable Authentication

1. In Firebase console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"

### 7.2 Update Auth Logic

Replace password-based auth with Firebase Auth:

```javascript
// In auth.js
import { signInWithEmailAndPassword } from 'firebase/auth';

async handleFirebaseLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get student data from Firestore
        const studentDoc = await getDoc(doc(db, 'students', user.uid));
        return { user, studentData: studentDoc.data() };
    } catch (error) {
        throw new Error('Login failed: ' + error.message);
    }
}
```

## Step 8: Testing

1. Test the application with Firebase in development
2. Verify data is being saved to Firestore
3. Test authentication flow
4. Check security rules

## Step 9: Production Deployment

1. Update Firestore rules for production (more restrictive)
2. Use environment variables for Firebase config
3. Enable security features (App Check, etc.)
4. Set up monitoring and analytics

## Migration Checklist

- [ ] Firebase project created
- [ ] Firestore database configured
- [ ] Web app registered and config obtained
- [ ] Firebase SDK added to HTML files
- [ ] DataManager Firebase methods implemented
- [ ] Authentication configured
- [ ] Security rules set up
- [ ] Local data migrated to Firebase
- [ ] Application tested with Firebase
- [ ] Production deployment completed

## Support

If you need help with Firebase setup:

1. Check [Firebase Documentation](https://firebase.google.com/docs)
2. Visit [Firebase Console](https://console.firebase.google.com)
3. Contact the development team

## Current Status

✅ **JSON Database**: Working with local JSON files and localStorage
🔄 **Firebase Ready**: Code structure prepared for Firebase migration
⏳ **Firebase Setup**: Follow this guide to enable Firebase

The application currently works with JSON files and can be easily migrated to Firebase when needed.