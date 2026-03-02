import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaChalkboardTeacher,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaBuilding,
  FaBook,
  FaClock,
  FaCalendarAlt,
  FaFilter,
  FaChartBar,
  FaUserTie,
  FaGraduationCap,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAssignCourse, setShowAssignCourse] = useState(null);
  const [showAvailability, setShowAvailability] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    availableTeachers: 0,
    departmentStats: [],
    workloadStats: {},
  });

  const [filters, setFilters] = useState({
    department: "",
    designation: "",
    isAvailableForScheduling: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    qualification: "",
    specialization: "",
    experience: 0,
    designation: "Lecturer",
    department: "",
    phone: "",
    address: "",
    maxWeeklyHours: 18,
  });

  // Assign course state
  const [assignCourseData, setAssignCourseData] = useState({
    courseId: "",
  });

  // Availability state
  const [availabilityData, setAvailabilityData] = useState([
    { day: "Monday", slots: [] },
    { day: "Tuesday", slots: [] },
    { day: "Wednesday", slots: [] },
    { day: "Thursday", slots: [] },
    { day: "Friday", slots: [] },
    { day: "Saturday", slots: [] },
  ]);

  // Time slots (fixed as per requirement)
  const timeSlots = [
    "08:30-09:30",
    "09:30-10:30",
    "10:30-11:30",
    "11:30-12:30",
    "12:30-13:30",
    "13:30-14:30",
    "14:30-15:30",
    "15:30-16:30",
    "16:30-17:30",
  ];

  // Designation options
  const designationOptions = [
    "Lecturer",
    "Assistant Professor",
    "Associate Professor",
    "Professor",
    "HOD",
  ];

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
    fetchStats();
  }, []);

  useEffect(() => {
    if (filters.department) {
      fetchCoursesByDepartment(filters.department);
    }
  }, [filters.department]);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const fetchTeachers = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const { data } = await api.get(`/teachers?${queryParams}`);
      setTeachers(data);
    } catch (error) {
      toast.error("Failed to fetch teachers");
      console.error("Error:", error.response?.data);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/teachers/stats/overview");
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

  const fetchCoursesByDepartment = async (deptId) => {
    try {
      const { data } = await api.get(`/courses?department=${deptId}`);
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const fetchAvailableCoursesForTeacher = async (teacherId, deptId) => {
    try {
      const { data } = await api.get(
        `/teachers/available/:courseId/:departmentId`
          .replace(":courseId", "all")
          .replace(":departmentId", deptId),
      );
      setFilteredCourses(data);
    } catch (error) {
      console.error("Failed to fetch available courses:", error);
      setFilteredCourses(courses);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTeacher) {
        // Update existing teacher
        await api.put(`/teachers/${editingTeacher._id}`, formData);
        toast.success("Teacher updated successfully!");
        setEditingTeacher(null);
      } else {
        // Create new teacher
        await api.post("/teachers", formData);
        toast.success("Teacher created successfully!");
      }

      setShowForm(false);
      resetForm();
      fetchTeachers();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: "",
      qualification: teacher.qualification || "",
      specialization: teacher.specialization || "",
      experience: teacher.experience || 0,
      designation: teacher.designation || "Lecturer",
      department: teacher.department?._id || "",
      phone: teacher.phone || "",
      address: teacher.address || "",
      maxWeeklyHours: teacher.maxWeeklyHours || 18,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;

    try {
      await api.delete(`/teachers/${id}`);
      toast.success("Teacher deleted successfully!");
      fetchTeachers();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleToggleScheduling = async (id, currentStatus) => {
    try {
      await api.put(`/teachers/${id}/toggle-scheduling`);
      toast.success(
        `Teacher ${!currentStatus ? "enabled" : "disabled"} for scheduling!`,
      );
      fetchTeachers();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleAssignCourse = async () => {
    if (!assignCourseData.courseId) {
      toast.error("Please select a course");
      return;
    }

    try {
      await api.put(`/teachers/${showAssignCourse}/assign-course`, {
        courseId: assignCourseData.courseId,
      });
      toast.success("Course assigned successfully!");
      setShowAssignCourse(null);
      setAssignCourseData({ courseId: "" });
      fetchTeachers();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleRemoveCourse = async (teacherId, courseId) => {
    if (!window.confirm("Are you sure you want to remove this course?")) return;

    try {
      await api.put(`/teachers/${teacherId}/remove-course/${courseId}`);
      toast.success("Course removed successfully!");
      fetchTeachers();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleUpdateAvailability = async () => {
    try {
      await api.put(`/teachers/${showAvailability}/availability`, {
        availability: availabilityData,
      });
      toast.success("Availability updated successfully!");
      setShowAvailability(null);
      fetchTeachers();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleAssignDepartment = async (teacherId, deptId) => {
    try {
      await api.put(`/teachers/${teacherId}/assign-department`, {
        departmentId: deptId,
      });
      toast.success("Department assigned successfully!");
      fetchTeachers();
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
      qualification: "",
      specialization: "",
      experience: 0,
      designation: "Lecturer",
      department: "",
      phone: "",
      address: "",
      maxWeeklyHours: 18,
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchTeachers();
  };

  const clearFilters = () => {
    setFilters({
      department: "",
      designation: "",
      isAvailableForScheduling: "",
    });
  };

  const toggleSlot = (dayIndex, slot) => {
    const newAvailability = [...availabilityData];
    const dayAvailability = newAvailability[dayIndex];

    if (dayAvailability.slots.includes(slot)) {
      dayAvailability.slots = dayAvailability.slots.filter((s) => s !== slot);
    } else {
      dayAvailability.slots.push(slot);
    }

    setAvailabilityData(newAvailability);
  };

  const getWorkloadColor = (percentage) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-orange-600";
    return "text-green-600";
  };

  const getWorkloadBgColor = (percentage) => {
    if (percentage >= 90) return "bg-red-100";
    if (percentage >= 70) return "bg-orange-100";
    return "bg-green-100";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Teacher Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage teachers with departments, courses, availability, and
              workload
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTeacher(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
            <FaPlus /> Add Teacher
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Teachers</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalTeachers}
                </p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <FaChalkboardTeacher className="text-2xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Available for Scheduling
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.availableTeachers}
                </p>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <FaCheck className="text-2xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Workload</p>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round(stats.workloadStats.avgWorkload || 0)} hrs
                </p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <FaClock className="text-2xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Courses Assigned</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.workloadStats.totalAssignedCourses || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                <FaBook className="text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Department Stats */}
        {stats.departmentStats.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Department-wise Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.departmentStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-800 inline-block mb-2">
                    <FaBuilding />
                  </div>
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {stat.department?.name || "No Dept"}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stat.count}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.avgExperience} yrs avg
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaFilter /> Filter Teachers
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
                Designation
              </label>
              <select
                name="designation"
                value={filters.designation}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Designations</option>
                {designationOptions.map((desig) => (
                  <option key={desig} value={desig}>
                    {desig}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduling Status
              </label>
              <select
                name="isAvailableForScheduling"
                value={filters.isAvailableForScheduling}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Status</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
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

        {/* Create/Edit Teacher Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingTeacher ? "Edit Teacher" : "Create New Teacher"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingTeacher(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="e.g., Dr. Jane Smith"
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
                      placeholder="jane@example.com"
                      required
                      disabled={!!editingTeacher}
                    />
                  </div>

                  {!editingTeacher && (
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
                      Qualification
                    </label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          qualification: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., Ph.D. in Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Specialization
                    </label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialization: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., Artificial Intelligence"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Designation
                    </label>
                    <select
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          designation: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                      {designationOptions.map((desig) => (
                        <option key={desig} value={desig}>
                          {desig}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
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
                      Max Weekly Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.maxWeeklyHours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxWeeklyHours: parseInt(e.target.value) || 18,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

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
                      rows="2"
                      placeholder="Full address"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingTeacher(null);
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
                      : editingTeacher
                        ? "Update Teacher"
                        : "Create Teacher"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Assign Course Modal */}
        {showAssignCourse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Assign Course
                </h2>
                <button
                  onClick={() => {
                    setShowAssignCourse(null);
                    setAssignCourseData({ courseId: "" });
                  }}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Select Course
                  </label>
                  <select
                    value={assignCourseData.courseId}
                    onChange={(e) =>
                      setAssignCourseData({ courseId: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                    <option value="">Select a course</option>
                    {filteredCourses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.code} - {course.name} ({course.creditHours} hrs)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignCourse(null);
                      setAssignCourseData({ courseId: "" });
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAssignCourse}
                    disabled={!assignCourseData.courseId}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    Assign Course
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Availability Modal */}
        {showAvailability && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Set Availability
                </h2>
                <button
                  onClick={() => setShowAvailability(null)}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Select time slots when the teacher is available. Only fixed
                    time slots are allowed.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availabilityData.map((day, dayIndex) => (
                    <div key={day.day} className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="font-bold text-gray-800 mb-3">
                        {day.day}
                      </h3>
                      <div className="space-y-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => toggleSlot(dayIndex, slot)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              day.slots.includes(slot)
                                ? "bg-blue-100 text-blue-800 border border-blue-300"
                                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                            }`}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{slot}</span>
                              {day.slots.includes(slot) && (
                                <FaCheck className="text-blue-600" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAvailability(null)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateAvailability}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Save Availability
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Teachers Table/Grid */}
        {teachers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FaChalkboardTeacher className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Teachers Found
            </h3>
            <p className="text-gray-500 mb-6">
              {Object.values(filters).some((f) => f)
                ? "No teachers match your filters. Try different filters."
                : "Create your first teacher to start management"}
            </p>
            <button
              onClick={() => {
                setEditingTeacher(null);
                resetForm();
                setShowForm(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Create First Teacher
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
                        Teacher Details
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Department & Workload
                      </th>
                      {/* <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Assigned Courses
                      </th> */}
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {teachers.map((teacher) => {
                      const workloadPercentage =
                        teacher.workloadPercentage || 0;
                      const assignedCourses = teacher.assignedCourses || [];

                      return (
                        <tr
                          key={teacher._id}
                          className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                                <FaChalkboardTeacher className="text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800">
                                  {teacher.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {teacher.email}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                    {teacher.designation}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                    {teacher.experience || 0} yrs exp
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-2">
                              {teacher.department ? (
                                <div className="flex items-center gap-2">
                                  <FaBuilding className="text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">
                                      {teacher.department.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {teacher.department.code}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <select
                                  value=""
                                  onChange={(e) =>
                                    handleAssignDepartment(
                                      teacher._id,
                                      e.target.value,
                                    )
                                  }
                                  className="text-xs border border-gray-300 rounded px-2 py-1">
                                  <option value="">Assign Dept</option>
                                  {departments.map((dept) => (
                                    <option key={dept._id} value={dept._id}>
                                      {dept.name}
                                    </option>
                                  ))}
                                </select>
                              )}

                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Workload:
                                  </span>
                                  <span
                                    className={`font-bold ${getWorkloadColor(workloadPercentage)}`}>
                                    {teacher.currentWorkload?.weeklyHours || 0}/
                                    {teacher.maxWeeklyHours} hrs
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${getWorkloadBgColor(workloadPercentage).replace("bg-", "bg-").replace("100", "500")}`}
                                    style={{
                                      width: `${Math.min(workloadPercentage, 100)}%`,
                                    }}></div>
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* <td className="py-4 px-6">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  Courses: {assignedCourses.length}
                                </span>
                                <button
                                  onClick={() => {
                                    setShowAssignCourse(teacher._id);
                                    if (teacher.department) {
                                      fetchAvailableCoursesForTeacher(
                                        teacher._id,
                                        teacher.department._id,
                                      );
                                    }
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800">
                                  + Assign
                                </button>
                              </div>
                              {assignedCourses.length > 0 ? (
                                <div className="space-y-1">
                                  {assignedCourses
                                    .slice(0, 2)
                                    .map((assignment) => (
                                      <div
                                        key={assignment.course._id}
                                        className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                                        <div>
                                          <span className="font-medium">
                                            {assignment.course.code}
                                          </span>
                                          <span className="text-gray-500 ml-1">
                                            ({assignment.course.creditHours}{" "}
                                            hrs)
                                          </span>
                                        </div>
                                        <button
                                          onClick={() =>
                                            handleRemoveCourse(
                                              teacher._id,
                                              assignment.course._id,
                                            )
                                          }
                                          className="text-red-500 hover:text-red-700">
                                          <FaTimes />
                                        </button>
                                      </div>
                                    ))}
                                  {assignedCourses.length > 2 && (
                                    <p className="text-xs text-gray-500 text-center">
                                      +{assignedCourses.length - 2} more
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400">
                                  No courses assigned
                                </p>
                              )}
                            </div>
                          </td> */}
                          <td className="py-4 px-6">
                            <div className="space-y-2">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  teacher.isAvailableForScheduling
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                {teacher.isAvailableForScheduling ? (
                                  <>
                                    <FaCheck className="mr-1" /> Available
                                  </>
                                ) : (
                                  "Unavailable"
                                )}
                              </span>
                              {teacher.availability?.length > 0 ? (
                                <button
                                  onClick={() => {
                                    setShowAvailability(teacher._id);
                                    setAvailabilityData(
                                      teacher.availability || availabilityData,
                                    );
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                  <FaCalendarAlt /> View Availability
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setShowAvailability(teacher._id);
                                    setAvailabilityData(availabilityData);
                                  }}
                                  className="text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1">
                                  <FaCalendarAlt /> Set Availability
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(teacher)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit">
                                <FaEdit />
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleScheduling(
                                    teacher._id,
                                    teacher.isAvailableForScheduling,
                                  )
                                }
                                className={`p-2 rounded-lg transition-colors ${
                                  teacher.isAvailableForScheduling
                                    ? "text-orange-600 hover:bg-orange-50"
                                    : "text-green-600 hover:bg-green-50"
                                }`}
                                title={
                                  teacher.isAvailableForScheduling
                                    ? "Disable Scheduling"
                                    : "Enable Scheduling"
                                }>
                                {teacher.isAvailableForScheduling ? (
                                  <FaToggleOff />
                                ) : (
                                  <FaToggleOn />
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(teacher._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete">
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
              {teachers.map((teacher) => {
                const workloadPercentage = teacher.workloadPercentage || 0;
                const assignedCourses = teacher.assignedCourses || [];

                return (
                  <motion.div
                    key={teacher._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                          <FaChalkboardTeacher className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">
                            {teacher.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {teacher.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                              {teacher.designation}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {teacher.experience || 0} yrs exp
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          teacher.isAvailableForScheduling
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {teacher.isAvailableForScheduling
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            Department:
                          </span>
                          {teacher.department ? (
                            <span className="text-sm font-medium text-gray-700">
                              {teacher.department.name}
                            </span>
                          ) : (
                            <select
                              value=""
                              onChange={(e) =>
                                handleAssignDepartment(
                                  teacher._id,
                                  e.target.value,
                                )
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1">
                              <option value="">Assign Dept</option>
                              {departments.map((dept) => (
                                <option key={dept._id} value={dept._id}>
                                  {dept.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Workload:</span>
                          <span
                            className={`font-bold ${getWorkloadColor(workloadPercentage)}`}>
                            {teacher.currentWorkload?.weeklyHours || 0}/
                            {teacher.maxWeeklyHours} hrs
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getWorkloadBgColor(workloadPercentage).replace("bg-", "bg-").replace("100", "500")}`}
                            style={{
                              width: `${Math.min(workloadPercentage, 100)}%`,
                            }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            Assigned Courses: {assignedCourses.length}
                          </span>
                          <button
                            onClick={() => {
                              setShowAssignCourse(teacher._id);
                              if (teacher.department) {
                                fetchAvailableCoursesForTeacher(
                                  teacher._id,
                                  teacher.department._id,
                                );
                              }
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800">
                            + Assign
                          </button>
                        </div>
                        {assignedCourses.length > 0 && (
                          <div className="space-y-1">
                            {assignedCourses.slice(0, 2).map((assignment) => (
                              <div
                                key={assignment.course._id}
                                className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                                <div>
                                  <span className="font-medium">
                                    {assignment.course.code}
                                  </span>
                                  <span className="text-gray-500 ml-1">
                                    ({assignment.course.creditHours} hrs)
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    handleRemoveCourse(
                                      teacher._id,
                                      assignment.course._id,
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700">
                                  <FaTimes />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between pt-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setShowAvailability(teacher._id);
                            setAvailabilityData(
                              teacher.availability || availabilityData,
                            );
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          <FaCalendarAlt />
                          {teacher.availability?.length > 0
                            ? "Availability"
                            : "Set Availability"}
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit">
                            <FaEdit />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleScheduling(
                                teacher._id,
                                teacher.isAvailableForScheduling,
                              )
                            }
                            className={`p-2 rounded-lg ${
                              teacher.isAvailableForScheduling
                                ? "text-orange-600 hover:bg-orange-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}>
                            {teacher.isAvailableForScheduling ? (
                              <FaToggleOff />
                            ) : (
                              <FaToggleOn />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(teacher._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Teachers;
