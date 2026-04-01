import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaCalendarDay,
  FaToggleOn,
  FaToggleOff,
  FaSync,
  FaExclamationTriangle,
  FaCalendarWeek,
} from "react-icons/fa";

const TimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [weeklyTemplate, setWeeklyTemplate] = useState({});
  const [showWeeklyView, setShowWeeklyView] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    activeOnly: true,
    slotType: "",
    day: "",
    category: "",
    search: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    slotNumber: "",
    name: "",
    startTime: "",
    endTime: "",
    slotType: "theory",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    priority: 5,
    notes: "",
    isActive: true,
  });

  // Days of the week
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Slot types
  const slotTypes = [
    { value: "theory", label: "Theory", color: "bg-blue-100 text-blue-800" },
    { value: "lab", label: "Lab", color: "bg-green-100 text-green-800" },
    { value: "break", label: "Break", color: "bg-yellow-100 text-yellow-800" },
    {
      value: "prayer",
      label: "Prayer",
      color: "bg-purple-100 text-purple-800",
    },
    { value: "other", label: "Other", color: "bg-gray-100 text-gray-800" },
  ];

  useEffect(() => {
    fetchTimeSlots();
    if (showWeeklyView) {
      fetchWeeklyTemplate();
    }
  }, [filters, showWeeklyView]);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        activeOnly: filters.activeOnly.toString(),
      }).toString();

      const { data } = await api.get(`/time-slots?${params}`);
      setTimeSlots(data.data);
    } catch (error) {
      toast.error("Failed to fetch time slots");
      console.error("Error:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyTemplate = async () => {
    try {
      const { data } = await api.get("/time-slots/weekly-template");
      setWeeklyTemplate(data.data);
    } catch (error) {
      console.error("Error fetching weekly template:", error);
    }
  };

  const checkTimeConflict = async (slotData, excludeId = null) => {
    try {
      const { data } = await api.post("/time-slots/check-conflict", {
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        availableDays: slotData.availableDays,
        excludeSlotId: excludeId,
      });

      return data;
    } catch (error) {
      console.error("Error checking conflict:", error);
      return { hasConflict: false, conflicts: [] };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check for time conflict
      const conflictCheck = await checkTimeConflict(formData, editingSlot?._id);

      if (conflictCheck.hasConflict) {
        const conflictList = conflictCheck.conflicts
          .map(
            (c) =>
              `${c.name} (${c.timeRange}) on ${c.availableDays.join(", ")}`,
          )
          .join("\n");

        if (
          !window.confirm(
            `Time slot conflicts with existing slots:\n\n${conflictList}\n\nDo you want to continue anyway?`,
          )
        ) {
          setLoading(false);
          return;
        }
      }

      if (editingSlot) {
        // Update slot
        await api.put(`/time-slots/${editingSlot._id}`, formData);
        toast.success("Time slot updated successfully!");
      } else {
        // Create new slot
        await api.post("/time-slots", formData);
        toast.success("Time slot created successfully!");
      }

      setShowForm(false);
      resetForm();
      fetchTimeSlots();
      if (showWeeklyView) fetchWeeklyTemplate();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      slotNumber: slot.slotNumber,
      name: slot.name,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotType: slot.slotType,
      availableDays: slot.availableDays,
      priority: slot.priority,
      notes: slot.notes || "",
      isActive: slot.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this time slot?"))
      return;

    try {
      await api.delete(`/time-slots/${id}`);
      toast.success("Time slot deactivated successfully!");
      fetchTimeSlots();
      if (showWeeklyView) fetchWeeklyTemplate();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.put(`/time-slots/${id}/activate`);
      toast.success("Time slot activated successfully!");
      fetchTimeSlots();
      if (showWeeklyView) fetchWeeklyTemplate();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const initializeDefaults = async () => {
    if (
      !window.confirm(
        "This will replace all existing time slots with default values. Continue?",
      )
    )
      return;

    try {
      await api.post("/time-slots/initialize-defaults");
      toast.success("Default time slots initialized!");
      fetchTimeSlots();
      if (showWeeklyView) fetchWeeklyTemplate();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      slotNumber: "",
      name: "",
      startTime: "",
      endTime: "",
      slotType: "theory",
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      priority: 5,
      notes: "",
      isActive: true,
    });
    setEditingSlot(null);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "availableDays") {
      const updatedDays = formData.availableDays.includes(value)
        ? formData.availableDays.filter((day) => day !== value)
        : [...formData.availableDays, value];

      setFormData((prev) => ({ ...prev, availableDays: updatedDays }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleTimeChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate name if both times are set
    if (field === "startTime" && formData.endTime && value) {
      setFormData((prev) => ({
        ...prev,
        name: `${value}-${prev.endTime}`,
      }));
    } else if (field === "endTime" && formData.startTime && value) {
      setFormData((prev) => ({
        ...prev,
        name: `${prev.startTime}-${value}`,
      }));
    }
  };

  const getSlotTypeBadge = (type) => {
    const slotType = slotTypes.find((st) => st.value === type);
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold ${slotType?.color || "bg-gray-100 text-gray-800"}`}>
        {slotType?.label || type}
      </span>
    );
  };

  const getStatusBadge = (isActive) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-bold ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;

    return endTotal - startTotal;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FaClock /> Time Slot Management
            </h1>
            <p className="text-gray-600 mt-1">
              Define fixed time slots for timetable scheduling (08:30-09:30,
              09:30-10:30, etc.)
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowWeeklyView(!showWeeklyView)}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
              <FaCalendarWeek /> {showWeeklyView ? "List View" : "Weekly View"}
            </button>
            <button
              onClick={initializeDefaults}
              className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2">
              <FaSync /> Initialize Defaults
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
              <FaPlus /> Create Slot
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <FaFilter className="text-gray-400" />
            <h3 className="font-semibold text-gray-700">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activeOnly"
                name="activeOnly"
                checked={filters.activeOnly}
                onChange={handleFilterChange}
                className="w-5 h-5"
              />
              <label
                htmlFor="activeOnly"
                className="text-sm font-medium text-gray-600">
                Show Active Only
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Slot Type
              </label>
              <select
                name="slotType"
                value={filters.slotType}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">All Types</option>
                {slotTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Day
              </label>
              <select
                name="day"
                value={filters.day}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">All Days</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">All Categories</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
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
                  placeholder="Search by slot name or time..."
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({
                    activeOnly: true,
                    slotType: "",
                    day: "",
                    category: "",
                    search: "",
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Create/Edit Slot Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full my-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaClock />
                  {editingSlot ? "Edit Time Slot" : "Create New Time Slot"}
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
                  {/* Slot Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Slot Number *
                    </label>
                    <input
                      type="number"
                      name="slotNumber"
                      value={formData.slotNumber}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min="1"
                      max="12"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Unique sequence number (1-12)
                    </p>
                  </div>

                  {/* Slot Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Slot Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., 08:30-09:30"
                      required
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        handleTimeChange("startTime", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        handleTimeChange("endTime", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  {/* Duration Display */}
                  <div className="md:col-span-2">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-semibold text-blue-800">
                            Time Range
                          </div>
                          <div className="text-lg font-bold text-blue-900">
                            {formData.startTime && formData.endTime
                              ? `${formData.startTime} - ${formData.endTime}`
                              : "Set times to see range"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-blue-800">
                            Duration
                          </div>
                          <div className="text-lg font-bold text-blue-900">
                            {formData.startTime && formData.endTime
                              ? `${calculateDuration(formData.startTime, formData.endTime)} minutes`
                              : "--"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slot Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Slot Type *
                    </label>
                    <select
                      name="slotType"
                      value={formData.slotType}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required>
                      {slotTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                        <option key={p} value={p}>
                          {p} {p === 5 && "(Default)"}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Higher number = higher priority in scheduling
                    </p>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      className="w-5 h-5"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-semibold text-gray-600">
                      Active Slot
                    </label>
                  </div>
                </div>

                {/* Available Days */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Available Days *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {daysOfWeek.map((day) => (
                      <label
                        key={day}
                        className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value={day}
                          checked={formData.availableDays.includes(day)}
                          onChange={handleFormChange}
                          name="availableDays"
                          className="w-5 h-5"
                        />
                        <span
                          className={`px-3 py-2 rounded-lg ${
                            formData.availableDays.includes(day)
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                          {day}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select days when this time slot is available for scheduling
                  </p>
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
                    placeholder="Special instructions or notes about this time slot..."
                  />
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
                      : editingSlot
                        ? "Update Slot"
                        : "Create Slot"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Weekly View */}
        {showWeeklyView ? (
          <div className="space-y-6">
            {/* Weekly Schedule Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaCalendarWeek /> Weekly Time Slot Schedule
                </h3>
                <p className="text-gray-600 mt-1">
                  Active time slots organized by day
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Time Slot
                      </th>
                      {daysOfWeek.slice(0, 5).map((day) => (
                        <th
                          key={day}
                          className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(
                      (slotNum) => {
                        const slot = timeSlots.find(
                          (s) => s.slotNumber === slotNum,
                        );

                        return (
                          <tr key={slotNum} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                Slot {slotNum}
                              </div>
                              <div className="text-sm text-gray-500">
                                {slot ? slot.timeRange : "No slot"}
                              </div>
                            </td>

                            {daysOfWeek.slice(0, 5).map((day) => {
                              const daySlot =
                                slot && slot.availableDays.includes(day)
                                  ? slot
                                  : null;

                              return (
                                <td key={day} className="px-6 py-4">
                                  {daySlot ? (
                                    <div className="inline-block">
                                      <div
                                        className={`p-3 rounded-lg border ${
                                          daySlot.slotType === "theory"
                                            ? "border-blue-200 bg-blue-50"
                                            : daySlot.slotType === "lab"
                                              ? "border-green-200 bg-green-50"
                                              : daySlot.slotType === "break"
                                                ? "border-yellow-200 bg-yellow-50"
                                                : "border-gray-200 bg-gray-50"
                                        }`}>
                                        <div className="font-medium">
                                          {daySlot.name}
                                        </div>
                                        <div className="text-sm">
                                          {daySlot.timeRange}
                                        </div>
                                        <div className="text-xs mt-1">
                                          {getSlotTypeBadge(daySlot.slotType)}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-gray-400 text-sm italic">
                                      No slot
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-700 mb-4">
                Slot Type Legend
              </h4>
              <div className="flex flex-wrap gap-4">
                {slotTypes.map((type) => (
                  <div key={type.value} className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded ${type.color.split(" ")[0]}`}></div>
                    <span className="text-sm text-gray-600">{type.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading time slots...</p>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="p-8 text-center">
                <FaClock className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Time Slots Found
                </h3>
                <p className="text-gray-500 mb-6">
                  {Object.values(filters).some((f) => f && f !== true)
                    ? "Try adjusting your filters"
                    : "Create your first time slot or initialize default slots"}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={initializeDefaults}
                    className="px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                    Initialize Default Slots
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Create First Slot
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Slot
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Time Range
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Days
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
                      {timeSlots.map((slot) => (
                        <tr
                          key={slot._id}
                          className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="font-bold text-blue-700">
                                  {slot.slotNumber}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {slot.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Priority: {slot.priority}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <div className="text-sm text-gray-500">
                              {slot.category}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {slot.durationMinutes} min
                            </div>
                            <div className="text-sm text-gray-500">
                              ({slot.durationHours} hours)
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getSlotTypeBadge(slot.slotType)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {slot.availableDays.map((day) => (
                                <span
                                  key={day}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {day.slice(0, 3)}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(slot.isActive)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(slot)}
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                title="Edit">
                                <FaEdit /> Edit
                              </button>

                              {slot.isActive ? (
                                <button
                                  onClick={() => handleDelete(slot._id)}
                                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                  title="Deactivate">
                                  <FaToggleOff /> Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivate(slot._id)}
                                  className="text-green-600 hover:text-green-800 flex items-center gap-1"
                                  title="Activate">
                                  <FaToggleOn /> Activate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Statistics */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-semibold">{timeSlots.length}</span>{" "}
                      time slots
                    </div>
                    <div className="text-sm text-gray-600">
                      Total active slots:{" "}
                      {timeSlots.filter((s) => s.isActive).length}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-blue-600 text-xl mt-1" />
            <div>
              <h4 className="font-bold text-blue-800 mb-2">Important Notes:</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Time slots must not overlap on the same days</li>
                <li>• Slot numbers must be unique (1-12)</li>
                <li>
                  • Default slots: 08:30-09:30, 09:30-10:30, etc. with lunch
                  break at 12:30-01:30
                </li>
                <li>• Lab slots typically scheduled in afternoon/evening</li>
                <li>
                  • Priority affects scheduling algorithm (higher = scheduled
                  first)
                </li>
                <li>• Inactive slots won't be available for new schedules</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSlots;
