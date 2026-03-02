import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaBook,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaBuilding,
  FaGraduationCap,
  FaClock,
  FaFlask,
  FaList,
  FaFilter,
} from "react-icons/fa";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [availablePrerequisites, setAvailablePrerequisites] = useState([]);
  const [filters, setFilters] = useState({
    department: "",
    program: "",
    semester: "",
    courseType: "",
    isCore: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    department: "",
    program: "",
    semester: "",
    creditHours: 3,
    courseType: "Theory",
    labHours: 0,
    description: "",
    prerequisites: [],
    isCore: true,
    maxStudents: 60,
  });

  // Course type options
  const courseTypes = [
    { value: "Theory", label: "Theory", icon: FaBook },
    { value: "Lab", label: "Lab", icon: FaFlask },
    { value: "Theory+Lab", label: "Theory + Lab", icon: FaBook },
  ];

  // Semester options
  const semesterOptions = Array.from({ length: 8 }, (_, i) => i + 1);
  const creditHourOptions = [1, 2, 3, 4];
  const labHourOptions = [0, 1, 2, 3];

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchPrograms(); // ✅ YAHAN
  }, []);

  useEffect(() => {
    if (formData.department) {
      fetchProgramsByDepartment(formData.department);
    } else {
      setFilteredPrograms([]);
    }
  }, [formData.department]);

  useEffect(() => {
    if (editingCourse) {
      fetchAvailablePrerequisites(editingCourse._id);
    }
  }, [editingCourse]);

  const fetchCourses = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const { data } = await api.get(`/courses?${queryParams}`);
      setCourses(data);
    } catch (error) {
      toast.error("Failed to fetch courses");
      console.error("Error:", error.response?.data);
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
    console.log("Department ID:", deptId);
    try {
      const { data } = await api.get(`/programs/department/${deptId}`);
      console.log("Programs response:", data);

      setFilteredPrograms(
        Array.isArray(data) ? data : data.programs || data.data || [],
      );
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const { data } = await api.get("/programs");
      setPrograms(
        Array.isArray(data) ? data : data.programs || data.data || [],
      );
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  };

  const fetchAvailablePrerequisites = async (courseId) => {
    try {
      const { data } = await api.get(
        `/courses/${courseId}/available-prerequisites`,
      );
      setAvailablePrerequisites(data);
    } catch (error) {
      console.error("Failed to fetch prerequisites:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCourse) {
        // Update existing course
        await api.put(`/courses/${editingCourse._id}`, formData);
        toast.success("Course updated successfully!");
        setEditingCourse(null);
      } else {
        // Create new course
        await api.post("/courses", formData);
        toast.success("Course created successfully!");
      }

      setShowForm(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      department: course.department._id,
      program: course.program._id,
      semester: course.semester,
      creditHours: course.creditHours,
      courseType: course.courseType,
      labHours: course.labHours,
      description: course.description || "",
      prerequisites: course.prerequisites.map((p) => p._id),
      isCore: course.isCore,
      maxStudents: course.maxStudents,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await api.delete(`/courses/${id}`);
      toast.success("Course deleted successfully!");
      fetchCourses();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/courses/${id}/toggle-status`);
      toast.success(`Course ${!currentStatus ? "activated" : "deactivated"}!`);
      fetchCourses();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      department: "",
      program: "",
      semester: "",
      creditHours: 3,
      courseType: "Theory",
      labHours: 0,
      description: "",
      prerequisites: [],
      isCore: true,
      maxStudents: 60,
    });
    setAvailablePrerequisites([]);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchCourses();
  };

  const clearFilters = () => {
    setFilters({
      department: "",
      program: "",
      semester: "",
      courseType: "",
      isCore: "",
    });
  };

  const getCourseTypeIcon = (type) => {
    switch (type) {
      case "Theory":
        return <FaBook className="text-blue-500" />;
      case "Lab":
        return <FaFlask className="text-green-500" />;
      case "Theory+Lab":
        return (
          <>
            <FaBook className="text-blue-500" />
            <FaFlask className="text-green-500 ml-1" />
          </>
        );
      default:
        return <FaBook />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Course Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage courses with Theory/Lab types, credit hours, and
              prerequisites
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCourse(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
            <FaPlus /> Add Course
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaFilter /> Filter Courses
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Programs</option>
                {programs.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Semesters</option>
                {semesterOptions.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Type
              </label>
              <select
                name="courseType"
                value={filters.courseType}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Types</option>
                <option value="Theory">Theory</option>
                <option value="Lab">Lab</option>
                <option value="Theory+Lab">Theory+Lab</option>
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

        {/* Create/Edit Course Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingCourse ? "Edit Course" : "Create New Course"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingCourse(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTrash size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Course Code *
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
                      placeholder="e.g., CS101"
                      maxLength={10}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., Introduction to Programming"
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
                      Semester *
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          semester: parseInt(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      <option value="">Select Semester</option>
                      {semesterOptions.map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Credit Hours *
                    </label>
                    <select
                      value={formData.creditHours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creditHours: parseInt(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      {creditHourOptions.map((hours) => (
                        <option key={hours} value={hours}>
                          {hours} Credit Hour{hours > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Course Type *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {courseTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              courseType: type.value,
                              labHours:
                                type.value === "Theory" ? 0 : formData.labHours,
                            });
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.courseType === type.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}>
                          <div className="flex flex-col items-center">
                            <type.icon
                              className={`text-lg ${
                                formData.courseType === type.value
                                  ? "text-blue-600"
                                  : "text-gray-400"
                              }`}
                            />
                            <span className="text-xs mt-1">{type.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Lab Hours
                    </label>
                    <select
                      value={formData.labHours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          labHours: parseInt(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      disabled={formData.courseType === "Theory"}>
                      {labHourOptions.map((hours) => (
                        <option key={hours} value={hours}>
                          {hours} Lab Hour{hours > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                    {formData.courseType === "Theory" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Lab hours disabled for Theory courses
                      </p>
                    )}
                  </div>
                </div>

                {/* Prerequisites */}
                {editingCourse && availablePrerequisites.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Prerequisites
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">
                        Select prerequisite courses (courses from lower
                        semesters):
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {availablePrerequisites.map((course) => (
                          <label
                            key={course._id}
                            className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.prerequisites.includes(
                                course._id,
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    prerequisites: [
                                      ...formData.prerequisites,
                                      course._id,
                                    ],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    prerequisites:
                                      formData.prerequisites.filter(
                                        (id) => id !== course._id,
                                      ),
                                  });
                                }
                              }}
                              className="mr-3"
                            />
                            <div>
                              <span className="font-medium text-gray-800">
                                {course.code}
                              </span>
                              <span className="text-sm text-gray-600 ml-2">
                                {course.name}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                Semester {course.semester}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Maximum Students
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxStudents}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxStudents: parseInt(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Course Category
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="true"
                          checked={formData.isCore}
                          onChange={() =>
                            setFormData({ ...formData, isCore: true })
                          }
                          className="mr-2"
                        />
                        <span className="text-gray-700">Core Course</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="false"
                          checked={!formData.isCore}
                          onChange={() =>
                            setFormData({ ...formData, isCore: false })
                          }
                          className="mr-2"
                        />
                        <span className="text-gray-700">Elective Course</span>
                      </label>
                    </div>
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
                    rows="4"
                    placeholder="Course description, objectives, learning outcomes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCourse(null);
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
                      : editingCourse
                        ? "Update Course"
                        : "Create Course"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Courses Table */}
        {courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Courses Found
            </h3>
            <p className="text-gray-500 mb-6">
              {Object.values(filters).some((f) => f)
                ? "No courses match your filters. Try different filters."
                : "Create your first course to start academic planning"}
            </p>
            <button
              onClick={() => {
                setEditingCourse(null);
                resetForm();
                setShowForm(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Create First Course
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {courses.length}
                    </p>
                  </div>
                  <FaBook className="text-blue-500 text-2xl" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Theory Courses</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {courses.filter((c) => c.courseType === "Theory").length}
                    </p>
                  </div>
                  <FaBook className="text-blue-500 text-2xl" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Lab Courses</p>
                    <p className="text-2xl font-bold text-green-600">
                      {
                        courses.filter(
                          (c) =>
                            c.courseType === "Lab" ||
                            c.courseType === "Theory+Lab",
                        ).length
                      }
                    </p>
                  </div>
                  <FaFlask className="text-green-500 text-2xl" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg Credit Hours</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(
                        courses.reduce((sum, c) => sum + c.creditHours, 0) /
                        courses.length
                      ).toFixed(1)}
                    </p>
                  </div>
                  <FaClock className="text-purple-500 text-2xl" />
                </div>
              </div>
            </div>

            {/* Courses List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Course Details
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Program & Semester
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Hours
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
                    {courses.map((course) => (
                      <tr
                        key={course._id}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-start">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                course.courseType === "Lab"
                                  ? "bg-green-100"
                                  : course.courseType === "Theory+Lab"
                                    ? "bg-purple-100"
                                    : "bg-blue-100"
                              }`}>
                              {getCourseTypeIcon(course.courseType)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-800">
                                  {course.code}
                                </h4>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    course.isCore
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}>
                                  {course.isCore ? "Core" : "Elective"}
                                </span>
                              </div>
                              <h5 className="text-gray-700 font-medium">
                                {course.name}
                              </h5>
                              <div className="flex items-center gap-2 mt-1">
                                <FaBuilding className="text-gray-400 text-xs" />
                                <span className="text-xs text-gray-500">
                                  {course.department?.name}
                                </span>
                              </div>
                              {course.description && (
                                <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                                  {course.description}
                                </p>
                              )}
                              {course.prerequisites?.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <FaList className="text-gray-400 text-xs" />
                                  <span className="text-xs text-gray-500">
                                    Prereqs:{" "}
                                    {course.prerequisites
                                      .map((p) => p.code)
                                      .join(", ")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FaGraduationCap className="text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  {course.program?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {course.program?.code}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaList className="text-gray-400" />
                              <span className="text-sm text-gray-700">
                                Semester {course.semester}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Max: {course.maxStudents} students
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FaClock className="text-blue-500" />
                              <span className="text-sm font-medium text-gray-700">
                                {course.creditHours} Credit Hour
                                {course.creditHours > 1 ? "s" : ""}
                              </span>
                            </div>
                            {course.labHours > 0 && (
                              <div className="flex items-center gap-2">
                                <FaFlask className="text-green-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  {course.labHours} Lab Hour
                                  {course.labHours > 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              Total: {course.creditHours + course.labHours}{" "}
                              hours
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              course.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                            {course.isActive ? (
                              <>
                                <FaToggleOn className="mr-1" /> Active
                              </>
                            ) : (
                              <>
                                <FaToggleOff className="mr-1" /> Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(course)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit">
                              <FaEdit />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleStatus(course._id, course.isActive)
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                course.isActive
                                  ? "text-orange-600 hover:bg-orange-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              title={
                                course.isActive ? "Deactivate" : "Activate"
                              }>
                              {course.isActive ? (
                                <FaToggleOff />
                              ) : (
                                <FaToggleOn />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(course._id)}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Courses;
