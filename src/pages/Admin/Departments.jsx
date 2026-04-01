// pages/Admin/Departments.jsx
import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaBuilding,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUserTie,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [teachers, setTeachers] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  // HOD assignment state
  const [assignHOD, setAssignHOD] = useState({
    show: false,
    deptId: null,
    teacherId: "",
  });

  useEffect(() => {
    fetchDepartments();
    fetchTeachers();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get("/departments");
      setDepartments(data.data);
    } catch (error) {
      toast.error("Failed to fetch departments");
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get("/teachers");
      setTeachers(data.filter((t) => t.role === "Teacher"));
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/departments", formData);
      toast.success("Department created successfully!");
      setShowForm(false);
      setFormData({ name: "", code: "", description: "" });
      fetchDepartments();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    try {
      await api.delete(`/departments/${id}`);
      toast.success("Department deleted successfully!");
      fetchDepartments();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleAssignHOD = async () => {
    try {
      await api.put(`/departments/${assignHOD.deptId}/assign-hod`, {
        teacherId: assignHOD.teacherId,
      });
      toast.success("HOD assigned successfully!");
      setAssignHOD({ show: false, deptId: null, teacherId: "" });
      fetchDepartments();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Department Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage academic departments and assign HODs
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
            <FaPlus /> Add Department
          </button>
        </div>

        {/* Create Department Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Create New Department
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Department Code *
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
                    placeholder="e.g., CS"
                    maxLength={10}
                    required
                  />
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
                    placeholder="Brief description of the department"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {loading ? "Creating..." : "Create Department"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Assign HOD Modal */}
        {assignHOD.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Assign Head of Department
                </h2>
                <button
                  onClick={() =>
                    setAssignHOD({ show: false, deptId: null, teacherId: "" })
                  }
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Select Teacher as HOD
                  </label>
                  <select
                    value={assignHOD.teacherId}
                    onChange={(e) =>
                      setAssignHOD({ ...assignHOD, teacherId: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                    <option value="">Select a teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name} ({teacher.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setAssignHOD({ show: false, deptId: null, teacherId: "" })
                    }
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignHOD}
                    disabled={!assignHOD.teacherId}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                    Assign HOD
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Departments Grid */}
        {departments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Departments Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first department to get started
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Create First Department
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <motion.div
                key={dept._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <FaBuilding className="text-blue-500" />
                        <h3 className="text-xl font-bold text-gray-800">
                          {dept.name}
                        </h3>
                      </div>
                      <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {dept.code}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setAssignHOD({
                            show: true,
                            deptId: dept._id,
                            teacherId: dept.hod?._id || "",
                          })
                        }
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Assign HOD">
                        <FaUserTie />
                      </button>
                      <button
                        onClick={() => handleDelete(dept._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6">
                    {dept.description || "No description provided"}
                  </p>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {dept.hod ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <FaUserTie className="text-green-600 text-sm" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-700">
                                {dept.hod.name}
                              </p>
                              <p className="text-xs text-gray-500">HOD</p>
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No HOD assigned
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${
                          dept.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {dept.isActive ? (
                          <span className="flex items-center gap-1">
                            <FaCheck /> Active
                          </span>
                        ) : (
                          "Inactive"
                        )}
                      </span>
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

export default Departments;
