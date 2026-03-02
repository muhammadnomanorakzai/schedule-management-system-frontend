import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserShield,
  FaUsers,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSync,
  FaExclamationTriangle,
  FaBuilding,
  FaBook,
  FaCalendar,
  FaGraduationCap,
} from "react-icons/fa";
import toast from "react-hot-toast";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  // const [classes, setClasses] = useState([]); // Commented out - for student sections
  // const [students, setStudents] = useState([]); // Commented out - for parent-child assignments
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Edit form states - removed student/parent specific states
  const [editRole, setEditRole] = useState("");
  // const [editSection, setEditSection] = useState(""); // Commented out - for student sections
  // const [editRollNumber, setEditRollNumber] = useState(""); // Commented out - for student roll numbers
  // const [selectedChildren, setSelectedChildren] = useState([]); // Commented out - for parent children
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchAllUsers();
    // fetchSections(); // Commented out - not needed for teacher/admin only
  }, []);

  // Fetch all users from approvals endpoint
  const fetchAllUsers = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.get("/approvals/users");

      // Filter to show only teachers and admins (optional - remove this if you want to show all but only edit teachers/admins)
      const filteredData = data.filter(
        (u) => u.role === "Teacher" || u.role === "Admin",
      );

      setAllUsers(filteredData);
      setUsers(filteredData);

      // Commented out - student data not needed
      // const studentsData = data.filter((u) => u.role === "Student");
      // const teachersData = data.filter((u) => u.role === "Teacher");
      // setStudents(studentsData);

      toast.success(`Loaded ${filteredData.length} teachers and admins`);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setRefreshing(false);
    }
  };

  // Commented out - not needed without student functionality
  // const fetchSections = async () => {
  //   try {
  //     const { data } = await api.get("/sections");
  //     setClasses(data);
  //   } catch (error) {
  //     console.error("Error fetching sections:", error);
  //     toast.error("Failed to fetch sections");
  //   }
  // };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditRole(user.role || "Teacher");
    // setEditSection(user.section?._id || ""); // Commented out
    // setEditRollNumber(user.rollNumber || ""); // Commented out
    // setSelectedChildren(user.children ? user.children.map((c) => c._id || c) : []); // Commented out

    // Set additional form data - teacher/admin specific fields only
    const formData = {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      // Teacher specific fields
      qualification: user.qualification || "",
      specialization: user.specialization || "",
      experience: user.experience || 0,
      designation: user.designation || "Lecturer",
      department: user.department?._id || "",
      maxWeeklyHours: user.maxWeeklyHours || 18,
      // Commented out - student specific fields
      // program: user.program?._id || "",
      // currentSemester: user.currentSemester?._id || "",
      // academicSession: user.academicSession?._id || "",
      // batchYear: user.batchYear || new Date().getFullYear(),
      // enrollmentStatus: user.enrollmentStatus || "Active",
      // cgpa: user.cgpa || 0,
    };

    setEditFormData(formData);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const isRoleChanging = selectedUser.role !== editRole;

      // Step 1: Update user details in approvals first (this handles role changes)
      const updateData = {
        role: editRole,
      };

      // Add student-specific fields only if role is Student
      if (editRole === "Student") {
        updateData.studentClass = editSection;
        updateData.rollNumber = editRollNumber;
      }

      // Add parent-specific fields only if role is Parent
      if (editRole === "Parent") {
        updateData.children = selectedChildren;
      }

      // First update the user details (role, etc.)
      await api.put(`/approvals/${selectedUser._id}/update`, updateData);

      // Step 2: Handle role-specific updates
      if (editRole === "Teacher") {
        // Prepare teacher data
        const teacherData = {
          name: editFormData.name,
          qualification: editFormData.qualification,
          specialization: editFormData.specialization,
          experience: editFormData.experience,
          designation: editFormData.designation,
          department: editFormData.department,
          phone: editFormData.phone,
          address: editFormData.address,
          maxWeeklyHours: editFormData.maxWeeklyHours,
          role: "Teacher", // This will be handled by the updated controller
        };

        try {
          // Try to update teacher (works if user is already a teacher or becoming one)
          await api.put(`/teachers/${selectedUser._id}`, teacherData);
        } catch (error) {
          // If teacher update fails with 404 and we're trying to create a new teacher
          if (
            error.response?.status === 404 &&
            isRoleChanging &&
            editRole === "Teacher"
          ) {
            // Create new teacher record instead
            await api.post("/teachers", {
              userId: selectedUser._id,
              ...teacherData,
            });
          } else {
            throw error; // Re-throw if it's a different error
          }
        }
      } else if (editRole === "Admin") {
        // Handle admin updates (if you have an admin endpoint)
        try {
          await api.put(`/admins/${selectedUser._id}`, {
            name: editFormData.name,
            phone: editFormData.phone,
            address: editFormData.address,
          });
        } catch (error) {
          // If admin endpoint doesn't exist, just log but don't fail
          console.log("Admin update endpoint not available", error);
          // You might want to update user directly or handle differently
        }
      }

      toast.success("User updated successfully!");
      setShowModal(false);
      fetchAllUsers();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Error updating user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName, userRole) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) return;

    try {
      await api.delete(`/approvals/users/${userId}`);
      toast.success("User deleted successfully");
      fetchAllUsers();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const getRoleConfig = (role) => {
    switch (role) {
      case "Teacher":
        return {
          icon: FaChalkboardTeacher,
          bgColor: "bg-green-100",
          textColor: "text-green-600",
          badgeColor: "bg-green-100 text-green-700",
          editColor: "bg-green-50 hover:bg-green-100",
        };
      case "Admin":
        return {
          icon: FaUserShield,
          bgColor: "bg-red-100",
          textColor: "text-red-600",
          badgeColor: "bg-red-100 text-red-700",
          editColor: "bg-red-50 hover:bg-red-100",
        };
      // Commented out - student role not needed
      // default:
      //   return {
      //     icon: FaUserGraduate,
      //     bgColor: "bg-gray-100",
      //     textColor: "text-gray-600",
      //     badgeColor: "bg-gray-100 text-gray-700",
      //     editColor: "bg-gray-50 hover:bg-gray-100",
      //   };
      default:
        return {
          icon: FaUserShield,
          bgColor: "bg-gray-100",
          textColor: "text-gray-600",
          badgeColor: "bg-gray-100 text-gray-700",
          editColor: "bg-gray-50 hover:bg-gray-100",
        };
    }
  };

  const getAdditionalInfo = (user) => {
    switch (user.role) {
      case "Teacher":
        return {
          info1: user.qualification || "No Qualification",
          info2: user.designation || "Not Assigned",
          info3: user.department?.name || "No Department",
          extra: `Exp: ${user.experience || 0} yrs | Workload: ${user.currentWorkload?.weeklyHours || 0}/${user.maxWeeklyHours || 18} hrs`,
        };
      case "Admin":
        return {
          info1: "System Administrator",
          info2: user.department?.name || "No Department",
          info3: user.phone || "No Phone",
          extra: `Created: ${new Date(user.createdAt || Date.now()).toLocaleDateString()}`,
        };
      // Commented out - student and parent info not needed
      // case "Student":
      //   return {
      //     info1: user.program?.name || "No Program",
      //     info2: `Sem: ${user.currentSemester?.name || "N/A"}`,
      //     info3: user.section?.name || "No Section",
      //     extra: `Batch: ${user.batchYear || "N/A"} | CGPA: ${user.cgpa || "N/A"}`,
      //   };
      // case "Parent":
      //   return {
      //     info1: `Children: ${user.children?.length || 0}`,
      //     info2: user.phone || "No Phone",
      //     info3: user.address
      //       ? `${user.address.substring(0, 20)}...`
      //       : "No Address",
      //     extra: "",
      //   };
      default:
        return {
          info1: "No Additional Info",
          info2: "",
          info3: "",
          extra: "",
        };
    }
  };

  const handleSearch = (e) => {
    const search = e.target.value.toLowerCase();
    setSearchTerm(search);

    if (search === "") {
      setUsers(allUsers);
      return;
    }

    const filtered = allUsers.filter((user) => {
      return (
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phone?.toLowerCase().includes(search) ||
        user.qualification?.toLowerCase().includes(search) ||
        user.designation?.toLowerCase().includes(search) ||
        user.department?.name?.toLowerCase().includes(search)
        // Removed student/parent specific fields from search
        // user.rollNumber?.toLowerCase().includes(search) ||
        // user.program?.name?.toLowerCase().includes(search) ||
        // user.section?.name?.toLowerCase().includes(search)
      );
    });

    setUsers(filtered);
  };

  const handleFilterChange = (e) => {
    const role = e.target.value;
    setFilterRole(role);

    if (role === "All") {
      setUsers(allUsers);
    } else {
      const filtered = allUsers.filter((user) => user.role === role);
      setUsers(filtered);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen overflow-x-hidden p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
            Manage <span className="text-blue-600">Teachers & Admins</span>
          </h1>
          <button
            onClick={fetchAllUsers}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
            <FaSync className={`${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <p className="text-gray-500">
          View and manage all teachers and administrators
        </p>
      </div>

      {/* Stats Cards - Updated to show only teachers and admins */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
              <FaChalkboardTeacher className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Teachers</p>
              <p className="text-xl font-bold text-gray-800">
                {allUsers.filter((u) => u.role === "Teacher").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-3">
              <FaUserShield className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Admins</p>
              <p className="text-xl font-bold text-gray-800">
                {allUsers.filter((u) => u.role === "Admin").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
              <FaUsers className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-xl font-bold text-gray-800">
                {allUsers.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, qualification..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base"
            />
          </div>
          <div>
            <select
              value={filterRole}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base">
              <option value="All">All Roles</option>
              <option value="Teacher">Teachers</option>
              <option value="Admin">Admins</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaExclamationTriangle className="text-yellow-500" />
            <span>
              Showing {users.length} of {allUsers.length} users
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Teachers or Admins Found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterRole !== "All"
              ? "Try changing your search or filter criteria"
              : "No teachers or administrators available in the system"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">
                    User Details
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">
                    Role & Contact
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">
                    Additional Info
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">
                    Status
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-blue-800 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const roleConfig = getRoleConfig(user.role);
                  const RoleIcon = roleConfig.icon;
                  const additionalInfo = getAdditionalInfo(user);

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${roleConfig.bgColor}`}>
                            <RoleIcon className={roleConfig.textColor} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${roleConfig.badgeColor}`}>
                            {user.role}
                          </span>
                          {user.phone && (
                            <div className="text-sm text-gray-600">
                              {user.phone}
                            </div>
                          )}
                          {/* Removed roll number display */}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600 space-y-1">
                          {additionalInfo.info1 && (
                            <div className="flex items-center gap-1">
                              {user.role === "Teacher" ? (
                                <FaBook />
                              ) : (
                                <FaUserShield />
                              )}
                              <span>{additionalInfo.info1}</span>
                            </div>
                          )}
                          {additionalInfo.info2 && (
                            <div>{additionalInfo.info2}</div>
                          )}
                          {additionalInfo.info3 && (
                            <div className="flex items-center gap-1">
                              <FaBuilding />
                              <span>{additionalInfo.info3}</span>
                            </div>
                          )}
                          {additionalInfo.extra && (
                            <div className="text-xs text-gray-500">
                              {additionalInfo.extra}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              user.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : user.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}>
                            {user.status || "Active"}
                          </span>
                          {/* Removed enrollment status */}
                          {user.requestedAt && (
                            <div className="text-xs text-gray-400">
                              {new Date(user.requestedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openEditModal(user)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 font-semibold text-sm">
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(user._id, user.name, user.role)
                            }
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors inline-flex items-center gap-2 font-semibold text-sm">
                            <FaTrash /> Delete
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

      {/* Edit Modal - Updated for teacher/admin only */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full my-8 relative"
              onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Edit {selectedUser.role} Details
              </h2>
              <p className="text-gray-600 mb-6">
                Editing:{" "}
                <span className="font-semibold">{selectedUser.name}</span>
              </p>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="Teacher">Teacher</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Teacher specific fields - always show for teacher role */}
                {(selectedUser.role === "Teacher" ||
                  editRole === "Teacher") && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Qualification
                      </label>
                      <input
                        type="text"
                        value={editFormData.qualification}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            qualification: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={editFormData.specialization}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            specialization: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Experience (years)
                      </label>
                      <input
                        type="number"
                        value={editFormData.experience}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            experience: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={editFormData.designation}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            designation: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={editFormData.department}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            department: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Max Weekly Hours
                      </label>
                      <input
                        type="number"
                        value={editFormData.maxWeeklyHours}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            maxWeeklyHours: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Admin specific fields - add if needed */}
                {(selectedUser.role === "Admin" || editRole === "Admin") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={editFormData.address}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: e.target.value,
                        })
                      }
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}

                {/* Commented out - student and parent fields */}
                {/* {editRole === "Student" && ( ... )} */}
                {/* {editRole === "Parent" && ( ... )} */}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading}>
                  {loading ? "Updating..." : "Update User"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageUsers;
