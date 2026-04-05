# 🎨 EduManager Frontend

The frontend application for EduManager, a university timetable and academic scheduling platform. This React app provides the admin-facing interface for approvals, academic setup, course allocation, timetable management, conflict detection, CSV uploads, analytics, and reporting.

## 📌 Overview

This frontend is built with React and Vite and is designed to be deployed independently from the backend API. It connects to the backend through a configurable `VITE_API_URL`.

## ✨ Core Features

- User registration and login screens
- Admin dashboard with analytics cards and charts
- Approval management for newly registered users
- Academic setup modules for departments, programs, sessions, semesters, courses, and sections
- Teacher, subject, room, and timetable management screens
- Course allocation workflows
- Time slot management and weekly scheduling views
- Timetable creation and schedule entry management
- Conflict detection and conflict resolution interface
- CSV upload, validation, conflict analysis, and upload history screens
- Toast notifications and responsive UI interactions
- Sidebar navigation with role-based menus and search
- Theme context and animated UI components

## 🛠 Tech Stack

### Core

- React 19
- Vite
- React Router DOM

### State & Data

- Redux Toolkit
- React Redux
- Axios

### UI & Styling

- Tailwind CSS
- Material UI
- React Icons
- Framer Motion

### Charts & Feedback

- Chart.js
- react-chartjs-2
- react-hot-toast
- react-toastify

### Tooling

- ESLint
- PostCSS
- Autoprefixer
- Vercel

## 🏗 Project Structure

```bash
frontend/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Icons and bundled assets
│   ├── components/          # Shared layout and UI components
│   ├── context/             # Theme context
│   ├── pages/               # Auth pages and admin modules
│   ├── redux/               # Store and auth slice
│   ├── utils/               # Axios configuration
│   ├── App.jsx              # App routes
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
└── vercel.json
```

## ⚙️ Installation & Setup

### 1. Move into the frontend folder

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

### 6. Preview the production build

```bash
npm run preview
```

Default local frontend URL:

```bash
http://localhost:5173
```

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL for the backend API |

## 🧭 Available Pages

### Authentication

- `/login`
- `/register`

### Admin Modules

- `/admin/dashboard`
- `/admin/approvals`
- `/admin/manage-users`
- `/admin/teachers`
- `/admin/subjects`
- `/admin/departments`
- `/admin/programs`
- `/admin/academic-sessions`
- `/admin/semesters`
- `/admin/courses`
- `/admin/sections`
- `/admin/rooms`
- `/admin/course-allocations`
- `/admin/timeslots`
- `/admin/timetables`
- `/admin/conflicts`
- `/admin/csv-upload`

## ▶️ Usage Guide

1. Set `VITE_API_URL` to your deployed or local backend API.
2. Start the frontend application.
3. Register a new account or sign in with an approved user.
4. Open the admin dashboard after login.
5. Use the sidebar to navigate between approvals, academic modules, scheduling, and CSV tools.
6. Manage timetable records and run conflict detection when needed.
7. Review analytics and operational screens from the dashboard.

## 🔌 Backend Integration

This frontend expects a separate backend deployment that provides:

- Authentication endpoints
- Approval management
- Academic management modules
- Timetable APIs
- Conflict detection APIs
- CSV upload and reporting APIs

Example local API configuration:

```env
VITE_API_URL=http://localhost:5000/api
```

Example deployed API configuration:

```env
VITE_API_URL=https://your-backend-domain.vercel.app/api
```

## ☁️ Deployment

This frontend includes a `vercel.json` file for SPA routing support.

### Vercel Notes

- The app rewrites all routes to `index.html`
- Set `VITE_API_URL` in your deployment environment
- Make sure the backend CORS config allows your deployed frontend URL

## 🖼 Screenshots / Demo

- Login Page: Add screenshot here
- Register Page: Add screenshot here
- Admin Dashboard: Add screenshot here
- Timetable Management: Add screenshot here
- Conflict Detection: Add screenshot here
- CSV Upload: Add screenshot here

## 🌐 Live Demo

Add frontend live demo URL here

## ⚠️ Notes

- Auth state is stored in local storage
- Unauthorized API responses redirect users back to the login page
- Some role routes for teacher, student, and parent are partially planned in the codebase but not fully active in the current frontend routing

## 🔮 Future Improvements

- Complete teacher, student, and parent portal screens
- Add route guards for stronger frontend access control
- Add reusable table, filter, and form abstraction components
- Add test coverage with React Testing Library
- Improve accessibility and loading states across all modules
- Add downloadable screenshots and richer product demo assets

## 👤 Author

**Muhammad Noman Orakzai**  
GitHub: [Add your GitHub profile link here](https://github.com/your-username)
