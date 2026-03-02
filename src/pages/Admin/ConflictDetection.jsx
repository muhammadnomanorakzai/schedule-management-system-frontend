import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaMagic,
  FaChartBar,
  FaCalendarAlt,
  FaUserGraduate,
  FaBuilding,
  FaClock,
  FaList,
  FaArrowRight,
  FaCogs,
  FaBolt,
  FaChartLine,
} from "react-icons/fa";

const ConflictDetection = () => {
  const [conflicts, setConflicts] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [autoResolving, setAutoResolving] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState("");
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    conflictType: "",
    severity: "",
    search: "",
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    byType: {},
    bySeverity: {},
    byStatus: {},
    recent: [],
  });

  // Conflict types with icons and colors
  const conflictTypes = {
    teacher_schedule: {
      label: "Teacher Schedule",
      icon: <FaUserGraduate />,
      color: "bg-red-100 text-red-800",
      severity: "critical",
    },
    room_occupancy: {
      label: "Room Occupancy",
      icon: <FaBuilding />,
      color: "bg-orange-100 text-orange-800",
      severity: "high",
    },
    time_overlap: {
      label: "Time Overlap",
      icon: <FaClock />,
      color: "bg-yellow-100 text-yellow-800",
      severity: "high",
    },
    department_constraint: {
      label: "Department Constraint",
      icon: <FaBuilding />,
      color: "bg-blue-100 text-blue-800",
      severity: "medium",
    },
    resource_unavailable: {
      label: "Resource Unavailable",
      icon: <FaTimesCircle />,
      color: "bg-purple-100 text-purple-800",
      severity: "high",
    },
    back_to_back: {
      label: "Back-to-Back Classes",
      icon: <FaClock />,
      color: "bg-indigo-100 text-indigo-800",
      severity: "medium",
    },
    max_daily_hours: {
      label: "Max Daily Hours",
      icon: <FaChartLine />,
      color: "bg-pink-100 text-pink-800",
      severity: "medium",
    },
  };

  // Severity colors
  const severityColors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-blue-500",
    warning: "bg-gray-500",
  };

  useEffect(() => {
    fetchTimetables();
    fetchStats();
  }, []);

  useEffect(() => {
    if (selectedTimetable) {
      fetchConflicts();
    } else {
      fetchAllConflicts();
    }
  }, [filters, selectedTimetable]);

  const fetchTimetables = async () => {
    try {
      const { data } = await api.get("/timetables?limit=100");
      setTimetables(data.data);
    } catch (error) {
      console.error("Error fetching timetables:", error);
    }
  };

  const fetchConflicts = async () => {
    if (!selectedTimetable) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        timetableId: selectedTimetable,
      }).toString();

      const { data } = await api.get(
        `/conflicts/timetable/${selectedTimetable}?${params}`,
      );
      setConflicts(data.data);
    } catch (error) {
      toast.error("Failed to fetch conflicts");
      console.error("Error:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllConflicts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/conflicts/critical");
      setConflicts(data.data);
    } catch (error) {
      console.error("Error fetching all conflicts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/conflicts/stats");
      setStats(data.data || stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleDetectConflicts = async () => {
    if (!selectedTimetable) {
      toast.error("Please select a timetable first");
      return;
    }

    setDetecting(true);
    try {
      const { data } = await api.post(
        `/conflicts/detect/${selectedTimetable}`,
        {
          clearOldConflicts: true,
          detectionMethod: "manual",
          detectionSource: "user_request",
        },
      );

      toast.success(`Detected ${data.summary.totalConflicts} conflicts`);
      fetchConflicts();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setDetecting(false);
    }
  };

  const handleAutoResolve = async () => {
    if (!selectedTimetable) {
      toast.error("Please select a timetable first");
      return;
    }

    setAutoResolving(true);
    try {
      const { data } = await api.post(
        `/conflicts/auto-resolve/${selectedTimetable}`,
        {
          conflictTypes: ["room_occupancy", "resource_unavailable"],
        },
      );

      toast.success(`Auto-resolved ${data.resolved} conflicts`);
      fetchConflicts();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setAutoResolving(false);
    }
  };

  const handleUpdateStatus = async (conflictId, status, notes = "") => {
    try {
      await api.put(`/conflicts/${conflictId}/status`, {
        status,
        resolutionNotes: notes,
      });

      toast.success(`Conflict marked as ${status}`);
      fetchConflicts();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleBulkUpdate = async (status) => {
    const conflictIds = conflicts
      .filter((c) => c.status === "detected")
      .map((c) => c._id);

    if (conflictIds.length === 0) {
      toast.error("No conflicts selected for bulk update");
      return;
    }

    if (!window.confirm(`Mark ${conflictIds.length} conflicts as ${status}?`))
      return;

    try {
      await api.put("/conflicts/bulk-update", {
        conflictIds,
        status,
        resolutionNotes: `Bulk ${status} by user`,
      });

      toast.success(`Updated ${conflictIds.length} conflicts`);
      fetchConflicts();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleApplyResolution = async (conflictId, suggestionIndex) => {
    try {
      const { data } = await api.post(
        `/conflicts/${conflictId}/apply-resolution`,
        {
          suggestionIndex,
        },
      );

      toast.success("Resolution applied successfully");
      setShowResolutionModal(false);
      setSelectedConflict(null);
      setSelectedResolution(null);
      fetchConflicts();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleViewConflict = async (conflict) => {
    try {
      const { data } = await api.get(`/conflicts/${conflict._id}`);
      setSelectedConflict(data.data);
    } catch (error) {
      toast.error("Failed to fetch conflict details");
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

  const getConflictTypeInfo = (type) => {
    return (
      conflictTypes[type] || {
        label: type.replace(/_/g, " "),
        icon: <FaExclamationTriangle />,
        color: "bg-gray-100 text-gray-800",
        severity: "medium",
      }
    );
  };

  const getSeverityBadge = (severity) => {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${severityColors[severity] || "bg-gray-500"} text-white`}>
        <div className="w-2 h-2 rounded-full bg-white"></div>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      detected: { color: "bg-red-100 text-red-800", label: "Detected" },
      reviewed: { color: "bg-yellow-100 text-yellow-800", label: "Reviewed" },
      resolved: { color: "bg-green-100 text-green-800", label: "Resolved" },
      ignored: { color: "bg-gray-100 text-gray-800", label: "Ignored" },
      auto_resolved: {
        color: "bg-blue-100 text-blue-800",
        label: "Auto-Resolved",
      },
    };

    const config = statusConfig[status] || statusConfig.detected;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FaExclamationTriangle className="text-red-600" /> Conflict
              Detection Engine
            </h1>
            <p className="text-gray-600 mt-1">
              Advanced conflict detection and resolution system for timetables
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchStats}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
              <FaSync /> Refresh Stats
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Conflicts</div>
                <div className="text-3xl font-bold text-gray-800">
                  {stats.total || 0}
                </div>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Across all timetables
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Critical Issues</div>
                <div className="text-3xl font-bold text-red-600">
                  {stats.bySeverity?.critical || 0}
                </div>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Requires immediate attention
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Resolved</div>
                <div className="text-3xl font-bold text-green-600">
                  {stats.byStatus?.resolved || 0}
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Successfully resolved conflicts
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Auto-Resolved</div>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.byStatus?.auto_resolved || 0}
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaMagic className="text-blue-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Automatically fixed by system
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaCogs /> Detection Controls
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Select Timetable
                  </label>
                  <select
                    value={selectedTimetable}
                    onChange={(e) => setSelectedTimetable(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                    <option value="">All Timetables (Critical Only)</option>
                    {timetables.map((timetable) => (
                      <option key={timetable._id} value={timetable._id}>
                        {timetable.name} - {timetable.program?.code} - Sem{" "}
                        {timetable.semester}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end gap-3">
                  <button
                    onClick={handleDetectConflicts}
                    disabled={detecting || !selectedTimetable}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {detecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Detecting...
                      </>
                    ) : (
                      <>
                        <FaSearch /> Detect Conflicts
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleAutoResolve}
                    disabled={autoResolving || !selectedTimetable}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {autoResolving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Resolving...
                      </>
                    ) : (
                      <>
                        <FaMagic /> Auto-Resolve
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-l border-gray-200 pl-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaBolt /> Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleBulkUpdate("reviewed")}
                  className="w-full text-left px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm">
                  Mark All as Reviewed
                </button>
                <button
                  onClick={() => handleBulkUpdate("ignored")}
                  className="w-full text-left px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  Ignore All Minor Issues
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `/admin/timetables${selectedTimetable ? `?id=${selectedTimetable}` : ""}`,
                      "_blank",
                    )
                  }
                  className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                  Open Timetable Editor
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <FaFilter className="text-gray-400" />
            <h3 className="font-semibold text-gray-700">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <option value="detected">Detected</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="ignored">Ignored</option>
                <option value="auto_resolved">Auto-Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Conflict Type
              </label>
              <select
                name="conflictType"
                value={filters.conflictType}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">All Types</option>
                {Object.entries(conflictTypes).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Severity
              </label>
              <select
                name="severity"
                value={filters.severity}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="warning">Warning</option>
              </select>
            </div>

            <div>
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
                  placeholder="Search conflicts..."
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Conflicts List */}
          <div className={`lg:col-span-${selectedConflict ? "2" : "3"}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading conflicts...</p>
                </div>
              ) : conflicts.length === 0 ? (
                <div className="p-8 text-center">
                  <FaCheckCircle className="text-6xl text-green-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Conflicts Found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {selectedTimetable
                      ? "No conflicts detected in this timetable. Great job!"
                      : "Select a timetable to detect conflicts"}
                  </p>
                  {selectedTimetable && (
                    <button
                      onClick={handleDetectConflicts}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Run Conflict Detection
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Conflict
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Timetable
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Severity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Detected
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {conflicts.map((conflict) => {
                          const typeInfo = getConflictTypeInfo(
                            conflict.conflictType,
                          );

                          return (
                            <motion.tr
                              key={conflict._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={`hover:bg-gray-50 transition-colors ${conflict.severity === "critical" ? "bg-red-50" : ""}`}>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div
                                    className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${typeInfo.color}`}>
                                    {typeInfo.icon}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {typeInfo.label}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {conflict.description}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {conflict.timetable?.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {conflict.timetable?.program?.code} • Sem{" "}
                                  {conflict.timetable?.semester}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {getSeverityBadge(conflict.severity)}
                              </td>
                              <td className="px-6 py-4">
                                {getStatusBadge(conflict.status)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {new Date(
                                    conflict.createdAt,
                                  ).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatTime(conflict.createdAt)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex flex-col gap-2">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleViewConflict(conflict)
                                      }
                                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                                      title="View Details">
                                      <FaEye /> Details
                                    </button>

                                    {conflict.status === "detected" && (
                                      <>
                                        <button
                                          onClick={() =>
                                            handleUpdateStatus(
                                              conflict._id,
                                              "reviewed",
                                            )
                                          }
                                          className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1 text-xs"
                                          title="Mark as Reviewed">
                                          <FaEye /> Review
                                        </button>

                                        {conflict.suggestedResolutions?.length >
                                          0 && (
                                          <button
                                            onClick={() => {
                                              setSelectedConflict(conflict);
                                              setSelectedResolution(
                                                conflict
                                                  .suggestedResolutions[0],
                                              );
                                              setShowResolutionModal(true);
                                            }}
                                            className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs"
                                            title="Apply Resolution">
                                            <FaMagic /> Fix
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  {conflict.status === "detected" && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          handleUpdateStatus(
                                            conflict._id,
                                            "resolved",
                                            "Manually resolved",
                                          )
                                        }
                                        className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs"
                                        title="Mark as Resolved">
                                        <FaCheckCircle /> Resolve
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleUpdateStatus(
                                            conflict._id,
                                            "ignored",
                                            "Ignored by user",
                                          )
                                        }
                                        className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-xs"
                                        title="Ignore">
                                        <FaTimesCircle /> Ignore
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Conflict Details Sidebar */}
          {selectedConflict && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Conflict Details
                    </h3>
                    <button
                      onClick={() => setSelectedConflict(null)}
                      className="text-gray-400 hover:text-gray-600">
                      <FaTimesCircle />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Basic Info */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-700">Information</h4>
                      <div className="flex gap-2">
                        {getSeverityBadge(selectedConflict.severity)}
                        {getStatusBadge(selectedConflict.status)}
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-gray-600">Type</div>
                        <div className="font-medium">
                          {
                            getConflictTypeInfo(selectedConflict.conflictType)
                              .label
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Description</div>
                        <div className="font-medium">
                          {selectedConflict.description}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Detailed Message</div>
                        <div className="text-gray-700">
                          {selectedConflict.detailedMessage}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Timetable</div>
                        <div className="font-medium">
                          {selectedConflict.timetable?.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Detected</div>
                        <div className="font-medium">
                          {new Date(
                            selectedConflict.createdAt,
                          ).toLocaleString()}
                        </div>
                      </div>
                      {selectedConflict.resolvedAt && (
                        <div>
                          <div className="text-gray-600">Resolved</div>
                          <div className="font-medium">
                            {new Date(
                              selectedConflict.resolvedAt,
                            ).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Affected Entries */}
                  {selectedConflict.scheduleEntries &&
                    selectedConflict.scheduleEntries.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3">
                          Affected Schedule Entries
                        </h4>
                        <div className="space-y-3">
                          {selectedConflict.scheduleEntries.map(
                            (entry, index) => (
                              <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-3">
                                <div className="text-sm font-medium">
                                  {entry.courseAllocation?.course?.code ||
                                    "Unknown Course"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {entry.day} • {entry.timeSlot?.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Teacher:{" "}
                                  {entry.courseAllocation?.teacher?.name}
                                </div>
                                {entry.room && (
                                  <div className="text-xs text-gray-500">
                                    Room: {entry.room?.code}
                                  </div>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Suggested Resolutions */}
                  {selectedConflict.suggestedResolutions &&
                    selectedConflict.suggestedResolutions.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3">
                          Suggested Resolutions
                        </h4>
                        <div className="space-y-3">
                          {selectedConflict.suggestedResolutions.map(
                            (resolution, index) => (
                              <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                                onClick={() => {
                                  setSelectedResolution(resolution);
                                  setShowResolutionModal(true);
                                }}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="text-sm font-medium">
                                      {resolution.description}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Feasibility: {resolution.feasibility}% •
                                      Impact: {resolution.impact}
                                    </div>
                                  </div>
                                  <div className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-800">
                                    {resolution.priority}
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Actions */}
                  <div className="space-y-3">
                    {selectedConflict.status === "detected" && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateStatus(selectedConflict._id, "reviewed")
                          }
                          className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                          Mark as Reviewed
                        </button>

                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              selectedConflict._id,
                              "resolved",
                              "Manually resolved",
                            )
                          }
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                          Mark as Resolved
                        </button>

                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              selectedConflict._id,
                              "ignored",
                              "Ignored by user",
                            )
                          }
                          className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          Ignore Conflict
                        </button>
                      </>
                    )}

                    <button
                      onClick={() =>
                        window.open(
                          `/admin/timetables?id=${selectedConflict.timetable?._id}`,
                          "_blank",
                        )
                      }
                      className="w-full border border-blue-300 text-blue-700 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                      Open Timetable
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resolution Modal */}
        <AnimatePresence>
          {showResolutionModal && selectedResolution && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-2xl w-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FaMagic /> Apply Resolution
                  </h2>
                  <button
                    onClick={() => {
                      setShowResolutionModal(false);
                      setSelectedResolution(null);
                    }}
                    className="text-gray-400 hover:text-gray-600">
                    <FaTimesCircle size={24} />
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Resolution Details
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="font-medium mb-2">
                      {selectedResolution.description}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between mb-1">
                        <span>Feasibility:</span>
                        <span className="font-medium">
                          {selectedResolution.feasibility}%
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Impact:</span>
                        <span className="font-medium">
                          {selectedResolution.impact}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority:</span>
                        <span className="font-medium">
                          {selectedResolution.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedResolution.details && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Implementation Details
                    </h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      {selectedResolution.type === "time_change" && (
                        <>
                          <div>
                            Current Time Slot:{" "}
                            {selectedResolution.details.currentTimeSlot}
                          </div>
                          <div>
                            Available Time Slots:{" "}
                            {selectedResolution.details.availableTimeSlots
                              ?.length || 0}
                          </div>
                        </>
                      )}
                      {selectedResolution.type === "room_change" && (
                        <>
                          <div>
                            Current Room:{" "}
                            {selectedResolution.details.currentRoom}
                          </div>
                          <div>
                            Available Rooms:{" "}
                            {selectedResolution.details.availableRooms
                              ?.length || 0}
                          </div>
                        </>
                      )}
                      {selectedResolution.type === "day_change" && (
                        <>
                          <div>
                            Current Day: {selectedResolution.details.currentDay}
                          </div>
                          <div>
                            Available Days:{" "}
                            {selectedResolution.details.availableDays?.join(
                              ", ",
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowResolutionModal(false);
                      setSelectedResolution(null);
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (selectedConflict) {
                        const suggestionIndex =
                          selectedConflict.suggestedResolutions?.findIndex(
                            (r) =>
                              r.description === selectedResolution.description,
                          );
                        if (suggestionIndex !== -1) {
                          handleApplyResolution(
                            selectedConflict._id,
                            suggestionIndex,
                          );
                        }
                      }
                    }}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                    Apply Resolution
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConflictDetection;
