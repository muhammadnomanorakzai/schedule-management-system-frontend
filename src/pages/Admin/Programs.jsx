import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaGraduationCap,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaBuilding,
  FaCalendarAlt,
  FaUsers,
  FaMoneyBillWave,
} from "react-icons/fa";

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    department: "",
    duration: 4,
    totalSemesters: 8,
    degreeType: "Undergraduate",
    description: "",
    yearlyIntake: 100,
    feesPerSemester: 0,
  });

  // Degree type options
  const degreeTypes = [
    "Undergraduate",
    "Graduate",
    "Postgraduate",
    "Diploma",
    "Certificate",
  ];

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data } = await api.get("/programs");
      setPrograms(data);
    } catch (error) {
      toast.error("Failed to fetch programs");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingProgram) {
        // Update existing program
        await api.put(`/programs/${editingProgram._id}`, formData);
        toast.success("Program updated successfully!");
        setEditingProgram(null);
      } else {
        // Create new program
        await api.post("/programs", formData);
        toast.success("Program created successfully!");
      }

      setShowForm(false);
      setFormData({
        name: "",
        code: "",
        department: "",
        duration: 4,
        totalSemesters: 8,
        degreeType: "Undergraduate",
        description: "",
        yearlyIntake: 100,
        feesPerSemester: 0,
      });
      fetchPrograms();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      code: program.code,
      department: program.department._id,
      duration: program.duration,
      totalSemesters: program.totalSemesters,
      degreeType: program.degreeType,
      description: program.description || "",
      yearlyIntake: program.yearlyIntake,
      feesPerSemester: program.feesPerSemester,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this program?"))
      return;

    try {
      await api.delete(`/programs/${id}`);
      toast.success("Program deleted successfully!");
      fetchPrograms();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/programs/${id}/toggle-status`);
      toast.success(`Program ${!currentStatus ? "activated" : "deactivated"}!`);
      fetchPrograms();
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
              Program Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage academic programs and their details
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProgram(null);
              setFormData({
                name: "",
                code: "",
                department: "",
                duration: 4,
                totalSemesters: 8,
                degreeType: "Undergraduate",
                description: "",
                yearlyIntake: 100,
                feesPerSemester: 0,
              });
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
            <FaPlus /> Add Program
          </button>
        </div>

        {/* Create/Edit Program Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingProgram ? "Edit Program" : "Create New Program"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingProgram(null);
                  }}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTrash size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Program Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., Bachelor of Computer Science"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Program Code *
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
                      placeholder="e.g., BSCS"
                      maxLength={10}
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
                        setFormData({ ...formData, department: e.target.value })
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
                      Degree Type *
                    </label>
                    <select
                      value={formData.degreeType}
                      onChange={(e) =>
                        setFormData({ ...formData, degreeType: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                      {degreeTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Duration (Years) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value) || 4,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Total Semesters *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.totalSemesters}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalSemesters: parseInt(e.target.value) || 8,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Yearly Intake
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.yearlyIntake}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearlyIntake: parseInt(e.target.value) || 100,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Fees per Semester ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={formData.feesPerSemester}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          feesPerSemester: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                    placeholder="Program description and objectives..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProgram(null);
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
                      : editingProgram
                        ? "Update Program"
                        : "Create Program"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Programs Grid/Table */}
        {programs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FaGraduationCap className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Programs Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first academic program
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Create First Program
            </button>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Programs</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {programs.length}
                    </p>
                  </div>
                  <FaGraduationCap className="text-blue-500 text-2xl" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Programs</p>
                    <p className="text-2xl font-bold text-green-600">
                      {programs.filter((p) => p.isActive).length}
                    </p>
                  </div>
                  <FaToggleOn className="text-green-500 text-2xl" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Departments</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {
                        [...new Set(programs.map((p) => p.department?._id))]
                          .length
                      }
                    </p>
                  </div>
                  <FaBuilding className="text-purple-500 text-2xl" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg Duration</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {(
                        programs.reduce((sum, p) => sum + p.duration, 0) /
                        programs.length
                      ).toFixed(1)}{" "}
                      years
                    </p>
                  </div>
                  <FaCalendarAlt className="text-orange-500 text-2xl" />
                </div>
              </div>
            </div>

            {/* Programs Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Program Details
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Duration
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
                    {programs.map((program) => (
                      <tr
                        key={program._id}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                              <FaGraduationCap className="text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">
                                {program.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-500">
                                  Code: {program.code}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                  {program.degreeType}
                                </span>
                              </div>
                              {program.description && (
                                <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                                  {program.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {program.department ? (
                            <div className="flex items-center">
                              <FaBuilding className="text-gray-400 mr-2" />
                              <div>
                                <span className="block text-sm font-medium text-gray-700">
                                  {program.department.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {program.department.code}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No department
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {program.duration} years
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaUsers className="text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {program.totalSemesters} semesters
                              </span>
                            </div>
                            {program.feesPerSemester > 0 && (
                              <div className="flex items-center gap-2">
                                <FaMoneyBillWave className="text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  ${program.feesPerSemester}/sem
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              program.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                            {program.isActive ? (
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
                              onClick={() => handleEdit(program)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit">
                              <FaEdit />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleStatus(
                                  program._id,
                                  program.isActive,
                                )
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                program.isActive
                                  ? "text-orange-600 hover:bg-orange-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              title={
                                program.isActive ? "Deactivate" : "Activate"
                              }>
                              {program.isActive ? (
                                <FaToggleOff />
                              ) : (
                                <FaToggleOn />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(program._id)}
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

export default Programs;
