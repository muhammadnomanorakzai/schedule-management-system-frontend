import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaUserGraduate,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBuilding,
  FaGraduationCap,
  FaCalendarAlt,
  FaListOl,
  FaUsers,
  FaFilter,
  FaChartBar,
  FaFileImport,
  FaCheckCircle,
  FaTimesCircle,
  FaUserCheck,
  FaUserTimes,
  FaUserGraduate as FaStudent,
  FaIdCard,
} from "react-icons/fa";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [filteredSemesters, setFilteredSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showEnroll, setShowEnroll] = useState(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    enrollmentStats: [],
    programStats: [],
    batchStats: [],
  });

  const [filters, setFilters] = useState({
    department: "",
    program: "",
    academicSession: "",
    semester: "",
    section: "",
    enrollmentStatus: "",
    batchYear: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    rollNumber: "",
    admissionNumber: "",
    admissionDate: "",
    program: "",
    department: "",
    batchYear: new Date().getFullYear(),
    academicSession: "",
    currentSemester: "",
    section: "",
    parent: "",
    emergencyContact: {
      name: "",
      relation: "",
      phone: "",
    },
  });

  // Enroll form state
  const [enrollData, setEnrollData] = useState({
    program: "",
    academicSession: "",
    semester: "",
    section: "",
  });

  // Bulk import state
  const [bulkData, setBulkData] = useState("");
  const [csvPreview, setCsvPreview] = useState([]);

  // Gender options
  const genderOptions = ["Male", "Female", "Other"];

  // Enrollment status options
  const enrollmentStatusOptions = [
    "Active",
    "Inactive",
    "Graduated",
    "Suspended",
    "Dropped",
  ];

  // Fee status options
  const feeStatusOptions = ["Paid", "Partial", "Pending", "Exempted"];

  // Registration status options
  const registrationStatusOptions = [
    "Registered",
    "Not Registered",
    "Partially Registered",
  ];

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
    fetchAcademicSessions();
    fetchStats();
  }, []);

  useEffect(() => {
    if (filters.department) {
      fetchProgramsByDepartment(filters.department);
    }
  }, [filters.department]);

  useEffect(() => {
    if (filters.program) {
      fetchSemestersByProgram(filters.program);
    }
  }, [filters.program]);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  useEffect(() => {
    if (formData.department) {
      fetchProgramsByDepartment(formData.department);
    }
  }, [formData.department]);

  useEffect(() => {
    if (enrollData.academicSession) {
      fetchSemestersBySession(enrollData.academicSession);
    }
  }, [enrollData.academicSession]);

  const fetchStudents = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const { data } = await api.get(`/students?${queryParams}`);
      setStudents(data);
    } catch (error) {
      toast.error("Failed to fetch students");
      console.error("Error:", error.response?.data);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/students/stats/overview");
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get("/departments");
      setDepartments(
        Array.isArray(data) ? data : data.departments || data.data || [],
      );
    } catch (error) {
      toast.error("Failed to fetch departments");
    }
  };

  const fetchProgramsByDepartment = async (deptId) => {
    try {
      const { data } = await api.get(`/programs/department/${deptId}`);
      if (filters.department) {
        setPrograms(data);
      } else {
        setFilteredPrograms(data);
      }
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  };

  const fetchAcademicSessions = async () => {
    try {
      const { data } = await api.get("/academic-sessions");
      setAcademicSessions(data);
    } catch (error) {
      toast.error("Failed to fetch academic sessions");
    }
  };

  const fetchSemestersByProgram = async (programId) => {
    try {
      const program = await api.get(`/programs/${programId}`);
      if (program.data) {
        const semesters = Array.from(
          { length: program.data.totalSemesters },
          (_, i) => i + 1,
        );
        setSemesters(semesters);
      }
    } catch (error) {
      console.error("Failed to fetch semesters:", error);
    }
  };

  const fetchSemestersBySession = async (sessionId) => {
    try {
      const { data } = await api.get(`/semesters/session/${sessionId}`);
      setFilteredSemesters(data);
    } catch (error) {
      console.error("Failed to fetch semesters:", error);
    }
  };

  const fetchSectionsByProgramSemester = async (
    programId,
    semesterId,
    sessionId,
  ) => {
    try {
      const { data } = await api.get(
        `/sections/program/${programId}/semester/${semesterId}`,
      );
      // Filter sections for current academic session
      const filtered = data.filter(
        (section) =>
          section.academicSession._id === sessionId && section.isActive,
      );
      setSections(filtered);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      setSections([]);
    }
  };

  const cleanObjectIds = (data) => {
    const obj = { ...data };

    const objectIdFields = [
      "academicSession",
      "currentSemester",
      "section",
      "parent",
      "program",
      "department",
    ];

    objectIdFields.forEach((field) => {
      if (obj[field] === "") {
        delete obj[field];
      }
    });

    return obj;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingStudent) {
        // Update existing student
        const cleanedData = cleanObjectIds(formData);
        await api.put(`/students/${editingStudent._id}`, cleanedData);
        toast.success("Student updated successfully!");
        setEditingStudent(null);
      } else {
        // Create new student
        const cleanedData = cleanObjectIds(formData);
        await api.post("/students", cleanedData);
        toast.success("Student created successfully!");
      }

      setShowForm(false);
      resetForm();
      fetchStudents();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await api.put(`/students/${showEnroll}/enroll`, enrollData);
      toast.success("Student enrolled successfully!");
      setShowEnroll(null);
      setEnrollData({
        program: "",
        academicSession: "",
        semester: "",
        section: "",
      });
      fetchStudents();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleBulkImport = async () => {
    try {
      // Parse CSV data
      const lines = bulkData.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());
      const students = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const student = {};
        headers.forEach((header, index) => {
          student[header] = values[index] || "";
        });
        return student;
      });

      const { data } = await api.post("/students/bulk-import", { students });
      toast.success(
        `Bulk import completed: ${data.results.success} successful, ${data.results.failed} failed`,
      );
      setShowBulkImport(false);
      setBulkData("");
      setCsvPreview([]);
      fetchStudents();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      password: "",
      phone: student.phone || "",
      address: student.address || "",
      dateOfBirth: student.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: student.gender || "",
      rollNumber: student.rollNumber || "",
      admissionNumber: student.admissionNumber || "",
      admissionDate: student.admissionDate
        ? new Date(student.admissionDate).toISOString().split("T")[0]
        : "",
      program: student.program?._id || "",
      department: student.department?._id || "",
      batchYear: student.batchYear || new Date().getFullYear(),
      academicSession: student.academicSession?._id || "",
      currentSemester: student.currentSemester?._id || "",
      section: student.section?._id || "",
      parent: student.parent?._id || "",
      emergencyContact: student.emergencyContact || {
        name: "",
        relation: "",
        phone: "",
      },
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      await api.delete(`/students/${id}`);
      toast.success("Student deleted successfully!");
      fetchStudents();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleUpdateStatus = async (id, statusType, newStatus) => {
    try {
      let endpoint = "";
      let data = {};

      switch (statusType) {
        case "enrollment":
          endpoint = "enrollment-status";
          data = { enrollmentStatus: newStatus };
          break;
        case "fee":
          endpoint = ""; // You'll need to implement this
          break;
        case "registration":
          endpoint = ""; // You'll need to implement this
          break;
      }

      if (endpoint) {
        await api.put(`/students/${id}/${endpoint}`, data);
        toast.success("Status updated successfully!");
        fetchStudents();
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleAssignSection = async (studentId, sectionId) => {
    try {
      await api.put(`/students/${studentId}/assign-section`, {
        sectionId,
      });
      toast.success("Student assigned to section successfully!");
      fetchStudents();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      gender: "",
      rollNumber: "",
      admissionNumber: "",
      admissionDate: "",
      program: "",
      department: "",
      batchYear: new Date().getFullYear(),
      academicSession: "",
      currentSemester: "",
      section: "",
      parent: "",
      emergencyContact: {
        name: "",
        relation: "",
        phone: "",
      },
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchStudents();
  };

  const clearFilters = () => {
    setFilters({
      department: "",
      program: "",
      academicSession: "",
      semester: "",
      section: "",
      enrollmentStatus: "",
      batchYear: "",
    });
  };

  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const preview = lines.slice(1, 6).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      return row;
    });

    setCsvPreview(preview);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
      case "Paid":
      case "Registered":
        return "bg-green-100 text-green-800";
      case "Pending":
      case "Not Registered":
        return "bg-yellow-100 text-yellow-800";
      case "Partial":
      case "Partially Registered":
        return "bg-orange-100 text-orange-800";
      case "Inactive":
      case "Suspended":
      case "Dropped":
        return "bg-red-100 text-red-800";
      case "Graduated":
      case "Exempted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCGPAcolor = (cgpa) => {
    if (cgpa >= 3.5) return "text-green-600";
    if (cgpa >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Student Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage student enrollment, programs, semesters, and sections
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkImport(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30">
              <FaFileImport /> Bulk Import
            </button>
            <button
              onClick={() => {
                setEditingStudent(null);
                resetForm();
                setShowForm(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
              <FaPlus /> Add Student
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <FaUserGraduate className="text-2xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Students</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.activeStudents}
                </p>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <FaUserCheck className="text-2xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Programs</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.programStats.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <FaGraduationCap className="text-2xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Batch</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.batchStats[0]?._id || "N/A"}
                </p>
              </div>
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                <FaCalendarAlt className="text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment Stats */}
        {stats.enrollmentStats.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Enrollment Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.enrollmentStats.map((stat) => (
                <div key={stat._id} className="text-center">
                  <div
                    className={`p-3 rounded-lg ${getStatusColor(
                      stat._id,
                    )} inline-block mb-2`}>
                    {stat._id === "Active" ? (
                      <FaUserCheck />
                    ) : stat._id === "Graduated" ? (
                      <FaUserGraduate />
                    ) : (
                      <FaUserTimes />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {stat._id}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stat.count}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Program Stats */}
        {stats.programStats.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Top Programs
            </h3>
            <div className="space-y-3">
              {stats.programStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FaGraduationCap className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {stat.program?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {stat.program?.code}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {stat.count} students
                    </p>
                    <p className="text-sm text-gray-500">
                      Avg CGPA: {stat.avgCGPA}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaFilter /> Filter Students
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800">
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program
              </label>
              <select
                name="program"
                value={filters.program}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={!filters.department}>
                <option value="">All Programs</option>
                {programs.map((program) => (
                  <option key={program._id} value={program._id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Session
              </label>
              <select
                name="academicSession"
                value={filters.academicSession}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Sessions</option>
                {academicSessions.map((session) => (
                  <option key={session._id} value={session._id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Status
              </label>
              <select
                name="enrollmentStatus"
                value={filters.enrollmentStatus}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Status</option>
                {enrollmentStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Create/Edit Student Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingStudent ? "Edit Student" : "Create New Student"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingStudent(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimesCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., John Smith"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="john@example.com"
                      required
                      disabled={!!editingStudent}
                    />
                  </div>

                  {!editingStudent && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="+1 234 567 890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                      <option value="">Select Gender</option>
                      {genderOptions.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, rollNumber: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Auto-generated if empty"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Admission Number
                    </label>
                    <input
                      type="text"
                      value={formData.admissionNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          admissionNumber: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Admission Date
                    </label>
                    <input
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          admissionDate: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          department: e.target.value,
                          program: "",
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Program *
                    </label>
                    <select
                      value={formData.program}
                      onChange={(e) =>
                        setFormData({ ...formData, program: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                      disabled={!formData.department}>
                      <option value="">Select Program</option>
                      {filteredPrograms.map((program) => (
                        <option key={program._id} value={program._id}>
                          {program.name} ({program.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Batch Year
                    </label>
                    <input
                      type="number"
                      min="2000"
                      max="2030"
                      value={formData.batchYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          batchYear:
                            parseInt(e.target.value) ||
                            new Date().getFullYear(),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: {
                              ...formData.emergencyContact,
                              name: e.target.value,
                            },
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Relation
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact.relation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: {
                              ...formData.emergencyContact,
                              relation: e.target.value,
                            },
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                        placeholder="Father, Mother, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: {
                              ...formData.emergencyContact,
                              phone: e.target.value,
                            },
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                        placeholder="Emergency phone number"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows="3"
                    placeholder="Full address"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingStudent(null);
                      resetForm();
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {loading
                      ? "Saving..."
                      : editingStudent
                        ? "Update Student"
                        : "Create Student"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Enroll Student Modal */}
        {showEnroll && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Enroll Student
                </h2>
                <button
                  onClick={() => {
                    setShowEnroll(null);
                    setEnrollData({
                      program: "",
                      academicSession: "",
                      semester: "",
                      section: "",
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimesCircle size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Academic Session *
                  </label>
                  <select
                    value={enrollData.academicSession}
                    onChange={(e) => {
                      setEnrollData({
                        ...enrollData,
                        academicSession: e.target.value,
                        semester: "",
                      });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    required>
                    <option value="">Select Session</option>
                    {academicSessions.map((session) => (
                      <option key={session._id} value={session._id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Semester *
                  </label>
                  <select
                    value={enrollData.semester}
                    onChange={(e) => {
                      setEnrollData({
                        ...enrollData,
                        semester: e.target.value,
                      });
                      if (enrollData.program && enrollData.academicSession) {
                        fetchSectionsByProgramSemester(
                          enrollData.program,
                          e.target.value,
                          enrollData.academicSession,
                        );
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    required
                    disabled={!enrollData.academicSession}>
                    <option value="">Select Semester</option>
                    {filteredSemesters.map((semester) => (
                      <option key={semester._id} value={semester._id}>
                        {semester.name} (Semester {semester.semesterNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Section (Optional)
                  </label>
                  <select
                    value={enrollData.section}
                    onChange={(e) =>
                      setEnrollData({ ...enrollData, section: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3">
                    <option value="">No Section</option>
                    {sections.map((section) => (
                      <option key={section._id} value={section._id}>
                        {section.name} ({section.code}) -{" "}
                        {section.currentStrength}/{section.maxStrength}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEnroll(null);
                      setEnrollData({
                        program: "",
                        academicSession: "",
                        semester: "",
                        section: "",
                      });
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEnroll}
                    disabled={
                      !enrollData.academicSession || !enrollData.semester
                    }
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    Enroll Student
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bulk Import Modal */}
        {showBulkImport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Bulk Import Students
                </h2>
                <button
                  onClick={() => {
                    setShowBulkImport(false);
                    setBulkData("");
                    setCsvPreview([]);
                  }}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimesCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Upload CSV file with columns: name, email, password, phone,
                    address, dateOfBirth, gender, rollNumber, admissionNumber,
                    program (program ID), department (department ID), batchYear
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Paste CSV Data
                  </label>
                  <textarea
                    value={bulkData}
                    onChange={(e) => {
                      setBulkData(e.target.value);
                      parseCSV(e.target.value);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm"
                    rows="10"
                    placeholder="name,email,password,phone,...&#10;John Doe,john@example.com,password123,+1234567890,..."
                  />
                </div>

                {csvPreview.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Preview (First 5 rows)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-gray-50 rounded-lg">
                        <thead>
                          <tr>
                            {Object.keys(csvPreview[0]).map((header) => (
                              <th
                                key={header}
                                className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, idx) => (
                                <td
                                  key={idx}
                                  className="px-4 py-2 text-sm text-gray-600 border-b">
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkImport(false);
                      setBulkData("");
                      setCsvPreview([]);
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkImport}
                    disabled={!bulkData.trim()}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                    Import Students
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Students Table */}
        {students.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FaUserGraduate className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Students Found
            </h3>
            <p className="text-gray-500 mb-6">
              {Object.values(filters).some((f) => f)
                ? "No students match your filters. Try different filters."
                : "Add your first student to start management"}
            </p>
            <button
              onClick={() => {
                setEditingStudent(null);
                resetForm();
                setShowForm(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Add First Student
            </button>
          </div>
        ) : (
          <>
            {/* Desktop View - Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Student Details
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Academic Info
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((student) => (
                      <tr
                        key={student._id}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                              <FaUserGraduate className="text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">
                                {student.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {student.email}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <FaIdCard className="text-gray-400 text-xs" />
                                <span className="text-xs text-gray-600">
                                  {student.rollNumber}
                                </span>
                                {student.admissionNumber && (
                                  <span className="text-xs text-gray-500">
                                    | Adm: {student.admissionNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            {student.program ? (
                              <div className="flex items-center gap-2">
                                <FaGraduationCap className="text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    {student.program.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Batch: {student.batchYear}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowEnroll(student._id)}
                                className="text-xs text-blue-600 hover:text-blue-800">
                                + Enroll in Program
                              </button>
                            )}

                            {student.currentSemester && (
                              <div className="flex items-center gap-2">
                                <FaListOl className="text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  {student.currentSemester.name}
                                </span>
                              </div>
                            )}

                            {student.section ? (
                              <div className="flex items-center gap-2">
                                <FaUsers className="text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  Section {student.section.code}
                                </span>
                              </div>
                            ) : (
                              <select
                                value=""
                                onChange={(e) =>
                                  handleAssignSection(
                                    student._id,
                                    e.target.value,
                                  )
                                }
                                className="text-xs border border-gray-300 rounded px-2 py-1">
                                <option value="">Assign Section</option>
                                {/* You would need to fetch available sections here */}
                              </select>
                            )}

                            {student.cgpa > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  CGPA:
                                </span>
                                <span
                                  className={`text-sm font-bold ${getCGPAcolor(
                                    student.cgpa,
                                  )}`}>
                                  {student.cgpa.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                student.enrollmentStatus,
                              )}`}>
                              {student.enrollmentStatus}
                            </span>
                            <div className="space-y-1">
                              <select
                                value={student.enrollmentStatus}
                                onChange={(e) =>
                                  handleUpdateStatus(
                                    student._id,
                                    "enrollment",
                                    e.target.value,
                                  )
                                }
                                className="w-full text-xs border border-gray-300 rounded px-2 py-1">
                                {enrollmentStatusOptions.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit">
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(student._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete">
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
              {students.map((student) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                        <FaUserGraduate className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">
                          {student.name}
                        </h4>
                        <p className="text-sm text-gray-500">{student.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <FaIdCard className="text-gray-400 text-xs" />
                          <span className="text-xs text-gray-600">
                            {student.rollNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        student.enrollmentStatus,
                      )}`}>
                      {student.enrollmentStatus}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {student.program ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaGraduationCap className="text-gray-400" />
                          <span className="text-sm text-gray-600">Program</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {student.program.name}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowEnroll(student._id)}
                        className="w-full text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg py-2">
                        + Enroll in Program
                      </button>
                    )}

                    {student.currentSemester && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaListOl className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Semester
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {student.currentSemester.name}
                        </span>
                      </div>
                    )}

                    {student.section && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaUsers className="text-gray-400" />
                          <span className="text-sm text-gray-600">Section</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {student.section.code}
                        </span>
                      </div>
                    )}

                    {student.cgpa > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">CGPA</span>
                        <span
                          className={`text-sm font-bold ${getCGPAcolor(
                            student.cgpa,
                          )}`}>
                          {student.cgpa.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100 flex justify-between">
                      <select
                        value={student.enrollmentStatus}
                        onChange={(e) =>
                          handleUpdateStatus(
                            student._id,
                            "enrollment",
                            e.target.value,
                          )
                        }
                        className="text-xs border border-gray-300 rounded px-2 py-1">
                        {enrollmentStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit">
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Students;
