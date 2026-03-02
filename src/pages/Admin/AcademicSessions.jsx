import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarCheck,
  FaCalendarTimes,
} from "react-icons/fa";

const AcademicSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    sessionType: "Fall",
    startDate: "",
    endDate: "",
    description: "",
  });

  // Get current year for default
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data } = await api.get("/academic-sessions");
      setSessions(data);
    } catch (error) {
      toast.error("Failed to fetch academic sessions");
      console.error("Error:", error.response?.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingSession) {
        // Update existing session
        await api.put(`/academic-sessions/${editingSession._id}`, formData);
        toast.success("Academic session updated successfully!");
        setEditingSession(null);
      } else {
        // Create new session
        await api.post("/academic-sessions", formData);
        toast.success("Academic session created successfully!");
      }

      setShowForm(false);
      setFormData({
        name: "",
        year: "",
        sessionType: "Fall",
        startDate: "",
        endDate: "",
        description: "",
      });
      fetchSessions();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      name: session.name,
      year: session.year,
      sessionType: session.sessionType,
      startDate: session.startDate.split("T")[0],
      endDate: session.endDate.split("T")[0],
      description: session.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this academic session?")
    )
      return;

    try {
      await api.delete(`/academic-sessions/${id}`);
      toast.success("Academic session deleted successfully!");
      fetchSessions();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleSetCurrent = async (id) => {
    try {
      await api.put(`/academic-sessions/${id}/set-current`);
      toast.success("Session set as current successfully!");
      fetchSessions();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleToggleRegistration = async (id, currentStatus) => {
    try {
      await api.put(`/academic-sessions/${id}/toggle-registration`);
      toast.success(`Registration ${!currentStatus ? "opened" : "closed"}!`);
      fetchSessions();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  // Calculate session duration in days
  const getDurationDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Academic Sessions
            </h1>
            <p className="text-gray-600 mt-1">
              Manage Fall and Spring academic sessions with strict semester
              mapping
            </p>
          </div>
          <button
            onClick={() => {
              setEditingSession(null);
              setFormData({
                name: "",
                year: `${currentYear}-${nextYear}`,
                sessionType: "Fall",
                startDate: "",
                endDate: "",
                description: "",
              });
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
            <FaPlus /> Create Session
          </button>
        </div>

        {/* Create/Edit Session Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingSession
                    ? "Edit Academic Session"
                    : "Create New Academic Session"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingSession(null);
                  }}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimesCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Session Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., Fall 2024-2025"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Academic Year *
                    </label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="YYYY-YYYY"
                      pattern="\d{4}-\d{4}"
                      title="Format: YYYY-YYYY"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: YYYY-YYYY
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Session Type *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="Fall"
                          checked={formData.sessionType === "Fall"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sessionType: e.target.value,
                            })
                          }
                          className="mr-2"
                        />
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          Fall Session (Semesters: 1, 3, 5, 7)
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="Spring"
                          checked={formData.sessionType === "Spring"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sessionType: e.target.value,
                            })
                          }
                          className="mr-2"
                        />
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          Spring Session (Semesters: 2, 4, 6, 8)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Important Note
                    </label>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                      {formData.sessionType === "Fall" ? (
                        <span>
                          ⚠️ Fall session can only have semesters:{" "}
                          <strong>1, 3, 5, 7</strong>
                        </span>
                      ) : (
                        <span>
                          ⚠️ Spring session can only have semesters:{" "}
                          <strong>2, 4, 6, 8</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
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
                    placeholder="Session description..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingSession(null);
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
                      : editingSession
                        ? "Update Session"
                        : "Create Session"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Sessions Cards */}
        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Academic Sessions Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first academic session to start scheduling
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Create First Session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => {
              const durationDays = getDurationDays(
                session.startDate,
                session.endDate,
              );
              const isPast = new Date(session.endDate) < new Date();
              const isFuture = new Date(session.startDate) > new Date();

              return (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
                    session.isCurrent
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-gray-100"
                  }`}>
                  {/* Session Header */}
                  <div
                    className={`px-6 py-4 ${
                      session.sessionType === "Fall"
                        ? "bg-gradient-to-r from-orange-500 to-orange-600"
                        : "bg-gradient-to-r from-green-500 to-green-600"
                    }`}>
                    <div className="flex justify-between items-center">
                      <div className="text-white">
                        <h3 className="text-xl font-bold">{session.name}</h3>
                        <p className="text-sm opacity-90">{session.year}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            session.sessionType === "Fall"
                              ? "bg-orange-700 text-white"
                              : "bg-green-700 text-white"
                          }`}>
                          {session.sessionType}
                        </span>
                        {session.isCurrent && (
                          <span className="mt-2 px-2 py-0.5 bg-white text-blue-600 text-xs font-bold rounded-full">
                            CURRENT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Duration
                          </span>
                        </div>
                        <span className="font-semibold">
                          {durationDays} days
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaCalendarCheck className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Start Date
                          </span>
                        </div>
                        <span className="font-semibold">
                          {new Date(session.startDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaCalendarTimes className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            End Date
                          </span>
                        </div>
                        <span className="font-semibold">
                          {new Date(session.endDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Registration
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              session.isRegistrationOpen
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                            {session.isRegistrationOpen ? "Open" : "Closed"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Status
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              isPast
                                ? "bg-gray-100 text-gray-800"
                                : isFuture
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                            }`}>
                            {isPast
                              ? "Completed"
                              : isFuture
                                ? "Upcoming"
                                : "Ongoing"}
                          </span>
                        </div>
                      </div>

                      {session.description && (
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            {session.description}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-gray-100 flex justify-between">
                        <button
                          onClick={() => handleEdit(session)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                          <FaEdit /> Edit
                        </button>

                        <div className="flex items-center gap-2">
                          {!session.isCurrent && (
                            <button
                              onClick={() => handleSetCurrent(session._id)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1">
                              <FaCheckCircle /> Set Current
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleToggleRegistration(
                                session._id,
                                session.isRegistrationOpen,
                              )
                            }
                            className={`text-sm font-medium flex items-center gap-1 ${
                              session.isRegistrationOpen
                                ? "text-orange-600 hover:text-orange-800"
                                : "text-green-600 hover:text-green-800"
                            }`}>
                            {session.isRegistrationOpen ? (
                              <FaToggleOff />
                            ) : (
                              <FaToggleOn />
                            )}
                            {session.isRegistrationOpen
                              ? "Close Reg"
                              : "Open Reg"}
                          </button>

                          <button
                            onClick={() => handleDelete(session._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1">
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Important Notice */}
        {sessions.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-blue-600 text-xl mt-1" />
              <div>
                <h4 className="font-bold text-blue-800 mb-2">
                  Important Rules:
                </h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>
                    • <strong>Fall Session</strong> can only have semesters:{" "}
                    <strong>1, 3, 5, 7</strong>
                  </li>
                  <li>
                    • <strong>Spring Session</strong> can only have semesters:{" "}
                    <strong>2, 4, 6, 8</strong>
                  </li>
                  <li>
                    • Only one session can be marked as{" "}
                    <strong>"Current"</strong> at a time
                  </li>
                  <li>
                    • Sessions must have unique names and year combinations
                  </li>
                  <li>• End date must be after start date</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicSessions;
