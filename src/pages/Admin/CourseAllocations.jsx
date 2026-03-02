import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaChalkboardTeacher,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaBook,
  FaUserGraduate,
  FaUniversity,
} from "react-icons/fa";

const CourseAllocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    academicSession: "",
    semester: "",
    program: "",
    teacher: "",
    status: "",
    search: "",
  });

  // Dropdown data
  const [sessions, setSessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    academicSession: "",
    semester: "",
    program: "",
    course: "",
    teacher: "",
    section: "",
    isLab: false,
    labTeacher: "",
    creditHours: 3,
    contactHoursPerWeek: 3,
    maxStudents: 50,
    notes: "",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  useEffect(() => {
    fetchAllocations();
    fetchDropdownData();
  }, [filters, pagination.page]);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      }).toString();

      const { data } = await api.get(`/course-allocations?${params}`);
      setAllocations(data.data);
      setPagination(data.pagination || pagination);
    } catch (error) {
      toast.error("Failed to fetch course allocations");
      console.error("Error:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch academic sessions
      const sessionsRes = await api.get("/academic-sessions");
      setSessions(sessionsRes.data);

      // Fetch programs
      const programsRes = await api.get("/programs");
      setPrograms(programsRes.data);
      const sectionsRes = await api.get("/sections");
      setSections(sectionsRes.data);

      // Fetch teachers
      const teachersRes = await api.get("/teachers");
      setTeachers(teachersRes.data);

      // Fetch courses
      const coursesRes = await api.get("/courses");
      setCourses(coursesRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const fetchAvailableTeachers = async (
    courseId,
    academicSession,
    semester,
  ) => {
    if (!courseId || !academicSession || !semester) return;

    try {
      const { data } = await api.get(
        `/course-allocations/available-teachers?courseId=${courseId}&academicSession=${academicSession}&semester=${semester}`,
      );
      setAvailableTeachers(data.data);
    } catch (error) {
      console.error("Error fetching available teachers:", error);
    }
  };

  const fetchSectionsForProgram = async (programId, semester) => {
    if (!programId || !semester) return;

    try {
      const { data } = await api.get(
        `/sections?program=${programId}&semester=${semester}`,
      );
      setSections(data.data || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
      setSections([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAllocation) {
        // Update allocation
        await api.put(`/course-allocations/${editingAllocation._id}`, formData);
        toast.success("Course allocation updated successfully!");
      } else {
        // Create new allocation
        await api.post("/course-allocations", formData);
        toast.success("Course allocation created successfully!");
      }

      setShowForm(false);
      setFormData({
        academicSession: "",
        semester: "",
        program: "",
        course: "",
        teacher: "",
        section: "",
        isLab: false,
        labTeacher: "",
        creditHours: 3,
        contactHoursPerWeek: 3,
        maxStudents: 50,
        notes: "",
      });
      setEditingAllocation(null);
      fetchAllocations();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (allocation) => {
    setEditingAllocation(allocation);
    setFormData({
      academicSession: allocation.academicSession?._id || "",
      semester: allocation.semester,
      program: allocation.program?._id || "",
      course: allocation.course?._id || "",
      teacher: allocation.teacher?._id || "",
      section: allocation.section?._id || "",
      isLab: allocation.isLab || false,
      labTeacher: allocation.labTeacher?._id || "",
      creditHours: allocation.creditHours,
      contactHoursPerWeek: allocation.contactHoursPerWeek,
      maxStudents: allocation.maxStudents,
      notes: allocation.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this allocation?"))
      return;

    try {
      await api.delete(`/course-allocations/${id}`);
      toast.success("Course allocation cancelled successfully!");
      fetchAllocations();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/course-allocations/${id}/approve`);
      toast.success("Course allocation approved!");
      fetchAllocations();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Fetch available teachers when course, session, or semester changes
    if (
      name === "course" ||
      name === "academicSession" ||
      name === "semester"
    ) {
      if (formData.course && formData.academicSession && formData.semester) {
        fetchAvailableTeachers(
          name === "course" ? value : formData.course,
          name === "academicSession" ? value : formData.academicSession,
          name === "semester" ? value : formData.semester,
        );
      }
    }

    // Fetch sections when program or semester changes
    if (name === "program" || name === "semester") {
      if (formData.program && formData.semester) {
        fetchSectionsForProgram(
          name === "program" ? value : formData.program,
          name === "semester" ? value : formData.semester,
        );
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: "bg-yellow-100 text-yellow-800", label: "Draft" },
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      active: { color: "bg-blue-100 text-blue-800", label: "Active" },
      completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FaChalkboardTeacher /> Course Allocations
            </h1>
            <p className="text-gray-600 mt-1">
              Assign teachers to courses for specific semesters and sections
            </p>
          </div>
          <button
            onClick={() => {
              setEditingAllocation(null);
              setFormData({
                academicSession: sessions.find((s) => s.isCurrent)?._id || "",
                semester: "",
                program: "",
                course: "",
                teacher: "",
                section: "",
                isLab: false,
                labTeacher: "",
                creditHours: 3,
                contactHoursPerWeek: 3,
                maxStudents: 50,
                notes: "",
              });
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
            <FaPlus /> Allocate Course
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <FaFilter className="text-gray-400" />
            <h3 className="font-semibold text-gray-700">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Academic Session
              </label>
              <select
                name="academicSession"
                value={filters.academicSession}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">All Sessions</option>
                {sessions.map((session) => (
                  <option key={session._id} value={session._id}>
                    {session.name} ({session.year})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Semester
              </label>
              <select
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Program
              </label>
              <select
                name="program"
                value={filters.program}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">All Programs</option>
                {programs.map((program) => (
                  <option key={program._id} value={program._id}>
                    {program.code} - {program.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Search (Course/Teacher)
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by course code, teacher name..."
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({
                    academicSession: "",
                    semester: "",
                    program: "",
                    teacher: "",
                    status: "",
                    search: "",
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Create/Edit Allocation Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full my-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaChalkboardTeacher />
                  {editingAllocation
                    ? "Edit Course Allocation"
                    : "Create New Course Allocation"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingAllocation(null);
                  }}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimesCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Academic Session */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Academic Session *
                    </label>
                    <select
                      name="academicSession"
                      value={formData.academicSession}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      <option value="">Select Session</option>
                      {sessions.map((session) => (
                        <option key={session._id} value={session._id}>
                          {session.name} ({session.year}) -{" "}
                          {session.sessionType}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Semester *
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Program */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Program *
                    </label>
                    <select
                      name="program"
                      value={formData.program}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      <option value="">Select Program</option>
                      {programs.map((program) => (
                        <option key={program._id} value={program._id}>
                          {program.code} - {program.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Course *
                    </label>
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.code} - {course.name} ({course.creditHours}{" "}
                          CR)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Teacher Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Teacher *
                    </label>
                    <select
                      name="teacher"
                      value={formData.teacher}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      <option value="">Select Teacher</option>
                      {availableTeachers.length > 0
                        ? availableTeachers.map((teacher) => (
                            <option key={teacher._id} value={teacher._id}>
                              {teacher.name} ({teacher.employeeId}) - Load:{" "}
                              {teacher.currentLoad}h
                              {teacher.isOverloaded && " ⚠️ Overloaded"}
                            </option>
                          ))
                        : teachers.map((teacher) => (
                            <option key={teacher._id} value={teacher._id}>
                              {teacher.name} ({teacher.employeeId})
                            </option>
                          ))}
                    </select>
                    {availableTeachers.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Showing teachers with available capacity for this
                        session
                      </p>
                    )}
                  </div>

                  {/* Section */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Section *
                    </label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      <option value="">Select Section</option>
                      {sections.map((section) => (
                        <option key={section._id} value={section._id}>
                          {section.name} ({section.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Credit Hours */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Credit Hours *
                    </label>
                    <select
                      name="creditHours"
                      value={formData.creditHours}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      {[1, 2, 3, 4, 5].map((credit) => (
                        <option key={credit} value={credit}>
                          {credit} Credit Hour{credit > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Hours Per Week */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Contact Hours/Week *
                    </label>
                    <select
                      name="contactHoursPerWeek"
                      value={formData.contactHoursPerWeek}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hours) => (
                        <option key={hours} value={hours}>
                          {hours} Hours
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Max Students */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Maximum Students
                    </label>
                    <input
                      type="number"
                      name="maxStudents"
                      value={formData.maxStudents}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min="1"
                      max="200"
                    />
                  </div>

                  {/* Is Lab */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isLab"
                      name="isLab"
                      checked={formData.isLab}
                      onChange={handleFormChange}
                      className="w-5 h-5"
                    />
                    <label
                      htmlFor="isLab"
                      className="text-sm font-semibold text-gray-600">
                      This is a Lab Course
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows="3"
                    placeholder="Additional notes about this allocation..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingAllocation(null);
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
                      : editingAllocation
                        ? "Update Allocation"
                        : "Create Allocation"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Allocations Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading allocations...</p>
            </div>
          ) : allocations.length === 0 ? (
            <div className="p-8 text-center">
              <FaChalkboardTeacher className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Course Allocations Found
              </h3>
              <p className="text-gray-500 mb-6">
                {Object.values(filters).some((f) => f)
                  ? "Try adjusting your filters"
                  : "Create your first course allocation"}
              </p>
              <button
                onClick={() => {
                  setFilters({
                    academicSession: "",
                    semester: "",
                    program: "",
                    teacher: "",
                    status: "",
                    search: "",
                  });
                  setShowForm(true);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Create First Allocation
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Program & Section
                      </th>
                      <th className="px 6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Session & Semester
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allocations.map((allocation) => (
                      <tr
                        key={allocation._id}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FaBook className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {allocation.course?.code}
                              </div>
                              <div className="text-sm text-gray-500">
                                {allocation.course?.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                              <FaUserGraduate className="text-green-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {allocation.teacher?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {allocation.teacher?.employeeId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {allocation.program?.code}
                          </div>
                          <div className="text-sm text-gray-500">
                            Section: {allocation.section?.name} (
                            {allocation.section?.code})
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {allocation.academicSession?.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <FaUniversity /> Sem {allocation.semester}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {allocation.creditHours} CR
                          </div>
                          <div className="text-sm text-gray-500">
                            {allocation.contactHoursPerWeek} hrs/wk
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(allocation.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(allocation)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              title="Edit">
                              <FaEdit /> Edit
                            </button>

                            {allocation.status === "draft" && (
                              <button
                                onClick={() => handleApprove(allocation._id)}
                                className="text-green-600 hover:text-green-800 flex items-center gap-1"
                                title="Approve">
                                <FaCheckCircle /> Approve
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(allocation._id)}
                              className="text-red-600 hover:text-red-800 flex items-center gap-1"
                              title="Cancel">
                              <FaTrash /> Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-semibold">{allocations.length}</span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {pagination.totalItems}
                    </span>{" "}
                    allocations
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                      }
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
                      }
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Statistics Summary */}
        {allocations.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-sm text-gray-600">Total Allocations</div>
              <div className="text-2xl font-bold text-gray-800">
                {pagination.totalItems}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-sm text-gray-600">Active Allocations</div>
              <div className="text-2xl font-bold text-green-600">
                {allocations.filter((a) => a.status === "active").length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-sm text-gray-600">Draft Allocations</div>
              <div className="text-2xl font-bold text-yellow-600">
                {allocations.filter((a) => a.status === "draft").length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-sm text-gray-600">Total Contact Hours</div>
              <div className="text-2xl font-bold text-blue-600">
                {allocations.reduce((sum, a) => sum + a.contactHoursPerWeek, 0)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseAllocations;
