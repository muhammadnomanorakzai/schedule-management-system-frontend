import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaHome,
  FaChalkboardTeacher,
  FaRocket,
  FaBook,
  FaCalendarCheck,
  FaBuilding,
  FaListOl,
  FaGraduationCap,
  FaListAlt,
  FaFileUpload,
  FaUsers,
  FaChevronDown,
  FaChevronRight,
  FaExclamationTriangle,
  FaClock,
  FaTimes,
  FaCog,
  FaUserCog,
  FaUniversity,
  FaRegCalendarAlt,
  FaRegClock,
  FaRegBuilding,
  FaBell,
  FaSearch,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [openMenus, setOpenMenus] = useState({});
  const [pendingCount, setPendingCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const isActive = (path) => location.pathname === path;
  const isParentActive = (paths) =>
    paths.some((path) => location.pathname.startsWith(path));

  const toggleMenu = (menuKey) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const fetchPendingCount = async () => {
    try {
      if (userInfo?.role === "Admin" && userInfo?.token) {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/approvals/count`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          },
        );
        setPendingCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  };

  useEffect(() => {
    if (userInfo?.role === "Admin") {
      fetchPendingCount();
      const interval = setInterval(fetchPendingCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userInfo]);

  const navStructure = {
    Admin: [
      {
        id: "dashboard",
        path: "/admin/dashboard",
        label: "Dashboard",
        icon: <FaHome />,
        description: "Overview & Analytics",
      },
      {
        id: "approvals",
        path: "/admin/approvals",
        label: "Pending Approvals",
        icon: <FaBell />,
        description: "Requests awaiting action",
        badge: pendingCount > 0 ? pendingCount : null,
      },
      {
        id: "users",
        label: "User Management",
        icon: <FaUserCog />,
        description: "Manage system users",
        key: "admin-users",
        submenu: [
          {
            path: "/admin/manage-users",
            label: "All Users",
            icon: <FaUsers />,
            description: "View and manage all users",
          },
          {
            path: "/admin/teachers",
            label: "Teachers",
            icon: <FaChalkboardTeacher />,
            description: "Manage teacher profiles",
          },
        ],
      },
      {
        id: "academic",
        label: "Academic Structure",
        icon: <FaUniversity />,
        description: "Configure academic setup",
        key: "admin-academic",
        submenu: [
          {
            path: "/admin/departments",
            label: "Departments",
            icon: <FaRegBuilding />,
            description: "Manage departments",
          },
          {
            path: "/admin/programs",
            label: "Programs",
            icon: <FaGraduationCap />,
            description: "Academic programs",
          },
          {
            path: "/admin/academic-sessions",
            label: "Sessions",
            icon: <FaRegCalendarAlt />,
            description: "Academic sessions",
          },
          {
            path: "/admin/semesters",
            label: "Semesters",
            icon: <FaListOl />,
            description: "Semester management",
          },
          {
            path: "/admin/courses",
            label: "Courses",
            icon: <FaBook />,
            description: "Course catalog",
          },
          {
            path: "/admin/sections",
            label: "Sections",
            icon: <FaUsers />,
            description: "Class sections",
          },
          {
            path: "/admin/rooms",
            label: "Rooms & Labs",
            icon: <FaRegBuilding />,
            description: "Facility management",
          },
        ],
      },
      {
        id: "scheduling",
        label: "Scheduling",
        icon: <FaRegClock />,
        description: "Timetable management",
        key: "admin-scheduling",
        submenu: [
          {
            path: "/admin/timeslots",
            label: "Time Slots",
            icon: <FaRegClock />,
            description: "Configure time slots",
          },
          {
            path: "/admin/course-allocations",
            label: "Course Allocations",
            icon: <FaListAlt />,
            description: "Assign courses to teachers",
          },
          {
            path: "/admin/timetables",
            label: "Timetables",
            icon: <FaCalendarCheck />,
            description: "Create & manage timetables",
          },
          {
            path: "/admin/conflicts",
            label: "Conflict Detection",
            icon: <FaExclamationTriangle />,
            description: "Detect scheduling conflicts",
          },
        ],
      },
      {
        id: "advanced",
        label: "Advanced Features",
        icon: <FaRocket />,
        description: "Bulk operations & tools",
        key: "admin-advanced",
        submenu: [
          {
            path: "/admin/csv-upload",
            label: "CSV Bulk Upload",
            icon: <FaFileUpload />,
            description: "Import data via CSV",
          },
        ],
      },
    ],
  };

  const currentNav = navStructure[userInfo?.role] || [];

  const filterNavItems = (items) => {
    if (!searchTerm) return items;

    return items
      .filter((item) => {
        if (item.submenu) {
          const filteredSubmenu = item.submenu.filter(
            (sub) =>
              sub.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
              sub.description?.toLowerCase().includes(searchTerm.toLowerCase()),
          );
          return filteredSubmenu.length > 0;
        }
        return (
          item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .map((item) => {
        if (item.submenu) {
          return {
            ...item,
            submenu: item.submenu.filter(
              (sub) =>
                sub.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sub.description
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()),
            ),
          };
        }
        return item;
      });
  };

  const filteredNav = filterNavItems(currentNav);

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: isOpen ? 0 : -300 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={`w-72 h-screen fixed left-0 top-0 overflow-y-auto z-50 flex flex-col shadow-2xl ${
        isDarkMode
          ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-b from-white to-gray-50 text-gray-800"
      }`}>
      {/* Logo Section */}
      <div
        className={`sticky top-0 z-10 p-6 ${
          isDarkMode
            ? "bg-gradient-to-r from-blue-600 to-indigo-600"
            : "bg-gradient-to-r from-blue-500 to-indigo-500"
        }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
              <FaBook className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Sch<span className="text-yellow-300">Manager</span>
              </h1>
              <p className="text-xs text-white/70 mt-0.5">
                {userInfo?.role || "Admin"} Portal
              </p>
            </div>
          </div>

          {/* Close Button for Mobile */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 text-sm" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/50 rounded-xl py-2.5 pl-10 pr-4 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm"
          />
        </div>
      </div>

      {/* User Profile Quick Info */}
      <div
        className={`px-4 py-4 border-b ${
          isDarkMode ? "border-white/10" : "border-gray-200"
        }`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {userInfo?.name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium truncate ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}>
              {userInfo?.name || "Admin User"}
            </p>
            <p
              className={`text-xs truncate ${
                isDarkMode ? "text-white/60" : "text-gray-500"
              }`}>
              {userInfo?.email || "admin@edu.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        {filteredNav.length === 0 ? (
          <div
            className={`text-center py-8 ${
              isDarkMode ? "text-white/50" : "text-gray-500"
            }`}>
            <p>No matching menu items</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {filteredNav.map((item, index) => {
              if (item.submenu) {
                const isOpen = openMenus[item.key];
                const hasActiveChild = isParentActive(
                  item.submenu.map((sub) => sub.path).filter(Boolean),
                );

                return (
                  <li key={item.key || index}>
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                        hasActiveChild
                          ? isDarkMode
                            ? "bg-blue-600/20 text-blue-300"
                            : "bg-blue-50 text-blue-600"
                          : isDarkMode
                            ? "text-white/70 hover:bg-white/10 hover:text-white"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-xl ${
                            hasActiveChild
                              ? isDarkMode
                                ? "text-blue-400"
                                : "text-blue-600"
                              : isDarkMode
                                ? "text-white/50"
                                : "text-gray-400"
                          }`}>
                          {item.icon}
                        </span>
                        <div className="text-left">
                          <span className="font-medium text-sm">
                            {item.label}
                          </span>
                          {item.description && (
                            <p
                              className={`text-xs mt-0.5 ${
                                isDarkMode ? "text-white/40" : "text-gray-500"
                              }`}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {isOpen ? (
                          <FaChevronDown
                            className={`text-xs ${
                              isDarkMode ? "text-white/40" : "text-gray-400"
                            }`}
                          />
                        ) : (
                          <FaChevronRight
                            className={`text-xs ${
                              isDarkMode ? "text-white/40" : "text-gray-400"
                            }`}
                          />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-4 mt-1 space-y-1 overflow-hidden">
                          {item.submenu.map((subItem) => (
                            <li key={subItem.path}>
                              <Link
                                to={subItem.path}
                                onClick={() => {
                                  if (window.innerWidth < 768) {
                                    toggleSidebar();
                                  }
                                }}
                                className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-300 ${
                                  isActive(subItem.path)
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : isDarkMode
                                      ? "text-white/60 hover:bg-white/10 hover:text-white"
                                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}>
                                <span
                                  className={`mr-3 text-base ${
                                    isActive(subItem.path)
                                      ? "text-white"
                                      : isDarkMode
                                        ? "text-white/40"
                                        : "text-gray-400"
                                  }`}>
                                  {subItem.icon}
                                </span>
                                <div>
                                  <span className="font-medium text-sm">
                                    {subItem.label}
                                  </span>
                                  {subItem.description && (
                                    <p
                                      className={`text-xs mt-0.5 ${
                                        isDarkMode
                                          ? "text-white/40"
                                          : "text-gray-500"
                                      }`}>
                                      {subItem.description}
                                    </p>
                                  )}
                                </div>
                                {subItem.badge && (
                                  <span className="ml-auto px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                                    {subItem.badge}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              } else {
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          toggleSidebar();
                        }
                      }}
                      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25"
                          : isDarkMode
                            ? "text-white/70 hover:bg-white/10 hover:text-white"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}>
                      <span
                        className={`mr-3 text-xl ${
                          isActive(item.path)
                            ? "text-white"
                            : isDarkMode
                              ? "text-white/50 group-hover:text-white/80"
                              : "text-gray-400 group-hover:text-gray-600"
                        }`}>
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <span className="font-medium text-sm">
                          {item.label}
                        </span>
                        {item.description && (
                          <p
                            className={`text-xs mt-0.5 ${
                              isActive(item.path)
                                ? "text-white/80"
                                : isDarkMode
                                  ? "text-white/40"
                                  : "text-gray-500"
                            }`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.badge && (
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                            isActive(item.path)
                              ? "bg-white text-blue-600"
                              : "bg-red-500 text-white"
                          }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              }
            })}
          </ul>
        )}
      </nav>

      {/* Footer */}
      <div
        className={`px-4 py-4 border-t ${
          isDarkMode ? "border-white/10" : "border-gray-200"
        }`}>
        <div
          className={`flex items-center justify-between text-xs ${
            isDarkMode ? "text-white/40" : "text-gray-500"
          }`}>
          <span>© 2024 EduManager</span>
          <span>v2.0.0</span>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
