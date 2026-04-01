import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaChartBar,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaCalendarCheck,
  FaCalendarTimes,
  FaClock,
  FaGraduationCap,
  FaUsers,
  FaBook,
  FaUserGraduate,
  FaBuilding,
  FaCalendarDay,
  FaEye,
  FaPrint,
  FaDownload,
  FaSync,
  FaExclamationTriangle,
} from "react-icons/fa";

const Timetables = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [timetableMatrix, setTimetableMatrix] = useState(null);
  const [showMatrixView, setShowMatrixView] = useState(false);

  // Dropdown data
  const [sessions, setSessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [sections, setSections] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [availableAllocations, setAvailableAllocations] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    academicSession: "",
    semester: "",
    program: "",
    section: "",
    status: "",
    search: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    academicSession: "",
    semester: "",
    program: "",
    section: "",
    constraints: {
      noBackToBackClasses: false,
      maxDailyHours: 8,
      preferMorningSlots: true,
      preferLabAfternoons: true,
    },
  });

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    day: "Monday",
    timeSlot: "",
    courseAllocation: "",
    room: "",
    notes: "",
  });

  // Days of the week
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    fetchTimetables();
    fetchDropdownData();
  }, [filters]);

  useEffect(() => {
    if (selectedTimetable && showMatrixView) {
      fetchTimetableMatrix(selectedTimetable._id);
    }
  }, [selectedTimetable, showMatrixView]);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/timetables?${params}`);
      setTimetables(data.data);
    } catch (error) {
      toast.error("Failed to fetch timetables");
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

      // Fetch time slots
      const slotsRes = await api.get("/time-slots?activeOnly=true");
      setTimeSlots(slotsRes.data.data);

      const sectionsRes = await api.get("/sections");
      setSections(sectionsRes.data);

      // Fetch rooms
      const roomsRes = await api.get("/rooms?isActive=true");
      setRooms(roomsRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
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

  const fetchAvailableAllocations = async (timetableId) => {
    if (!timetableId) return;

    try {
      const { data } = await api.get(
        `/timetables/${timetableId}/available-allocations`,
      );
      setAvailableAllocations(data.data);
    } catch (error) {
      console.error("Error fetching available allocations:", error);
      setAvailableAllocations([]);
    }
  };

  const fetchTimetableMatrix = async (timetableId) => {
    try {
      const { data } = await api.get(`/timetables/${timetableId}/matrix`);
      setTimetableMatrix(data.data);
    } catch (error) {
      console.error("Error fetching timetable matrix:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTimetable) {
        // Update timetable
        await api.put(`/timetables/${editingTimetable._id}`, formData);
        toast.success("Timetable updated successfully!");
      } else {
        // Create new timetable
        await api.post("/timetables", formData);
        toast.success("Timetable created successfully!");
      }

      setShowForm(false);
      resetForm();
      fetchTimetables();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check for conflicts first
      const conflictCheck = await api.post(
        `/timetables/${selectedTimetable._id}/check-conflicts`,
        {
          ...scheduleForm,
          excludeEntryId: null,
        },
      );

      if (conflictCheck.data.hasConflicts) {
        const conflictList = conflictCheck.data.conflicts
          .map((c) => `${c.type}: ${c.message}`)
          .join("\n");

        if (
          !window.confirm(
            `Schedule entry has conflicts:\n\n${conflictList}\n\nDo you want to continue anyway?`,
          )
        ) {
          setLoading(false);
          return;
        }
      }

      // Add schedule entry
      await api.post(
        `/timetables/${selectedTimetable._id}/schedule`,
        scheduleForm,
      );
      toast.success("Schedule entry added successfully!");

      setShowScheduleForm(false);
      resetScheduleForm();
      fetchTimetables();
      if (selectedTimetable) {
        const { data } = await api.get(`/timetables/${selectedTimetable._id}`);
        setSelectedTimetable(data.data);
        if (showMatrixView) {
          fetchTimetableMatrix(selectedTimetable._id);
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (timetable) => {
    setEditingTimetable(timetable);
    setFormData({
      name: timetable.name,
      description: timetable.description || "",
      academicSession: timetable.academicSession?._id || "",
      semester: timetable.semester,
      program: timetable.program?._id || "",
      section: timetable.section?._id || "",
      constraints: timetable.constraints || {
        noBackToBackClasses: false,
        maxDailyHours: 8,
        preferMorningSlots: true,
        preferLabAfternoons: true,
      },
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to archive this timetable?"))
      return;

    try {
      await api.delete(`/timetables/${id}`);
      toast.success("Timetable archived successfully!");
      fetchTimetables();
      if (selectedTimetable?._id === id) {
        setSelectedTimetable(null);
        setShowMatrixView(false);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handlePublish = async (id) => {
    try {
      await api.put(`/timetables/${id}/publish`);
      toast.success("Timetable published successfully!");
      fetchTimetables();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/timetables/${id}/approve`, {
        approvalNotes: "Approved by admin",
      });
      toast.success("Timetable approved successfully!");
      fetchTimetables();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleRemoveScheduleEntry = async (entryId) => {
    if (!window.confirm("Are you sure you want to remove this schedule entry?"))
      return;

    try {
      await api.delete(
        `/timetables/${selectedTimetable._id}/schedule/${entryId}`,
      );
      toast.success("Schedule entry removed successfully!");

      // Refresh timetable data
      const { data } = await api.get(`/timetables/${selectedTimetable._id}`);
      setSelectedTimetable(data.data);
      if (showMatrixView) {
        fetchTimetableMatrix(selectedTimetable._id);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleViewDetails = async (timetable) => {
    try {
      const { data } = await api.get(`/timetables/${timetable._id}`);
      setSelectedTimetable(data.data);
      setShowMatrixView(false);
    } catch (error) {
      toast.error("Failed to fetch timetable details");
      console.error("Error:", error.response?.data);
    }
  };

  const handleViewMatrix = async (timetable) => {
    try {
      const { data } = await api.get(`/timetables/${timetable._id}`);
      setSelectedTimetable(data.data);
      setShowMatrixView(true);
      fetchTimetableMatrix(timetable._id);
    } catch (error) {
      toast.error("Failed to fetch timetable matrix");
      console.error("Error:", error.response?.data);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("constraints.")) {
      const constraintName = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        constraints: {
          ...prev.constraints,
          [constraintName]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
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

  const handleScheduleFormChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      academicSession: "",
      semester: "",
      program: "",
      section: "",
      constraints: {
        noBackToBackClasses: false,
        maxDailyHours: 8,
        preferMorningSlots: true,
        preferLabAfternoons: true,
      },
    });
    setEditingTimetable(null);
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      day: "Monday",
      timeSlot: "",
      courseAllocation: "",
      room: "",
      notes: "",
    });
  };

  const getStatusBadge = (status, isApproved) => {
    const statusConfig = {
      draft: { color: "bg-yellow-100 text-yellow-800", label: "Draft" },
      published: { color: "bg-green-100 text-green-800", label: "Published" },
      archived: { color: "bg-gray-100 text-gray-800", label: "Archived" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <div className="flex flex-col gap-1">
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${config.color}`}>
          {config.label}
        </span>
        {isApproved && status === "published" && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            Approved
          </span>
        )}
      </div>
    );
  };

  const getTimeSlotColor = (slotType) => {
    switch (slotType) {
      case "theory":
        return "bg-blue-50 border-blue-200";
      case "lab":
        return "bg-green-50 border-green-200";
      case "break":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const handleAddSchedule = (timetable) => {
    setSelectedTimetable(timetable);
    fetchAvailableAllocations(timetable._id);
    setShowScheduleForm(true);
    resetScheduleForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FaCalendarAlt /> Timetable Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage academic timetables for programs and sections
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
            <FaPlus /> Create Timetable
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
                <option value="published">Published</option>
                <option value="archived">Archived</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by timetable name, program, section..."
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
                    section: "",
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

        {/* Create/Edit Timetable Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full my-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaCalendarAlt />
                  {editingTimetable ? "Edit Timetable" : "Create New Timetable"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimesCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Timetable Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., BSCS Sem 5 - Section A Timetable"
                      required
                    />
                  </div>

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
                      required
                      disabled={!formData.program || !formData.semester}>
                      <option value="">Select Section</option>
                      {sections.map((section) => (
                        <option key={section._id} value={section._id}>
                          {section.name} ({section.code})
                        </option>
                      ))}
                    </select>
                    {(!formData.program || !formData.semester) && (
                      <p className="text-xs text-gray-500 mt-1">
                        Select program and semester first
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows="3"
                    placeholder="Timetable description..."
                  />
                </div>

                {/* Constraints */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Scheduling Constraints
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="noBackToBackClasses"
                        name="constraints.noBackToBackClasses"
                        checked={formData.constraints.noBackToBackClasses}
                        onChange={handleFormChange}
                        className="w-5 h-5"
                      />
                      <label
                        htmlFor="noBackToBackClasses"
                        className="text-sm font-semibold text-gray-600">
                        Avoid Back-to-Back Classes
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="preferMorningSlots"
                        name="constraints.preferMorningSlots"
                        checked={formData.constraints.preferMorningSlots}
                        onChange={handleFormChange}
                        className="w-5 h-5"
                      />
                      <label
                        htmlFor="preferMorningSlots"
                        className="text-sm font-semibold text-gray-600">
                        Prefer Morning Slots
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="preferLabAfternoons"
                        name="constraints.preferLabAfternoons"
                        checked={formData.constraints.preferLabAfternoons}
                        onChange={handleFormChange}
                        className="w-5 h-5"
                      />
                      <label
                        htmlFor="preferLabAfternoons"
                        className="text-sm font-semibold text-gray-600">
                        Schedule Labs in Afternoons
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">
                        Max Daily Hours
                      </label>
                      <select
                        name="constraints.maxDailyHours"
                        value={formData.constraints.maxDailyHours}
                        onChange={handleFormChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                        {[4, 5, 6, 7, 8, 9, 10].map((hours) => (
                          <option key={hours} value={hours}>
                            {hours} hours
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
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
                      : editingTimetable
                        ? "Update Timetable"
                        : "Create Timetable"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Schedule Entry Modal */}
        {showScheduleForm && selectedTimetable && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full my-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaClock />
                  Add Schedule Entry
                </h2>
                <button
                  onClick={() => {
                    setShowScheduleForm(false);
                    resetScheduleForm();
                  }}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimesCircle size={24} />
                </button>
              </div>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Timetable Info
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Program:</span>{" "}
                    {selectedTimetable.program?.code}
                  </div>
                  <div>
                    <span className="font-medium">Section:</span>{" "}
                    {selectedTimetable.section?.name}
                  </div>
                  <div>
                    <span className="font-medium">Semester:</span>{" "}
                    {selectedTimetable.semester}
                  </div>
                  <div>
                    <span className="font-medium">Session:</span>{" "}
                    {selectedTimetable.academicSession?.name}
                  </div>
                </div>
              </div>

              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Day */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Day *
                    </label>
                    <select
                      name="day"
                      value={scheduleForm.day}
                      onChange={handleScheduleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      {days.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Slot */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Time Slot *
                    </label>
                    <select
                      name="timeSlot"
                      value={scheduleForm.timeSlot}
                      onChange={handleScheduleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      <option value="">Select Time Slot</option>
                      {timeSlots
                        .filter((slot) =>
                          slot.availableDays.includes(scheduleForm.day),
                        )
                        .map((slot) => (
                          <option key={slot._id} value={slot._id}>
                            {slot.name} ({slot.startTime} - {slot.endTime})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Course Allocation */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Course Allocation *
                    </label>
                    <select
                      name="courseAllocation"
                      value={scheduleForm.courseAllocation}
                      onChange={handleScheduleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      <option value="">Select Course</option>
                      {availableAllocations.map((allocation) => (
                        <option key={allocation._id} value={allocation._id}>
                          {allocation.course?.code} - {allocation.course?.name}{" "}
                          ({allocation.teacher?.name})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {availableAllocations.length} available allocations
                    </p>
                  </div>

                  {/* Room */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Room (Optional)
                    </label>
                    <select
                      name="room"
                      value={scheduleForm.room}
                      onChange={handleScheduleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                      <option value="">No Room Assigned</option>
                      {rooms.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.code} - {room.name} (Capacity: {room.capacity})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={scheduleForm.notes}
                    onChange={handleScheduleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows="2"
                    placeholder="Notes about this schedule entry..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleForm(false);
                      resetScheduleForm();
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {loading ? "Adding..." : "Add to Schedule"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Timetables List */}
          <div className={`lg:col-span-${selectedTimetable ? "2" : "3"}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading timetables...</p>
                </div>
              ) : timetables.length === 0 ? (
                <div className="p-8 text-center">
                  <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Timetables Found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {Object.values(filters).some((f) => f)
                      ? "Try adjusting your filters"
                      : "Create your first timetable"}
                  </p>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Create First Timetable
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Timetable
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Program & Section
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Session & Semester
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Schedule
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
                        {timetables.map((timetable) => (
                          <tr
                            key={timetable._id}
                            className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <FaCalendarAlt className="text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {timetable.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Version: {timetable.version}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {timetable.program?.code}
                              </div>
                              <div className="text-sm text-gray-500">
                                Section: {timetable.section?.name}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {timetable.academicSession?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Sem {timetable.semester}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {timetable.schedule?.length || 0} entries
                              </div>
                              <div className="text-sm text-gray-500">
                                {timetable.totalHoursPerWeek || 0} hrs/wk
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(
                                timetable.status,
                                timetable.isApproved,
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleViewDetails(timetable)}
                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                                    title="View Details">
                                    <FaEye /> Details
                                  </button>

                                  <button
                                    onClick={() => handleViewMatrix(timetable)}
                                    className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs"
                                    title="View Matrix">
                                    <FaCalendarDay /> Matrix
                                  </button>
                                </div>

                                <div className="flex gap-2">
                                  {timetable.status === "draft" && (
                                    <>
                                      <button
                                        onClick={() => handleEdit(timetable)}
                                        className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1 text-xs"
                                        title="Edit">
                                        <FaEdit /> Edit
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleAddSchedule(timetable)
                                        }
                                        className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-xs"
                                        title="Add Schedule">
                                        <FaPlus /> Add
                                      </button>

                                      <button
                                        onClick={() =>
                                          handlePublish(timetable._id)
                                        }
                                        className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs"
                                        title="Publish">
                                        <FaCheckCircle /> Publish
                                      </button>
                                    </>
                                  )}

                                  {timetable.status === "published" &&
                                    !timetable.isApproved && (
                                      <button
                                        onClick={() =>
                                          handleApprove(timetable._id)
                                        }
                                        className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs"
                                        title="Approve">
                                        <FaCheckCircle /> Approve
                                      </button>
                                    )}

                                  <button
                                    onClick={() => handleDelete(timetable._id)}
                                    className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs"
                                    title="Archive">
                                    <FaTrash /> Archive
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Timetable Details Sidebar */}
          {selectedTimetable && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Timetable Details
                    </h3>
                    <button
                      onClick={() => setSelectedTimetable(null)}
                      className="text-gray-400 hover:text-gray-600">
                      <FaTimesCircle />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Basic Info */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FaCalendarCheck /> Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">
                          {selectedTimetable.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Program:</span>
                        <span className="font-medium">
                          {selectedTimetable.program?.code}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Section:</span>
                        <span className="font-medium">
                          {selectedTimetable.section?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Semester:</span>
                        <span className="font-medium">
                          {selectedTimetable.semester}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Session:</span>
                        <span className="font-medium">
                          {selectedTimetable.academicSession?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FaChartBar /> Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                          {selectedTimetable.schedule?.length || 0}
                        </div>
                        <div className="text-xs text-blue-600">
                          Total Entries
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                          {selectedTimetable.totalHoursPerWeek || 0}
                        </div>
                        <div className="text-xs text-green-600">Hours/Week</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-purple-700">
                          {selectedTimetable.totalCourses || 0}
                        </div>
                        <div className="text-xs text-purple-600">Courses</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-700">
                          {selectedTimetable.version}
                        </div>
                        <div className="text-xs text-yellow-600">Version</div>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Entries */}
                  {!showMatrixView && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <FaClock /> Schedule Entries
                      </h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedTimetable.schedule?.map((entry, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-sm">
                                  {entry.courseAllocation?.course?.code}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {entry.day} • {entry.timeSlot?.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {entry.courseAllocation?.teacher?.name}
                                </div>
                                {entry.room && (
                                  <div className="text-xs text-gray-500">
                                    Room: {entry.room?.code}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  handleRemoveScheduleEntry(entry._id)
                                }
                                className="text-red-500 hover:text-red-700 text-xs">
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matrix View */}
                  {showMatrixView && timetableMatrix && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <FaCalendarDay /> Timetable Matrix
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr>
                              <th className="px-2 py-2 border">Time</th>
                              {timetableMatrix.days.map((day) => (
                                <th key={day} className="px-2 py-2 border">
                                  {day.slice(0, 3)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {timetableMatrix.timeSlots.map((slot) => (
                              <tr key={slot._id}>
                                <td className="px-2 py-2 border text-gray-600">
                                  {slot.name}
                                </td>
                                {timetableMatrix.days.map((day) => {
                                  const entry =
                                    timetableMatrix.matrix[day]?.[slot._id];
                                  return (
                                    <td
                                      key={`${day}-${slot._id}`}
                                      className="px-2 py-2 border">
                                      {entry ? (
                                        <div
                                          className={`p-2 rounded ${getTimeSlotColor(slot.slotType)}`}>
                                          <div className="font-medium">
                                            {
                                              entry.courseAllocation?.course
                                                ?.code
                                            }
                                          </div>
                                          <div className="text-xs">
                                            {
                                              entry.courseAllocation?.teacher?.name?.split(
                                                " ",
                                              )[0]
                                            }
                                          </div>
                                          {entry.room && (
                                            <div className="text-xs text-gray-500">
                                              {entry.room?.code}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-gray-300 text-center">
                                          -
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddSchedule(selectedTimetable)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        <FaPlus className="inline mr-1" /> Add Entry
                      </button>
                      {selectedTimetable.status === "draft" && (
                        <button
                          onClick={() => handlePublish(selectedTimetable._id)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                          <FaCheckCircle className="inline mr-1" /> Publish
                        </button>
                      )}
                    </div>
                    {showMatrixView ? (
                      <button
                        onClick={() => setShowMatrixView(false)}
                        className="w-full mt-2 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                        <FaEye className="inline mr-1" /> Show Details
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowMatrixView(true)}
                        className="w-full mt-2 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                        <FaCalendarDay className="inline mr-1" /> Show Matrix
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timetables;
