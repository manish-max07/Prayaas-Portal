# Prayaas-Portal 🎓

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-green?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47a248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-purple.svg)](LICENSE)

**Prayaas-Portal** is a full-stack, enterprise-grade online examination portal and rank predictor platform designed specifically for competitive exam aspirants and test administrators. It delivers an authentic **TCS iON Computer Based Test (CBT)** examination experience alongside an automated **Digialm Response Sheet Rank Calculator & Predictor**.

---

## 🌟 Key Features

### 1. 🖥️ TCS iON Style CBT Simulator
- **Authentic Interface**: Faithful recreation of the actual TCS iON Computer Based Test examination environment (used across major Indian exams like SSC, RRB, GATE, and PSUs).
- **Interactive Question Palette**: Full state tracking for each question:
  - ⚪ Not Visited
  - 🔴 Not Answered
  - 🟢 Answered
  - 🟣 Marked for Review
  - 🟣🟢 Answered & Marked for Review
- **Multi-Section Exams**: Seamless navigation across sections (e.g., General Intelligence, Quantitative Aptitude, Technical domain subjects).
- **Timed Assessments**: Real-time synchronized countdown timers with automatic submission when time expires.
- **Detailed Analytics**: Post-attempt scorecard with sectional breakdown, accuracy percentages, time spent, and question-by-question solution keys.

### 2. 📊 Digialm Response Sheet Rank Predictor
- **Automated HTML Parsing**: Ingests official Digialm / TCS iON candidate response sheet URLs and parses questions, candidate responses, and answer keys.
- **Configurable Marking Schemes**: Calculates raw scores based on exam-specific rules (e.g., +1.0 for correct, -0.25 or -0.33 for incorrect).
- **Real-Time Dynamic Ranks**:
  - **Overall All-India Rank**
  - **Category Rank** (UR, OBC, SC, ST, EWS)
  - **Subject / Trade-wise Rank**
  - **Percentile Calculation**
- **Shareable Rank Card**: Generates a downloadable high-resolution scorecard image complete with candidate details, marks summary, and a verifiable verification QR code.
- **Safe Image Proxy**: Built-in backend proxy with SSRF protection for rendering external response sheet images without CORS issues.

### 3. 🛡️ Administrative Console
- **Dedicated Admin Portal**: Isolated administrative control center separated from public candidate flows.
- **Exam Management**: Create, configure, update, and publish mock papers and rank predictor exams.
- **Bulk Question Upload**: Upload full question papers and option sets via Excel (`.xlsx` / `.xls`) spreadsheets.
- **Submission Moderation**: View candidate submission counts, average/min/max score distributions, and manage leaderboards.

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph TD
    Client["Client Browser<br/>(Candidates & Admins)"] -->|HTTPS / REST API| Frontend["Next.js 16 Frontend<br/>(App Router + Tailwind CSS)"]
    Frontend -->|API Requests + JWT| Backend["Node.js Express Backend<br/>(Authentication & Business Logic)"]
    Backend -->|Mongoose Queries| Database[("MongoDB Database<br/>(Atlas Cluster)")]
    Backend -->|Fetch & Parse| Digialm["TCS iON / Digialm CDN<br/>(Response Sheets)"]
```

### Technology Highlights
| Area | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router) | High-performance server/client rendered UI |
| **UI Library & Styling** | [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) | Modern, responsive, and styled UI components |
| **State & API Handling** | Axios + Context API + js-cookie | Secure cookie/token storage and API integration |
| **Backend Framework** | [Express.js](https://expressjs.com/) on Node.js | Scalable REST API server |
| **Database & ODM** | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Flexible document store for questions, papers, submissions |
| **Authentication** | JWT (JSON Web Tokens) + Bcryptjs | Password hashing and stateless authentication |
| **File Processing** | ExcelJS + Multer + Cheerio/Regex | Spreadsheet ingestion & Digialm HTML response sheet parsing |

---

## 📁 Repository Structure

```
Prayaas-Portal/
├── backend/
│   ├── scripts/                   # Database maintenance & diagnostic scripts
│   ├── src/
│   │   ├── config/                # Database connection (Mongoose/MongoDB)
│   │   ├── controllers/           # Request handlers (auth, exams, attempts, rank calc)
│   │   ├── middleware/            # JWT auth, role validation, error handling
│   │   ├── models/                # Mongoose schemas (User, Admin, ExamPaper, RankExam, etc.)
│   │   ├── routes/                # REST API endpoints
│   │   ├── services/              # Digialm response sheet parsing engine
│   │   ├── utils/                 # Token generator, scoring helper, admin seed utility
│   │   └── server.js              # Express app entry point & CORS configuration
│   ├── .env.example               # Backend environment variable template
│   ├── DATABASE_SCHEMA.md         # Comprehensive database architectural specification
│   └── package.json
│
├── frontend/
│   ├── app/                       # Next.js App Router pages
│   │   ├── admin/                 # Admin dashboard, exam editor, rank predictor admin
│   │   ├── admin-secret-login/    # Admin console authentication page
│   │   ├── exam/                  # CBT test window, TCS iON interface, scorecards
│   │   ├── rank-calculator/       # Candidate rank calculator, scorecards, terms
│   │   └── (auth)/                # Candidate login and signup pages
│   ├── components/                # Reusable UI components (Navbars, Modals, Footers, Palettes)
│   ├── context/                   # React AuthContext
│   ├── lib/                       # API axios client & image helpers
│   ├── public/                    # Static assets, branding logos, icons
│   ├── .env.local.example         # Frontend environment variable template
│   └── package.json
│
├── .gitignore                     # Root-level ignore rules
└── README.md                      # Project documentation
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **MongoDB**: A running local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI

---

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Prayaas-Portal.git
cd Prayaas-Portal
```

---

### 2. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your values:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/prayaas?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   JWT_EXPIRE=7d
   ADMIN_DEFAULT_USERNAME=admin
   ADMIN_DEFAULT_PASSWORD=ChangeThisStrongPassword123!
   FRONTEND_URL=http://localhost:3000
   ```

4. Seed the initial Administrator account:
   ```bash
   npm run seed:admin
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will be available at `http://localhost:5000`.

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   Verify the backend API endpoint:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | No | Port on which the Express server listens (default `5000`) | `5000` |
| `NODE_ENV` | No | Environment mode (`development` or `production`) | `development` |
| `MONGO_URI` | **Yes** | MongoDB connection URI (local or Atlas) | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | **Yes** | Secret string used to sign JSON Web Tokens | `a-very-strong-random-secret-key` |
| `JWT_EXPIRE` | No | Token lifespan (default: `7d`) | `7d` |
| `ADMIN_DEFAULT_USERNAME` | For seed | Username used when running `npm run seed:admin` | `admin` |
| `ADMIN_DEFAULT_PASSWORD` | For seed | Password used when running `npm run seed:admin` | `StrongAdminPassword!` |
| `FRONTEND_URL` | Production | Allowed origin for CORS headers | `https://prayaas-portal.vercel.app` |

### Frontend (`frontend/.env.local`)
| Variable | Required | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | **Yes** | Root URL where the backend Express API is hosted | `http://localhost:5000` or `https://api.yourdomain.com` |

---

## 🌐 Production Deployment

### Frontend (Vercel)
1. Push your repository to GitHub.
2. Import the `frontend` directory into [Vercel](https://vercel.com/).
3. In Vercel Project Settings, set the **Root Directory** to `frontend`.
4. Add the Environment Variable:
   - `NEXT_PUBLIC_API_BASE_URL`: URL of your deployed backend API.
5. Deploy.

### Backend (Render / Railway / VPS)
1. Create a Web Service pointing to your repository.
2. Set the **Root Directory** to `backend`.
3. Set the **Build Command** to `npm install`.
4. Set the **Start Command** to `npm start`.
5. Supply all environment variables listed in the Backend table (`MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, etc.).
6. Update `FRONTEND_URL` to match your production Vercel domain to allow CORS communication.

---

## 🔒 Security Best Practices

- **Never commit `.env` or `.env.local` files**: Both root and sub-packages have `.gitignore` rules preventing `.env` leaks.
- **Rotate Credentials**: If any default passwords or connection strings were used in development, rotate them immediately before production deployment.
- **Admin Password**: After seeding the administrator account, change the password via the Admin Security settings (`/admin/change-password`).
- **SSRF Protection**: The `/api/rank-calculator/proxy-image` route includes protocol verification and private IP rejection to guard against SSRF attacks.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
