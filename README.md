# KosLearn - Learning Management System 🎓

KosLearn is a full-stack Learning Management System (LMS) clone similar to Udemy, built to demonstrate modern web development practices. It features course exploration, video streaming, student enrollment, instructor reviews, and a responsive shopping-cart style purchasing flow.

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, React Router v7, Axios, Lucide React
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL (hosted on Aiven)
- **Authentication**: JWT (JSON Web Tokens) with HttpOnly cookies & bcrypt for secure password hashing
- **Deployment**: Vercel (Frontend), Railway/Render (Backend)

## ✨ Key Features

- **Authentication & Authorization**: Secure signup and login for Students and Instructors.
- **Course Discovery**: Browse, filter, and search through a rich catalog of courses.
- **Video Playback**: Embedded YouTube video player with progress tracking.
- **Progress Tracking**: Automatic tracking of completed lectures and resume-where-you-left-off.
- **Reviews & Ratings**: Students can leave ratings and reviews for enrolled courses.
- **Instructor Dashboard**: (Coming Soon) Instructors can manage their own courses.

## 📸 Screenshots

*(Add screenshots of your application here)*
- **Home Page**: `![Home](docs/home.png)`
- **Course Details**: `![Details](docs/details.png)`
- **Video Player**: `![Player](docs/player.png)`

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (Local or Cloud)

### 1. Clone the repository
```bash
git clone https://github.com/saikumarlp/Kods_LMS.git
cd Kods_LMS
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory using `.env.example` as a template:
```env
DATABASE_URL="postgresql://user:password@host:port/defaultdb?sslmode=require"
JWT_SECRET="your_jwt_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

Initialize the database:
```bash
npx prisma db push
node seed.js # Optional: Seeds the database with sample courses
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL="http://localhost:5000/api"
```

Start the development server:
```bash
npm run dev
```

## 🌐 Deployment Steps

The project is structured to easily deploy on modern cloud platforms.

**Frontend (Vercel)**
1. Connect your GitHub repository to Vercel.
2. Select the `frontend` directory as the Root Directory.
3. Add `VITE_API_URL` to Vercel Environment Variables pointing to your deployed backend URL.
4. The included `vercel.json` will automatically handle client-side routing rewrites.

**Backend (Render)**
1. Connect your GitHub repository to Render and create a new **Web Service**.
2. Set the **Root Directory** to `backend`.
3. Set the **Build Command** to `npm install && npm run build`. (This installs dependencies and generates the Prisma client).
4. Set the **Start Command** to `npm start`.
5. Add the required **Environment Variables** in the Render dashboard:
   - `DATABASE_URL` (Your Aiven PostgreSQL URL, ensure it has `?sslmode=require`)
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `FRONTEND_URL` (Your Vercel frontend URL, e.g., `https://your-app.vercel.app`)

## 📡 API Summary (Backend Routes)

- **Authentication**
  - `POST /api/auth/register` - Create a student or instructor account
  - `POST /api/auth/login` - Authenticate and receive a JWT

- **Courses**
  - `GET /api/courses` - Fetch public course catalog
  - `GET /api/courses/:id` - Fetch detailed syllabus for a specific course

- **Enrollments**
  - `POST /api/enrollments` - Enroll in a course (Requires Auth)
  - `GET /api/enrollments` - Get user's enrolled courses (Requires Auth)
  - `PUT /api/enrollments/progress` - Update video playback progress (Requires Auth)

- **Reviews**
  - `POST /api/reviews` - Submit a review for a course
  - `GET /api/reviews/course/:id` - Get all reviews for a course

## 🛡️ Security

We take security seriously. Please review our [SECURITY.md](SECURITY.md) before reporting any vulnerabilities. Environment variables are strictly ignored to prevent leakage of credentials.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
