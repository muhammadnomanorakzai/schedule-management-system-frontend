import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaListOl,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaCalendarAlt,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

const Semesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [selectedSession, setSelectedSession] = useState("");
  const [validSemesters, setValidSemesters] = useState([]);

  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    academicSession: sessionId || "",
    semesterNumber: "",
    name: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchAcademicSessions();
    if (sessionId) {
      setFormData((prev) => ({ ...prev, academicSession: sessionId }));
      fetchSemestersBySession(sessionId);
    } else {
      fetchAllSemesters();
    }
  }, [sessionId]);

  const fetchAllSemesters = async () => {
    try {
      const { data } = await api.get("/semesters");
      setSemesters(data);
    } catch (error) {
      toast.error("Failed to fetch semesters");
    }
  };

  const fetchSemestersBySession = async (sessionId) => {
    try {
      const { data } = await api.get(`/semesters/session/${sessionId}`);
      setSemesters(data);
    } catch (error) {
      toast.error("Failed to fetch semesters");
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

  const getValidSemesters = async (sessionType) => {
    try {
      const { data } = await api.get(`/semesters/valid/${sessionType}`);
      setValidSemesters(data.validSemesters);
    } catch (error) {
      console.error("Failed to fetch valid semesters:", error);
    }
  };

  const handleSessionChange = (e) => {
    const sessionId = e.target.value;
    setSelectedSession(sessionId);
    setFormData({ ...formData, academicSession: sessionId });

    // Find session type and get valid semesters
    const selectedSessionObj = academicSessions.find(
      (s) => s._id === sessionId,
    );
    if (selectedSessionObj) {
      getValidSemesters(selectedSessionObj.sessionType);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingSemester) {
        // Update existing semester
        await api.put(`/semesters/${editingSemester._id}`, formData);
        toast.success("Semester updated successfully!");
        setEditingSemester(null);
      } else {
        // Create new semester
        await api.post("/semesters", formData);
        toast.success("Semester created successfully!");
      }

      setShowForm(false);
      setFormData({
        academicSession: sessionId || "",
        semesterNumber: "",
        name: "",
        startDate: "",
        endDate: "",
      });

      if (sessionId) {
        fetchSemestersBySession(sessionId);
      } else {
        fetchAllSemesters();
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (semester) => {
    setEditingSemester(semester);
    setFormData({
      academicSession: semester.academicSession._id,
      semesterNumber: semester.semesterNumber,
      name: semester.name,
      startDate: semester.startDate.split("T")[0],
      endDate: semester.endDate.split("T")[0],
    });

    // Get valid semesters for this session
    getValidSemesters(semester.academicSession.sessionType);

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this semester?"))
      return;

    try {
      await api.delete(`/semesters/${id}`);
      toast.success("Semester deleted successfully!");
      if (sessionId) {
        fetchSemestersBySession(sessionId);
      } else {
        fetchAllSemesters();
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/semesters/${id}/toggle-status`);
      toast.success(
        `Semester ${!currentStatus ? "activated" : "deactivated"}!`,
      );
      if (sessionId) {
        fetchSemestersBySession(sessionId);
      } else {
        fetchAllSemesters();
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  // Get session by ID
  const getSessionById = (id) => {
    return academicSessions.find((s) => s._id === id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              {sessionId && (
                <button
                  onClick={() => navigate("/admin/academic-sessions")}
                  className="text-gray-600 hover:text-gray-800">
                  <FaArrowLeft />
                </button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {sessionId
                    ? `Semesters for ${getSessionById(sessionId)?.name || "Session"}`
                    : "All Semesters"}
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage semesters with strict session-semester mapping rules
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingSemester(null);
              setFormData({
                academicSession: sessionId || "",
                semesterNumber: "",
                name: "",
                startDate: "",
                endDate: "",
              });
              setValidSemesters([]);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            disabled={
              sessionId && !academicSessions.find((s) => s._id === sessionId)
            }>
            <FaPlus /> Add Semester
          </button>
        </div>

        {/* Create/Edit Semester Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingSemester ? "Edit Semester" : "Create New Semester"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingSemester(null);
                  }}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTrash size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={sessionId ? "hidden" : ""}>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Academic Session *
                    </label>
                    <select
                      value={formData.academicSession}
                      onChange={handleSessionChange}
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

                  {formData.academicSession && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                          Semester Number *
                        </label>
                        <select
                          value={formData.semesterNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              semesterNumber: parseInt(e.target.value),
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          required>
                          <option value="">Select Semester</option>
                          {validSemesters.map((num) => (
                            <option key={num} value={num}>
                              Semester {num}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                          Semester Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="e.g., Fall 2024 Semester 1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
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
                            setFormData({
                              ...formData,
                              endDate: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Validation Rules Display */}
                {formData.academicSession && validSemesters.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FaExclamationTriangle className="text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">
                          Validation Rules:
                        </p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>
                            • Selected session:{" "}
                            <strong>
                              {
                                getSessionById(formData.academicSession)
                                  ?.sessionType
                              }
                            </strong>
                          </li>
                          <li>
                            • Allowed semester numbers:{" "}
                            <strong>{validSemesters.join(", ")}</strong>
                          </li>
                          <li>• End date must be after start date</li>
                          <li>
                            • Each session can have only one of each semester
                            number
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingSemester(null);
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.academicSession}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {loading
                      ? "Saving..."
                      : editingSemester
                        ? "Update Semester"
                        : "Create Semester"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Semesters Table */}
        {semesters.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FaListOl className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Semesters Yet
            </h3>
            <p className="text-gray-500 mb-6">
              {sessionId
                ? "Create semesters for this academic session"
                : "Create your first semester to start academic planning"}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Create First Semester
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Semester Details
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Academic Session
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Dates
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
                  {semesters.map((semester) => {
                    const session = semester.academicSession;
                    const isPast = new Date(semester.endDate) < new Date();
                    const isCurrent =
                      new Date(semester.startDate) <= new Date() &&
                      new Date(semester.endDate) >= new Date();

                    return (
                      <tr
                        key={semester._id}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                semester.semesterNumber % 2 === 0
                                  ? "bg-green-100"
                                  : "bg-orange-100"
                              }`}>
                              <FaListOl
                                className={
                                  semester.semesterNumber % 2 === 0
                                    ? "text-green-600"
                                    : "text-orange-600"
                                }
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">
                                {semester.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-500">
                                  Semester {semester.semesterNumber}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    session?.sessionType === "Fall"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-green-100 text-green-800"
                                  }`}>
                                  {session?.sessionType}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {session ? (
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {session.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {session.year}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No session
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-gray-400 text-sm" />
                              <span className="text-sm text-gray-700">
                                {new Date(
                                  semester.startDate,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-gray-400 text-sm" />
                              <span className="text-sm text-gray-700">
                                {new Date(
                                  semester.endDate,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                semester.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                              {semester.isActive ? (
                                <>
                                  <FaCheckCircle className="mr-1" /> Active
                                </>
                              ) : (
                                "Inactive"
                              )}
                            </span>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs ${
                                isCurrent
                                  ? "bg-blue-100 text-blue-800"
                                  : isPast
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}>
                              {isCurrent
                                ? "Ongoing"
                                : isPast
                                  ? "Completed"
                                  : "Upcoming"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(semester)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit">
                              <FaEdit />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleStatus(
                                  semester._id,
                                  semester.isActive,
                                )
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                semester.isActive
                                  ? "text-orange-600 hover:bg-orange-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              title={
                                semester.isActive ? "Deactivate" : "Activate"
                              }>
                              {semester.isActive ? (
                                <FaToggleOff />
                              ) : (
                                <FaToggleOn />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(semester._id)}
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
        )}
      </div>
    </div>
  );
};

export default Semesters;
