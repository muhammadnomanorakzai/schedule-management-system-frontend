import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaUserTie,
  FaGraduationCap,
  FaCalendarAlt,
  FaBuilding,
  FaListOl,
  FaFilter,
  FaChartBar,
  FaUserGraduate,
} from "react-icons/fa";

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [filteredSemesters, setFilteredSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showStudents, setShowStudents] = useState(null);
  const [sectionStudents, setSectionStudents] = useState([]);
  const [stats, setStats] = useState({
    totalSections: 0,
    activeSections: 0,
    sectionsWithIncharge: 0,
    averageStrength: 0,
  });

  const [filters, setFilters] = useState({
    department: "",
    program: "",
    semester: "",
    academicSession: "",
    isActive: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    program: "",
    semester: "",
    academicSession: "",
    department: "",
    maxStrength: 60,
    sectionIncharge: "",
    description: "",
  });

  useEffect(() => {
    fetchSections();
    fetchDepartments();
    fetchAcademicSessions();
    fetchStats();
  }, []);

  useEffect(() => {
    if (filters.department) {
      fetchProgramsByDepartment(filters.department);
    } else {
      setPrograms([]);
    }
  }, [filters.department]);

  useEffect(() => {
    if (formData.department) {
      fetchProgramsByDepartment(formData.department);
      fetchTeachers();
    }
  }, [formData.department]);

  useEffect(() => {
    if (formData.academicSession) {
      fetchSemestersBySession(formData.academicSession);
    }
  }, [formData.academicSession]);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const fetchSections = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const { data } = await api.get(`/sections?${queryParams}`);
      setSections(data);
    } catch (error) {
      toast.error("Failed to fetch sections");
      console.error("Error:", error.response?.data);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/sections/stats/overview");
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

  const fetchSemestersBySession = async (sessionId) => {
    try {
      const { data } = await api.get(`/semesters/session/${sessionId}`);
      setFilteredSemesters(data);
    } catch (error) {
      console.error("Failed to fetch semesters:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get("/teachers");
      setTeachers(
        data.filter((t) => t.role === "Teacher" && t.status === "Approved"),
      );
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  const fetchSectionStudents = async (sectionId) => {
    try {
      const { data } = await api.get(`/sections/${sectionId}`);
      setSectionStudents(data.students || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingSection) {
        // Update existing section
        await api.put(`/sections/${editingSection._id}`, formData);
        toast.success("Section updated successfully!");
        setEditingSection(null);
      } else {
        // Create new section
        await api.post("/sections", formData);
        toast.success("Section created successfully!");
      }

      setShowForm(false);
      resetForm();
      fetchSections();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      code: section.code,
      program: section.program._id,
      semester: section.semester._id,
      academicSession: section.academicSession._id,
      department: section.department._id,
      maxStrength: section.maxStrength,
      sectionIncharge: section.sectionIncharge?._id || "",
      description: section.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this section?"))
      return;

    try {
      await api.delete(`/sections/${id}`);
      toast.success("Section deleted successfully!");
      fetchSections();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/sections/${id}/toggle-status`);
      toast.success(`Section ${!currentStatus ? "activated" : "deactivated"}!`);
      fetchSections();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleViewStudents = async (section) => {
    setShowStudents(section._id);
    await fetchSectionStudents(section._id);
  };

  const handleAssignIncharge = async (sectionId, teacherId) => {
    try {
      await api.put(`/sections/${sectionId}/assign-incharge`, { teacherId });
      toast.success("Section incharge assigned successfully!");
      fetchSections();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      program: "",
      semester: "",
      academicSession: "",
      department: "",
      maxStrength: 60,
      sectionIncharge: "",
      description: "",
    });
    setFilteredPrograms([]);
    setFilteredSemesters([]);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchSections();
  };

  const clearFilters = () => {
    setFilters({
      department: "",
      program: "",
      semester: "",
      academicSession: "",
      isActive: "",
    });
  };

  const getStrengthColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-orange-600";
    return "text-green-600";
  };

  const getStrengthBgColor = (current, max) => {
    const percentage = (current / max) * 100;
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
              Section Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage student sections/batches for programs and semesters
            </p>
          </div>
          <button
            onClick={() => {
              setEditingSection(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
            <FaPlus /> Create Section
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sections</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalSections}
                </p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <FaUsers className="text-2xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Sections</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.activeSections}
                </p>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <FaToggleOn className="text-2xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">With Incharge</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.sectionsWithIncharge}
                </p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <FaUserTie className="text-2xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Strength</p>
                <p className="text-3xl font-bold text-orange-600">
                  {Math.round(stats.averageStrength)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                <FaChartBar className="text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaFilter /> Filter Sections
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800">
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                Status
              </label>
              <select
                name="isActive"
                value={filters.isActive}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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

        {/* Create/Edit Section Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingSection ? "Edit Section" : "Create New Section"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingSection(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTrash size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Section Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., Morning Section"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Section Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., A, B, C"
                      maxLength={5}
                      required
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
                      Academic Session *
                    </label>
                    <select
                      value={formData.academicSession}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academicSession: e.target.value,
                          semester: "",
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      <option value="">Select Session</option>
                      {academicSessions.map((session) => (
                        <option key={session._id} value={session._id}>
                          {session.name} ({session.sessionType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Semester *
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({ ...formData, semester: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                      disabled={!formData.academicSession}>
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
                      Maximum Strength *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.maxStrength}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxStrength: parseInt(e.target.value) || 60,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum number of students
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Section Incharge
                    </label>
                    <select
                      value={formData.sectionIncharge}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sectionIncharge: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                      <option value="">No Incharge</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows="3"
                    placeholder="Section description..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingSection(null);
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
                      : editingSection
                        ? "Update Section"
                        : "Create Section"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* View Students Modal */}
        {showStudents && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Students in Section
                </h2>
                <button
                  onClick={() => setShowStudents(null)}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTrash size={20} />
                </button>
              </div>

              {sectionStudents.length === 0 ? (
                <div className="text-center py-10">
                  <FaUserGraduate className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No students enrolled in this section
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sectionStudents.map((student) => (
                    <div
                      key={student._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                      {student.rollNumber && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {student.rollNumber}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={() => setShowStudents(null)}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Sections List */}
        {sections.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Sections Found
            </h3>
            <p className="text-gray-500 mb-6">
              {Object.values(filters).some((f) => f)
                ? "No sections match your filters. Try different filters."
                : "Create your first section to organize students"}
            </p>
            <button
              onClick={() => {
                setEditingSection(null);
                resetForm();
                setShowForm(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Create First Section
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <motion.div
                key={section._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Section Header */}
                <div
                  className={`px-6 py-4 ${
                    section.isActive
                      ? "bg-gradient-to-r from-blue-500 to-blue-600"
                      : "bg-gradient-to-r from-gray-500 to-gray-600"
                  }`}>
                  <div className="flex justify-between items-center">
                    <div className="text-white">
                      <h3 className="text-xl font-bold">{section.name}</h3>
                      <p className="text-sm opacity-90">
                        Section {section.code}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                        {section.program?.code}
                      </span>
                      {section.isActive && (
                        <span className="mt-2 px-2 py-0.5 bg-white text-blue-600 text-xs font-bold rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section Details */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaGraduationCap className="text-gray-400" />
                        <span className="text-sm text-gray-600">Program</span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        {section.program?.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaListOl className="text-gray-400" />
                        <span className="text-sm text-gray-600">Semester</span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        {section.semester?.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span className="text-sm text-gray-600">Session</span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        {section.academicSession?.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaBuilding className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Department
                        </span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        {section.department?.name}
                      </span>
                    </div>

                    {/* Strength Meter */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Student Strength
                        </span>
                        <span
                          className={`text-sm font-bold ${getStrengthColor(section.currentStrength, section.maxStrength)}`}>
                          {section.currentStrength}/{section.maxStrength}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getStrengthBgColor(section.currentStrength, section.maxStrength).replace("bg-", "bg-").replace("100", "500")}`}
                          style={{
                            width: `${Math.min((section.currentStrength / section.maxStrength) * 100, 100)}%`,
                          }}></div>
                      </div>
                    </div>

                    {/* Section Incharge */}
                    <div className="pt-4 border-t border-gray-100">
                      {section.sectionIncharge ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FaUserTie className="text-green-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {section.sectionIncharge.name}
                              </p>
                              <p className="text-xs text-gray-500">Incharge</p>
                            </div>
                          </div>
                          <select
                            value=""
                            onChange={(e) =>
                              handleAssignIncharge(section._id, e.target.value)
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1">
                            <option value="">Change</option>
                            {teachers.map((teacher) => (
                              <option key={teacher._id} value={teacher._id}>
                                {teacher.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            No incharge assigned
                          </span>
                          <select
                            value=""
                            onChange={(e) =>
                              handleAssignIncharge(section._id, e.target.value)
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1">
                            <option value="">Assign</option>
                            {teachers.map((teacher) => (
                              <option key={teacher._id} value={teacher._id}>
                                {teacher.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {section.description && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          {section.description}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-gray-100 flex justify-between">
                      <button
                        onClick={() => handleViewStudents(section)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                        <FaUserGraduate /> Students ({section.currentStrength})
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(section)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit">
                          <FaEdit />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleStatus(section._id, section.isActive)
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            section.isActive
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={section.isActive ? "Deactivate" : "Activate"}>
                          {section.isActive ? <FaToggleOff /> : <FaToggleOn />}
                        </button>
                        <button
                          onClick={() => handleDelete(section._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sections;
