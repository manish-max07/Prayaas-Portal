# Prayaas-Portal — Database Schema & Architecture Design

This document details the MongoDB schema plan, relationship structure, query designs, and security routing decisions for **Prayaas-Portal** (a TCS iON styled online examination portal).

---

## 1. Collections & Data Models Design

### 1.1 User Collection (`users`)
Stores registered student/candidate profiles.

```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user"],
    default: "user"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

---

### 1.2 Admin Collection (`admins`)
Dedicated collection for administrative access, credential management, and isolation from standard user authentication pools.

```javascript
{
  _id: ObjectId,
  username: {
    type: String,
    required: true,
    unique: true,
    default: "AdminManish",
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
    // Initial seeded password default: "admin" (hashed with bcrypt), changeable via admin settings
  },
  role: {
    type: String,
    enum: ["admin"],
    default: "admin"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

---

### 1.3 ExamPaper Collection (`exampapers`)
Stores master examination papers, metadata, timing rules, and sections.

```javascript
{
  _id: ObjectId,
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  examCategory: {
    type: String,
    required: true,
    enum: ["SSC", "Banking", "Railway", "State PSC", "UPSC", "Defence", "Teaching", "Other"],
    index: true
  },
  totalDurationMinutes: {
    type: Number,
    required: true,
    default: 60 // Admin editable
  },
  status: {
    type: String,
    enum: ["draft", "live"],
    default: "draft",
    index: true
  },
  sections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section"
    }
  ],
  negativeMarkingEnabled: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

---

### 1.4 Section Collection (`sections`)
Represents subject divisions or segments inside an exam paper (e.g., "Part A - General Intelligence", "Part B - Quantitative Aptitude").

```javascript
{
  _id: ObjectId,
  examPaper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamPaper",
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true, // e.g. "Part 1 General Knowledge"
    trim: true
  },
  order: {
    type: Number,
    required: true,
    default: 1
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

---

### 1.5 Question Collection (`questions`)
Stores individual questions with long text support, remote image attachments, options, and marking rules.

```javascript
{
  _id: ObjectId,
  examPaper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamPaper",
    required: true,
    index: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
    index: true
  },
  questionText: {
    type: String,
    required: true // Supports rich text, HTML, and long paragraphs (reading comprehension, case studies, etc.)
  },
  imageUrl: {
    type: String,
    default: null // Optional direct web image link/URL (diagrams, maps, graphs)
  },
  options: [
    {
      type: String,
      required: true // Exactly 4 options for standard MCQ format
    }
  ],
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  marksForCorrect: {
    type: Number,
    required: true,
    default: 1.0
  },
  negativeMarks: {
    type: Number,
    required: true,
    default: 0.25
  },
  order: {
    type: Number,
    required: true,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

---

### 1.6 Attempt Collection (`attempts`)
Maintains student exam sessions, state tracking per question (mirroring TCS iON test palette states), and final computed scores.

```javascript
{
  _id: ObjectId,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  examPaper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamPaper",
    required: true,
    index: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  submitTime: {
    type: Date,
    default: null
  },
  timeTakenSeconds: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["in-progress", "submitted", "auto-submitted"],
    default: "in-progress",
    index: true
  },
  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
      },
      selectedOption: {
        type: Number, // 0, 1, 2, 3 or null if unselected
        default: null
      },
      status: {
        type: String,
        enum: [
          "not-visited",          // Grey / White
          "not-answered",         // Red (visited but not answered)
          "answered",             // Green (answered)
          "marked-for-review",    // Purple (marked for review, no answer)
          "answered-and-marked"   // Purple with green dot (answered & marked for review)
        ],
        default: "not-visited"
      },
      isCorrect: {
        type: Boolean,
        default: null
      },
      marksAwarded: {
        type: Number,
        default: 0
      }
    }
  ],
  score: {
    type: Number,
    default: 0,
    index: true
  },
  correctCount: {
    type: Number,
    default: 0
  },
  wrongCount: {
    type: Number,
    default: 0
  },
  unansweredCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

---

## 2. Leaderboard Design Decision

Instead of maintaining a separate, redundant `LeaderboardEntry` collection that requires write synchronization and risks inconsistency, **Leaderboard is computed dynamically via an aggregated query on the `Attempt` collection**.

### Query Strategy:
- **Filter**: `examPaper: <ExamPaperId>`, `status: { $in: ["submitted", "auto-submitted"] }`
- **Sort**:
  1. `score: -1` (Highest score first)
  2. `timeTakenSeconds: 1` (Fastest completion time breaks ties)
  3. `submitTime: 1` (Earlier submission breaks further ties)
- **Deduplication Option (Best Attempt per User)**: Using MongoDB `$group` aggregation pipeline grouped by `user` keeping `$max: "$score"` or first completed attempt.
- **Index Optimization**: A compound index `{ examPaper: 1, status: 1, score: -1, timeTakenSeconds: 1 }` guarantees rapid real-time leaderboard generation without collection bloat.

---

## 3. Hidden Admin Login Mechanism

The administrative authentication flow is designed to be discrete and inaccessible from standard user flows:

1. **Frontend Hidden Routing**:
   - The admin login page is situated at the non-standard route: `/admin-secret-login`.
   - This route is **never linked** in headers, footers, sidebars, sitemaps, or standard navigation links.
   - Any unauthenticated attempt to access `/admin/*` routes automatically redirects back to the main homepage or `/admin-secret-login`.

2. **Backend Authentication & Route Guarding**:
   - Backend exposes an isolated admin authentication endpoint: `POST /api/admin/login` expecting `{ username, password }`.
   - Verifies against the dedicated `Admin` collection with bcrypt comparison.
   - Issues a JWT with payload `{ id: admin._id, role: "admin" }`.
   - Protected admin APIs (paper creation, Excel upload, section/question management) use an `adminAuthMiddleware` that enforces `req.user.role === 'admin'`.

3. **No DB Schema Bloat**:
   - Standard users exist in `users` collection with `role: "user"`.
   - Administrators exist in `admins` collection with `role: "admin"`.
   - This prevents privilege escalation or accidental leakage of admin accounts in user listing endpoints.
