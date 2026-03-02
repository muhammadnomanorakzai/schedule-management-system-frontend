import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaBuilding,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaUsers,
  FaVideo,
  FaSnowflake,
  FaChalkboardTeacher,
  FaFlask,
  FaFilter,
  FaChartBar,
  FaWrench,
  FaTools,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showEquipment, setShowEquipment] = useState(null);
  const [showMaintenance, setShowMaintenance] = useState(null);
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    roomTypes: [],
    capacityStats: {},
    departmentStats: [],
  });

  const [filters, setFilters] = useState({
    department: "",
    building: "",
    roomType: "",
    minCapacity: "",
    maxCapacity: "",
    isAvailable: "",
    hasProjector: "",
    isAirConditioned: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    roomNumber: "",
    name: "",
    building: "",
    floor: "",
    roomType: "Lecture",
    capacity: 30,
    department: "",
    equipment: [],
    facilities: [],
    isAirConditioned: false,
    hasProjector: false,
    hasWhiteboard: true,
    description: "",
  });

  // Maintenance form state
  const [maintenanceData, setMaintenanceData] = useState({
    nextMaintenance: "",
    notes: "",
  });

  // Equipment form state
  const [equipmentData, setEquipmentData] = useState([
    { name: "", quantity: 1, condition: "Good" },
  ]);

  // Room type options
  const roomTypes = [
    {
      value: "Lecture",
      label: "Lecture Hall",
      icon: FaChalkboardTeacher,
      color: "blue",
    },
    { value: "Lab", label: "Laboratory", icon: FaFlask, color: "green" },
    {
      value: "Conference",
      label: "Conference Room",
      icon: FaUsers,
      color: "purple",
    },
    {
      value: "Auditorium",
      label: "Auditorium",
      icon: FaBuilding,
      color: "red",
    },
    {
      value: "Seminar",
      label: "Seminar Room",
      icon: FaChalkboardTeacher,
      color: "orange",
    },
  ];

  // Facility options
  const facilityOptions = [
    "Wi-Fi",
    "Sound System",
    "Smart Board",
    "Computer Lab",
    "Chemistry Equipment",
    "Physics Equipment",
    "Biology Equipment",
    "Engineering Tools",
    "Art Supplies",
    "Music Instruments",
  ];

  // Condition options
  const conditionOptions = ["Good", "Fair", "Poor", "Needs Repair"];

  useEffect(() => {
    fetchRooms();
    fetchDepartments();
    fetchBuildings();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const fetchRooms = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const { data } = await api.get(`/rooms?${queryParams}`);
      setRooms(data);
    } catch (error) {
      toast.error("Failed to fetch rooms");
      console.error("Error:", error.response?.data);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/rooms/stats/overview");
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
  const fetchBuildings = async () => {
    try {
      const { data } = await api.get("/rooms/buildings/list");
      setBuildings(data);
    } catch (error) {
      console.error("Failed to fetch buildings:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingRoom) {
        // Update existing room
        await api.put(`/rooms/${editingRoom._id}`, formData);
        toast.success("Room updated successfully!");
        setEditingRoom(null);
      } else {
        // Create new room
        await api.post("/rooms", formData);
        toast.success("Room created successfully!");
      }

      setShowForm(false);
      resetForm();
      fetchRooms();
      fetchStats();
      fetchBuildings();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      name: room.name || "",
      building: room.building,
      floor: room.floor || "",
      roomType: room.roomType,
      capacity: room.capacity,
      department: room.department._id,
      equipment: room.equipment || [],
      facilities: room.facilities || [],
      isAirConditioned: room.isAirConditioned,
      hasProjector: room.hasProjector,
      hasWhiteboard: room.hasWhiteboard,
      description: room.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      await api.delete(`/rooms/${id}`);
      toast.success("Room deleted successfully!");
      fetchRooms();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await api.put(`/rooms/${id}/toggle-availability`);
      toast.success(
        `Room ${!currentStatus ? "made available" : "marked unavailable"}!`,
      );
      fetchRooms();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleScheduleMaintenance = async (roomId) => {
    try {
      await api.put(`/rooms/${roomId}/maintenance`, maintenanceData);
      toast.success("Maintenance scheduled successfully!");
      setShowMaintenance(null);
      setMaintenanceData({ nextMaintenance: "", notes: "" });
      fetchRooms();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleUpdateEquipment = async (roomId) => {
    try {
      await api.put(`/rooms/${roomId}/equipment`, { equipment: equipmentData });
      toast.success("Equipment updated successfully!");
      setShowEquipment(null);
      setEquipmentData([{ name: "", quantity: 1, condition: "Good" }]);
      fetchRooms();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      roomNumber: "",
      name: "",
      building: "",
      floor: "",
      roomType: "Lecture",
      capacity: 30,
      department: "",
      equipment: [],
      facilities: [],
      isAirConditioned: false,
      hasProjector: false,
      hasWhiteboard: true,
      description: "",
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchRooms();
  };

  const clearFilters = () => {
    setFilters({
      department: "",
      building: "",
      roomType: "",
      minCapacity: "",
      maxCapacity: "",
      isAvailable: "",
      hasProjector: "",
      isAirConditioned: "",
    });
  };

  const addEquipmentField = () => {
    setEquipmentData([
      ...equipmentData,
      { name: "", quantity: 1, condition: "Good" },
    ]);
  };

  const removeEquipmentField = (index) => {
    const newEquipment = [...equipmentData];
    newEquipment.splice(index, 1);
    setEquipmentData(newEquipment);
  };

  const updateEquipmentField = (index, field, value) => {
    const newEquipment = [...equipmentData];
    newEquipment[index][field] = value;
    setEquipmentData(newEquipment);
  };

  const getRoomTypeIcon = (type) => {
    const roomType = roomTypes.find((rt) => rt.value === type);
    return roomType ? React.createElement(roomType.icon) : <FaBuilding />;
  };

  const getRoomTypeColor = (type) => {
    const roomType = roomTypes.find((rt) => rt.value === type);
    switch (roomType?.color) {
      case "blue":
        return "bg-blue-100 text-blue-800";
      case "green":
        return "bg-green-100 text-green-800";
      case "purple":
        return "bg-purple-100 text-purple-800";
      case "red":
        return "bg-red-100 text-red-800";
      case "orange":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCapacityColor = (capacity) => {
    if (capacity >= 100) return "text-red-600";
    if (capacity >= 50) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Room & Lab Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage classrooms, labs, and facilities with capacity and type
              restrictions
            </p>
          </div>
          <button
            onClick={() => {
              setEditingRoom(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
            <FaPlus /> Add Room/Lab
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Rooms</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalRooms}
                </p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <FaBuilding className="text-2xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Available Rooms</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.availableRooms}
                </p>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <FaCheckCircle className="text-2xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Capacity</p>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round(stats.capacityStats.avgCapacity || 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <FaUsers className="text-2xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Max Capacity</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.capacityStats.maxCapacity || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                <FaChartBar className="text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Room Type Distribution */}
        {stats.roomTypes.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Room Type Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.roomTypes.map((type) => (
                <div key={type._id} className="text-center">
                  <div
                    className={`p-3 rounded-lg ${getRoomTypeColor(type._id)} inline-block mb-2`}>
                    {getRoomTypeIcon(type._id)}
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {type._id}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {type.count}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaFilter /> Filter Rooms
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800">
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                Building
              </label>
              <select
                name="building"
                value={filters.building}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Buildings</option>
                {buildings.map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type
              </label>
              <select
                name="roomType"
                value={filters.roomType}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Types</option>
                {roomTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Capacity
                </label>
                <input
                  type="number"
                  name="minCapacity"
                  value={filters.minCapacity}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Min"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Capacity
                </label>
                <input
                  type="number"
                  name="maxCapacity"
                  value={filters.maxCapacity}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Max"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="hasProjector"
                  checked={filters.hasProjector === "true"}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      hasProjector: e.target.checked ? "true" : "",
                    })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Has Projector</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isAirConditioned"
                  checked={filters.isAirConditioned === "true"}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      isAirConditioned: e.target.checked ? "true" : "",
                    })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">A/C</span>
              </label>
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

        {/* Create/Edit Room Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingRoom ? "Edit Room" : "Create New Room/Lab"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingRoom(null);
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
                      Room Number *
                    </label>
                    <input
                      type="text"
                      value={formData.roomNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          roomNumber: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., G-101"
                      maxLength={10}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Room Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., Main Lecture Hall"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Building *
                    </label>
                    <input
                      type="text"
                      value={formData.building}
                      onChange={(e) =>
                        setFormData({ ...formData, building: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., Science Block"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Floor
                    </label>
                    <input
                      type="text"
                      value={formData.floor}
                      onChange={(e) =>
                        setFormData({ ...formData, floor: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., Ground Floor, 1st Floor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Room Type *
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {roomTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, roomType: type.value })
                          }
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.roomType === type.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}>
                          <div className="flex flex-col items-center">
                            <type.icon
                              className={`text-lg ${
                                formData.roomType === type.value
                                  ? `text-${type.color}-600`
                                  : "text-gray-400"
                              }`}
                            />
                            <span className="text-xs mt-1 text-center">
                              {type.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: parseInt(e.target.value) || 30,
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
                </div>

                {/* Facilities */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Facilities Available
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {facilityOptions.map((facility) => (
                      <label
                        key={facility}
                        className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.facilities.includes(facility)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                facilities: [...formData.facilities, facility],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                facilities: formData.facilities.filter(
                                  (f) => f !== facility,
                                ),
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {facility}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.hasProjector}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hasProjector: e.target.checked,
                        })
                      }
                      className="mr-3"
                    />
                    <div>
                      <FaVideo className="text-blue-500 text-xl" />
                      <span className="block text-sm font-medium text-gray-700 mt-1">
                        Projector Available
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.isAirConditioned}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isAirConditioned: e.target.checked,
                        })
                      }
                      className="mr-3"
                    />
                    <div>
                      <FaSnowflake className="text-blue-500 text-xl" />
                      <span className="block text-sm font-medium text-gray-700 mt-1">
                        Air Conditioned
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.hasWhiteboard}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hasWhiteboard: e.target.checked,
                        })
                      }
                      className="mr-3"
                    />
                    <div>
                      <FaChalkboardTeacher className="text-blue-500 text-xl" />
                      <span className="block text-sm font-medium text-gray-700 mt-1">
                        Whiteboard/Blackboard
                      </span>
                    </div>
                  </label>
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
                    placeholder="Room description, special features, etc..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingRoom(null);
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
                      : editingRoom
                        ? "Update Room"
                        : "Create Room"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Equipment Modal */}
        {showEquipment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Manage Equipment
                </h2>
                <button
                  onClick={() => setShowEquipment(null)}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTrash size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {equipmentData.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateEquipmentField(index, "name", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                        placeholder="Equipment name"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateEquipmentField(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-1/3 border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Qty"
                        />
                        <select
                          value={item.condition}
                          onChange={(e) =>
                            updateEquipmentField(
                              index,
                              "condition",
                              e.target.value,
                            )
                          }
                          className="w-2/3 border border-gray-300 rounded-lg px-3 py-2">
                          {conditionOptions.map((condition) => (
                            <option key={condition} value={condition}>
                              {condition}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {equipmentData.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEquipmentField(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={addEquipmentField}
                  className="flex-1 border border-blue-500 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                  Add Equipment
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateEquipment(showEquipment)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Save Equipment
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Maintenance Modal */}
        {showMaintenance && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Schedule Maintenance
                </h2>
                <button
                  onClick={() => setShowMaintenance(null)}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTrash size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Next Maintenance Date *
                  </label>
                  <input
                    type="date"
                    value={maintenanceData.nextMaintenance}
                    onChange={(e) =>
                      setMaintenanceData({
                        ...maintenanceData,
                        nextMaintenance: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Maintenance Notes
                  </label>
                  <textarea
                    value={maintenanceData.notes}
                    onChange={(e) =>
                      setMaintenanceData({
                        ...maintenanceData,
                        notes: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    rows="3"
                    placeholder="Describe maintenance requirements..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowMaintenance(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleScheduleMaintenance(showMaintenance)}
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700">
                  Schedule Maintenance
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Rooms Found
            </h3>
            <p className="text-gray-500 mb-6">
              {Object.values(filters).some((f) => f)
                ? "No rooms match your filters. Try different filters."
                : "Create your first room/lab to start facility management"}
            </p>
            <button
              onClick={() => {
                setEditingRoom(null);
                resetForm();
                setShowForm(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Create First Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <motion.div
                key={room._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Room Header */}
                <div className={`px-6 py-4 ${getRoomTypeColor(room.roomType)}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">{room.roomNumber}</h3>
                      {room.name && (
                        <p className="text-sm opacity-90">{room.name}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        {getRoomTypeIcon(room.roomType)}
                        <span className="text-sm font-bold">
                          {room.roomType}
                        </span>
                      </div>
                      {!room.isAvailable && (
                        <span className="mt-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                          UNAVAILABLE
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Room Details */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaBuilding className="text-gray-400" />
                        <span className="text-sm text-gray-600">Building</span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        {room.building}
                        {room.floor && `, ${room.floor}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-gray-400" />
                        <span className="text-sm text-gray-600">Capacity</span>
                      </div>
                      <span
                        className={`font-bold ${getCapacityColor(room.capacity)}`}>
                        {room.capacity} students
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
                        {room.department?.name}
                      </span>
                    </div>

                    {/* Features */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 mb-3">
                        {room.hasProjector && (
                          <span className="flex items-center gap-1 text-sm text-blue-600">
                            <FaVideo /> Projector
                          </span>
                        )}
                        {room.isAirConditioned && (
                          <span className="flex items-center gap-1 text-sm text-blue-600">
                            <FaSnowflake /> A/C
                          </span>
                        )}
                        {room.hasWhiteboard && (
                          <span className="flex items-center gap-1 text-sm text-blue-600">
                            <FaChalkboardTeacher /> Whiteboard
                          </span>
                        )}
                      </div>

                      {room.facilities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {room.facilities.slice(0, 3).map((facility, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {facility}
                            </span>
                          ))}
                          {room.facilities.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              +{room.facilities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {room.equipment.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FaTools /> {room.equipment.length} equipment items
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-gray-100 flex justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setShowEquipment(room._id);
                            setEquipmentData(
                              room.equipment.length > 0
                                ? room.equipment
                                : [
                                    {
                                      name: "",
                                      quantity: 1,
                                      condition: "Good",
                                    },
                                  ],
                            );
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Manage Equipment">
                          <FaTools />
                        </button>
                        <button
                          onClick={() => {
                            setShowMaintenance(room._id);
                            setMaintenanceData({
                              nextMaintenance: "",
                              notes: "",
                            });
                          }}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Schedule Maintenance">
                          <FaWrench />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(room)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit">
                          <FaEdit />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleAvailability(room._id, room.isAvailable)
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            room.isAvailable
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={
                            room.isAvailable
                              ? "Mark Unavailable"
                              : "Mark Available"
                          }>
                          {room.isAvailable ? <FaToggleOff /> : <FaToggleOn />}
                        </button>
                        <button
                          onClick={() => handleDelete(room._id)}
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

        {/* Important Rules */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-blue-600 text-xl mt-1" />
            <div>
              <h4 className="font-bold text-blue-800 mb-2">Important Rules:</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>
                  • <strong>Lab courses</strong> can only be scheduled in{" "}
                  <strong>Lab rooms</strong>
                </li>
                <li>
                  • <strong>Lecture rooms</strong> can host Theory and
                  Theory+Lab courses
                </li>
                <li>
                  • Room capacity must be sufficient for the number of students
                </li>
                <li>• Unavailable rooms cannot be scheduled for classes</li>
                <li>• Each room number must be unique within a building</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
