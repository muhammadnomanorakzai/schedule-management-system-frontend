import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useTheme } from "../context/ThemeContext";
import {
  FaSignOutAlt,
  FaBars,
  FaBell,
  FaSearch,
  FaCog,
  FaUserCircle,
  FaChevronDown,
  FaMoon,
  FaSun,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Layout = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New teacher registration", time: "5 min ago", read: false },
    {
      id: 2,
      text: "Timetable conflict detected",
      time: "1 hour ago",
      read: false,
    },
    { id: 3, text: "CSV upload completed", time: "2 hours ago", read: true },
  ]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/admin/dashboard")) return "Dashboard";
    if (path.includes("/admin/teachers")) return "Teacher Management";
    if (path.includes("/admin/courses")) return "Course Management";
    if (path.includes("/admin/timetables")) return "Timetable Management";
    if (path.includes("/admin/conflicts")) return "Conflict Detection";
    if (path.includes("/admin/csv-upload")) return "CSV Upload";
    return "Dashboard";
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 768 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? "md:ml-72" : "ml-0"
        }`}>
        {/* Header */}
        <header className="bg-header-bg backdrop-blur-md border-b border-border-color h-16 flex items-center justify-between px-4 md:px-6 z-10 sticky top-0 shadow-sm">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden btn-icon text-text-secondary hover:bg-hover-bg"
              aria-label="Toggle sidebar">
              <FaBars className="text-xl" />
            </button>

            {/* Page Title */}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-text-primary">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-text-tertiary mt-0.5 hidden sm:block">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-input-bg border border-input-border rounded-xl px-4 py-2">
              <FaSearch className="text-text-tertiary text-sm mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-48 lg:w-64 text-text-primary placeholder-text-tertiary"
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-icon text-text-secondary hover:bg-hover-bg"
              aria-label="Toggle theme">
              {isDarkMode ? (
                <FaSun className="text-yellow-500 text-lg" />
              ) : (
                <FaMoon className="text-text-secondary text-lg" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="btn-icon text-text-secondary hover:bg-hover-bg relative">
                <FaBell className="text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse"></span>
                )}
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-hover-bg transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {userInfo?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-text-primary">
                    {userInfo?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-blue-600 font-medium capitalize">
                    {userInfo?.role || "Admin"}
                  </p>
                </div>
                <FaChevronDown
                  className={`hidden lg:block text-text-tertiary text-xs transition-transform duration-200 ${
                    isProfileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-card-bg border border-border-color rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-border-color">
                      <p className="text-sm font-semibold text-text-primary">
                        {userInfo?.name}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {userInfo?.email}
                      </p>
                    </div>

                    <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-hover-bg flex items-center space-x-3">
                      <FaUserCircle className="text-text-tertiary" />
                      <span>My Profile</span>
                    </button>

                    <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-hover-bg flex items-center space-x-3">
                      <FaCog className="text-text-tertiary" />
                      <span>Settings</span>
                    </button>

                    <div className="border-t border-border-color my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/10 flex items-center space-x-3">
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-bg-primary">
          <div
            className={`${location.pathname.includes("/live-class") ? "p-0" : "p-4 md:p-6 lg:p-8"}`}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
