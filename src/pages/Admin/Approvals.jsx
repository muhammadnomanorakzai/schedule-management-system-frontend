import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";

import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaUser,
  FaUserClock,
  FaChalkboardTeacher,
} from "react-icons/fa";
import toast from "react-hot-toast";

const Approvals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  // const [classes, setClasses] = useState([]); // Commented out - for student classes
  // const [students, setStudents] = useState([]); // Commented out - for parent-child assignments
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form states - only keeping role for teacher
  const [role, setRole] = useState("Teacher");
  // const [selectedClass, setSelectedClass] = useState(""); // Commented out - for student
  // const [rollNumber, setRollNumber] = useState(""); // Commented out - for student
  // const [selectedChildren, setSelectedChildren] = useState([]); // Commented out - for parent
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
    // fetchClasses(); // Commented out - not needed
    // fetchStudents(); // Commented out - not needed

    // Auto-refresh pending users every 30 seconds
    const interval = setInterval(() => {
      fetchPendingUsers();
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const { data } = await api.get("/approvals/pending");
      setPendingUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Commented out - not needed
  // const fetchClasses = async () => {
  //   try {
  //     const { data } = await api.get("/classes");
  //     setClasses(data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // Commented out - not needed
  // const fetchStudents = async () => {
  //   try {
  //     const { data } = await api.get("/approvals/users");
  //     setStudents(data.filter((u) => u.role === "Student"));
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const openApprovalModal = (user) => {
    setSelectedUser(user);
    setRole("Teacher");
    // setSelectedClass(""); // Commented out
    // setRollNumber(""); // Commented out
    // setSelectedChildren([]); // Commented out
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      await api.put(`/approvals/${selectedUser._id}/approve`, {
        role, // Always "Teacher" now
        // studentClass: role === "Student" ? selectedClass : null, // Commented out
        // rollNumber: role === "Student" ? rollNumber : null, // Commented out
        // children: role === "Parent" ? selectedChildren : null, // Commented out
      });

      toast.success("Teacher approved successfully!");
      setShowModal(false);
      fetchPendingUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error approving teacher");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm("Are you sure you want to reject this user?")) return;

    try {
      await api.put(`/approvals/${userId}/reject`, {});
      toast.success("User rejected");
      fetchPendingUsers();
    } catch (error) {
      console.error(error);
      toast.error("Error rejecting user");
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const hours = Math.floor(seconds / 3600);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
          Pending <span className="text-blue-600">Teacher Approvals</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Review and approve new teacher registrations
        </p>
      </div>

      {/* Stats */}
      <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
        <FaChalkboardTeacher className="text-2xl sm:text-3xl text-green-600 mr-3 sm:mr-4" />
        <div>
          <p className="text-xs sm:text-sm text-gray-600">
            Pending Teacher Requests
          </p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">
            {pendingUsers.length}
          </p>
        </div>
      </div>

      {/* Pending Users List */}
      {pendingUsers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
          <FaUserClock className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            No pending teacher approval requests
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingUsers.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-shadow overflow-hidden">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaChalkboardTeacher className="text-green-600 text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                      {user.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {user.email}
                    </p>
                    {user.qualification && (
                      <p className="text-xs text-gray-500 mt-1">
                        Qualification: {user.qualification}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Requested: {getTimeAgo(user.requestedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => openApprovalModal(user)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 font-semibold text-xs sm:text-sm">
                    <FaCheck className="text-xs" /> Approve Teacher
                  </button>
                  <button
                    onClick={() => handleReject(user._id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 font-semibold text-xs sm:text-sm">
                    <FaTimes className="text-xs" /> Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Approval Modal - Simplified for Teacher only */}
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
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full my-8 relative"
              onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Approve Teacher
              </h2>
              <p className="text-gray-600 mb-6">
                You are approving:{" "}
                <span className="font-semibold">{selectedUser.name}</span> as a{" "}
                <span className="font-semibold text-green-600">Teacher</span>
              </p>

              <div className="space-y-4">
                {/* Role is fixed to Teacher, no selection needed */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Role:</span> Teacher
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    After approval, the teacher will be able to log in and you
                    can assign departments, courses, and manage their profile
                    from the Manage Users section.
                  </p>
                </div>

                {/* Commented out - student and parent sections */}
                {/* {role === "Student" && ( ... )} */}
                {/* {role === "Parent" && ( ... )} */}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"
                  disabled={loading}>
                  {loading ? "Approving..." : "Approve Teacher"}
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

export default Approvals;
