import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Register from "./pages/Register";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Approvals from "./pages/Admin/Approvals";
import ManageUsers from "./pages/Admin/ManageUsers";
import Students from "./pages/Admin/Students";
import Teachers from "./pages/Admin/Teachers";
import Subjects from "./pages/Admin/Subjects";
import Departments from "./pages/Admin/Departments";
import Programs from "./pages/Admin/Programs";
import AcademicSessions from "./pages/Admin/AcademicSessions";
import Semesters from "./pages/Admin/Semesters";
import Courses from "./pages/Admin/Courses";
import Sections from "./pages/Admin/Sections";
import Rooms from "./pages/Admin/Rooms";
import CourseAllocations from "./pages/Admin/CourseAllocations";
import TimeSlots from "./pages/Admin/TimeSlots";
import Timetables from "./pages/Admin/Timetables";
import ConflictDetection from "./pages/Admin/ConflictDetection";
import CSVUpload from "./pages/Admin/CSVUpload";
// import Reports from "./pages/Admin/Reports";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/approvals" element={<Approvals />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />
          <Route path="/admin/students" element={<Students />} />
          <Route path="/admin/teachers" element={<Teachers />} />
          <Route path="/admin/subjects" element={<Subjects />} />
          <Route path="/admin/departments" element={<Departments />} />
          <Route path="/admin/programs" element={<Programs />} />
          <Route
            path="/admin/academic-sessions"
            element={<AcademicSessions />}
          />
          <Route path="/admin/semesters" element={<Semesters />} />
          <Route
            path="/admin/semesters/session/:sessionId"
            element={<Semesters />}
          />
          <Route path="/admin/courses" element={<Courses />} />
          <Route path="/admin/sections" element={<Sections />} />
          <Route path="/admin/rooms" element={<Rooms />} />
          <Route
            path="/admin/course-allocations"
            element={<CourseAllocations />}
          />
          <Route path="/admin/timeslots" element={<TimeSlots />} />
          <Route path="/admin/timetables" element={<Timetables />} />
          <Route path="/admin/conflicts" element={<ConflictDetection />} />
          <Route path="/admin/csv-upload" element={<CSVUpload />} />
          {/* <Route path="/admin/reports" element={<Reports />} /> */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
