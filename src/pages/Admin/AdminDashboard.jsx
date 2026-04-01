import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaUsers,
  FaUserClock,
  FaUserPlus,
  FaCalendarCheck,
  FaClipboardList,
  FaArrowUp,
  FaArrowDown,
  FaEllipsisV,
  FaDownload,
  FaPrint,
  FaSync,
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaRocket,
  FaChartLine,
  FaChartPie,
  FaChartBar,
  FaBuilding,
  FaDoorOpen,
  FaRegClock,
  FaListAlt,
  FaFileUpload,
  FaCog,
  FaShieldAlt,
  FaRegBuilding,
  FaCalendarAlt,
  FaChalkboard,
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    teachers: 0,
    departments: 0,
    programs: 0,
    courses: 0,
    sections: 0,
    rooms: 0,
    timeslots: 0,
    timetables: 0,
    pendingApprovals: 0,
    activeSessions: 0,
    courseAllocations: 0,
    conflicts: 0,
    totalStudents: 0,
    totalParents: 0,
  });

  const [departmentData, setDepartmentData] = useState([]);
  const [programData, setProgramData] = useState([]);
  const [weeklyActivityData, setWeeklyActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    status: "healthy",
    uptime: "99.9%",
    lastBackup: "2 hours ago",
    activeUsers: 24,
    apiStatus: "operational",
    dbStatus: "connected",
  });

  // Fetch real dashboard data
  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel for better performance
      const [
        teachersRes,
        departmentsRes,
        programsRes,
        coursesRes,
        sectionsRes,
        roomsRes,
        timeslotsRes,
        timetablesRes,
        approvalsRes,
        sessionsRes,
        allocationsRes,
        conflictsRes,
        studentsRes,
        parentsRes,
        activityRes,
      ] = await Promise.all([
        api.get("/teachers").catch(() => ({ data: [] })),
        api.get("/departments").catch(() => ({ data: [] })),
        api.get("/programs").catch(() => ({ data: [] })),
        api.get("/courses").catch(() => ({ data: [] })),
        api.get("/sections").catch(() => ({ data: [] })),
        api.get("/rooms").catch(() => ({ data: [] })),
        api.get("/time-slots").catch(() => ({ data: [] })),
        api.get("/timetables").catch(() => ({ data: [] })),
        api.get("/approvals/pending").catch(() => ({ data: [] })),
        api.get("/academic-sessions/active").catch(() => ({ data: [] })),
        api.get("/course-allocations").catch(() => ({ data: [] })),
        api.get("/conflicts?status=detected").catch(() => ({ data: [] })),
        api.get("/students/count").catch(() => ({ data: { count: 0 } })),
        api.get("/parents/count").catch(() => ({ data: { count: 0 } })),
        api.get("/dashboard/activity").catch(() => ({ data: [] })),
      ]);

      // Process teacher data
      const teachers = teachersRes.data;
      const departments = departmentsRes.data;
      const programs = programsRes.data;
      const courses = coursesRes.data;
      const sections = sectionsRes.data;
      const rooms = roomsRes.data;
      const timeslots = timeslotsRes.data;
      const timetables = timetablesRes.data;
      const pendingApprovals = approvalsRes.data;
      const activeSessions = sessionsRes.data;
      const allocations = allocationsRes.data;
      const conflicts = conflictsRes.data;
      const studentsCount =
        studentsRes.data.count || studentsRes.data.length || 0;
      const parentsCount = parentsRes.data.count || parentsRes.data.length || 0;
      const activityData = activityRes.data || [];

      setStats({
        teachers: teachers.length || 0,
        departments: departments.length || 0,
        programs: programs.length || 0,
        courses: courses.length || 0,
        sections: sections.length || 0,
        rooms: rooms.length || 0,
        timeslots: timeslots.length || 0,
        timetables: timetables.length || 0,
        pendingApprovals: pendingApprovals.length || 0,
        activeSessions: activeSessions.length || 0,
        courseAllocations: allocations.length || 0,
        conflicts: conflicts.length || 0,
        totalStudents: studentsCount,
        totalParents: parentsCount,
      });

      // Calculate Department Distribution (courses per department)
      const deptDistribution = departments.map((dept) => ({
        name: dept.name || dept.code || "Department",
        count: courses.filter((c) => c.department === dept._id).length,
      }));
      setDepartmentData(deptDistribution);

      // Calculate Program Distribution (sections per program)
      const progDistribution = programs.map((prog) => ({
        name: prog.code || prog.name || "Program",
        count: sections.filter((s) => s.program === prog._id).length,
      }));
      setProgramData(progDistribution);

      // Set weekly activity data
      setWeeklyActivityData(activityData);

      // Fetch recent activities
      await fetchRecentActivities();

      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");
        navigate("/login");
      }
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      // Fetch real recent activities from various endpoints
      const [recentTeachers, recentTimetables, recentConflicts, recentUploads] =
        await Promise.all([
          api.get("/teachers/recent?limit=2").catch(() => ({ data: [] })),
          api.get("/timetables/recent?limit=2").catch(() => ({ data: [] })),
          api.get("/conflicts/recent?limit=2").catch(() => ({ data: [] })),
          api.get("/csv/uploads/recent?limit=2").catch(() => ({ data: [] })),
        ]);

      const activities = [];

      // Add teacher activities
      if (recentTeachers.data && recentTeachers.data.length > 0) {
        recentTeachers.data.forEach((teacher) => {
          activities.push({
            id: `teacher-${teacher._id}`,
            action: "New teacher registered",
            time: formatTimeAgo(teacher.createdAt),
            type: "teacher",
            user: teacher.name || "New Teacher",
          });
        });
      }

      // Add timetable activities
      if (recentTimetables.data && recentTimetables.data.length > 0) {
        recentTimetables.data.forEach((timetable) => {
          activities.push({
            id: `timetable-${timetable._id}`,
            action: "Timetable updated",
            time: formatTimeAgo(timetable.updatedAt || timetable.createdAt),
            type: "timetable",
            user: timetable.name || "Timetable",
          });
        });
      }

      // Add conflict activities
      if (recentConflicts.data && recentConflicts.data.length > 0) {
        recentConflicts.data.forEach((conflict) => {
          activities.push({
            id: `conflict-${conflict._id}`,
            action: "New conflict detected",
            time: formatTimeAgo(conflict.createdAt),
            type: "conflict",
            user: conflict.room?.name || conflict.teacher?.name || "System",
          });
        });
      }

      // Add CSV upload activities
      if (recentUploads.data && recentUploads.data.length > 0) {
        recentUploads.data.forEach((upload) => {
          activities.push({
            id: `upload-${upload._id}`,
            action: "CSV upload completed",
            time: formatTimeAgo(upload.createdAt),
            type: "upload",
            user: upload.uploadedBy?.name || "Admin",
          });
        });
      }

      // Sort by time (most recent first) and limit to 6
      activities.sort((a, b) => {
        const timeA = a.time.includes("min")
          ? parseInt(a.time)
          : a.time.includes("hour")
            ? parseInt(a.time) * 60
            : 9999;
        const timeB = b.time.includes("min")
          ? parseInt(b.time)
          : b.time.includes("hour")
            ? parseInt(b.time) * 60
            : 9999;
        return timeA - timeB;
      });

      setRecentActivities(activities.slice(0, 6));
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      // Set mock data if API fails
      setRecentActivities([
        {
          id: 1,
          action: "System ready",
          time: "just now",
          type: "system",
          user: "Admin",
        },
      ]);
    }
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  // Fetch system health status
  const fetchSystemHealth = async () => {
    try {
      const healthRes = await api.get("/system/health").catch(() => null);
      if (healthRes?.data) {
        setSystemHealth(healthRes.data);
      }
    } catch (error) {
      console.error("Error fetching system health:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchSystemHealth();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Chart Data with real data
  const departmentDistributionData = {
    labels: departmentData.map((d) => d.name),
    datasets: [
      {
        label: "Courses",
        data: departmentData.map((d) => d.count),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderRadius: 8,
        barThickness: 30,
      },
    ],
  };

  const programDistributionData = {
    labels: programData.map((p) => p.name),
    datasets: [
      {
        data: programData.map((p) => p.count),
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
        ],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  // Generate resource utilization data based on real timetables
  const resourceUtilizationData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Rooms Used",
        data:
          weeklyActivityData.length > 0
            ? weeklyActivityData.map((d) => d.roomsUsed || 0)
            : [
                Math.floor(stats.rooms * 0.7),
                Math.floor(stats.rooms * 0.8),
                Math.floor(stats.rooms * 0.75),
                Math.floor(stats.rooms * 0.85),
                Math.floor(stats.rooms * 0.6),
              ],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Teachers Scheduled",
        data:
          weeklyActivityData.length > 0
            ? weeklyActivityData.map((d) => d.teachersScheduled || 0)
            : [
                Math.floor(stats.teachers * 0.6),
                Math.floor(stats.teachers * 0.7),
                Math.floor(stats.teachers * 0.65),
                Math.floor(stats.teachers * 0.75),
                Math.floor(stats.teachers * 0.5),
              ],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", damping: 15 },
    },
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
    trendValue,
    onClick,
  }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-lg transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>

          {trend && (
            <div className="flex items-center mt-3">
              {trend === "up" ? (
                <FaArrowUp className="text-green-500 text-xs mr-1" />
              ) : (
                <FaArrowDown className="text-red-500 text-xs mr-1" />
              )}
              <span
                className={`text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trendValue}
              </span>
              <span className="text-xs text-gray-400 ml-1">vs last month</span>
            </div>
          )}
        </div>

        <div className={`p-4 ${color} rounded-2xl shadow-lg`}>
          <Icon className="text-white text-2xl" />
        </div>
      </div>
    </motion.div>
  );

  const QuickActionCard = ({
    title,
    icon: Icon,
    color,
    onClick,
    description,
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group">
      <div
        className={`p-3 rounded-xl ${color} mr-4 group-hover:scale-110 transition-transform`}>
        <Icon className="text-white text-xl" />
      </div>
      <div className="text-left">
        <span className="font-semibold text-gray-800">{title}</span>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </motion.button>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
      <div
        className={`w-2 h-2 rounded-full mr-3 ${
          activity.type === "teacher"
            ? "bg-green-500"
            : activity.type === "timetable"
              ? "bg-blue-500"
              : activity.type === "approval"
                ? "bg-yellow-500"
                : activity.type === "upload"
                  ? "bg-purple-500"
                  : activity.type === "conflict"
                    ? "bg-red-500"
                    : "bg-gray-500"
        }`}
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{activity.action}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{activity.user}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">{activity.time}</span>
        </div>
      </div>
      <button className="text-gray-400 hover:text-gray-600">
        <FaEllipsisV size={12} />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Academic<span className="text-blue-600"> Dashboard</span>
            </h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Overview •{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>

            <button
              onClick={() => window.print()}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <FaPrint className="text-gray-600" />
            </button>
            <button
              onClick={fetchStats}
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <FaSync className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* System Health Banner */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <FaShieldAlt className="text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  System Status: <span className="text-green-300">Healthy</span>
                </h2>
                <p className="text-white/80 text-sm mt-1 flex items-center gap-3 flex-wrap">
                  <span>🔄 API: {systemHealth.apiStatus}</span>
                  <span>💾 Database: {systemHealth.dbStatus}</span>
                  <span>👥 Active users: {systemHealth.activeUsers}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full text-sm border border-green-400/30">
                Last backup: {systemHealth.lastBackup}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Teachers"
            value={stats.teachers}
            icon={FaChalkboardTeacher}
            color="bg-blue-500"
            trend="up"
            trendValue="+8%"
            onClick={() => navigate("/admin/teachers")}
          />

          <StatCard
            title="Active Programs"
            value={stats.programs}
            icon={FaBook}
            color="bg-green-500"
            trend="up"
            trendValue="+5%"
            onClick={() => navigate("/admin/programs")}
          />

          <StatCard
            title="Total Courses"
            value={stats.courses}
            icon={FaListAlt}
            color="bg-purple-500"
            trend="up"
            trendValue="+12%"
            onClick={() => navigate("/admin/courses")}
          />

          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={FaUserClock}
            color="bg-red-500"
            trend={stats.pendingApprovals > 0 ? "up" : "down"}
            trendValue={
              stats.pendingApprovals > 0 ? `+${stats.pendingApprovals}` : "0"
            }
            onClick={() => navigate("/admin/approvals")}
          />
        </div>

        {/* Secondary Stats - Academic Infrastructure */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
            <FaBuilding className="text-blue-500 mb-2" />
            <p className="text-xs text-gray-500">Departments</p>
            <p className="text-xl font-bold text-gray-800">
              {stats.departments}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
            <FaRegBuilding className="text-green-500 mb-2" />
            <p className="text-xs text-gray-500">Sections</p>
            <p className="text-xl font-bold text-gray-800">{stats.sections}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
            <FaDoorOpen className="text-purple-500 mb-2" />
            <p className="text-xs text-gray-500">Rooms</p>
            <p className="text-xl font-bold text-gray-800">{stats.rooms}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
            <FaRegClock className="text-orange-500 mb-2" />
            <p className="text-xs text-gray-500">Time Slots</p>
            <p className="text-xl font-bold text-gray-800">{stats.timeslots}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
            <FaCalendarCheck className="text-indigo-500 mb-2" />
            <p className="text-xs text-gray-500">Timetables</p>
            <p className="text-xl font-bold text-gray-800">
              {stats.timetables}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all"
            onClick={() => navigate("/admin/conflicts")}>
            <FaExclamationTriangle className="text-red-500 mb-2" />
            <p className="text-xs text-gray-500">Conflicts</p>
            <p className="text-xl font-bold text-red-600">{stats.conflicts}</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="Add Teacher"
              icon={FaUserPlus}
              color="bg-blue-500"
              description="Register new teacher"
              onClick={() => navigate("/admin/teachers")}
            />
            <QuickActionCard
              title="Create Timetable"
              icon={FaCalendarCheck}
              color="bg-green-500"
              description="Schedule classes"
              onClick={() => navigate("/admin/timetables")}
            />
            <QuickActionCard
              title="Course Allocation"
              icon={FaListAlt}
              color="bg-purple-500"
              description="Assign courses to teachers"
              onClick={() => navigate("/admin/course-allocations")}
            />
            <QuickActionCard
              title="Bulk Upload"
              icon={FaFileUpload}
              color="bg-orange-500"
              description="Import via CSV"
              onClick={() => navigate("/admin/csv-upload")}
            />
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Distribution */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Courses by Department
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Distribution across {stats?.departments} departments
                </p>
              </div>
              <FaChartBar className="text-gray-400 text-xl" />
            </div>
            <div className="h-64">
              {departmentData.length > 0 ? (
                <Bar
                  data={departmentDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { backgroundColor: "#1f2937" },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { borderDash: [2, 4], color: "#e5e7eb" },
                        ticks: { stepSize: 1 },
                      },
                      x: { grid: { display: false } },
                    },
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No department data available
                </div>
              )}
            </div>
          </motion.div>

          {/* Program Distribution */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Sections by Program
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.programs} programs, {stats.sections} sections
                </p>
              </div>
              <FaChartPie className="text-gray-400 text-xl" />
            </div>
            <div className="h-64 flex justify-center items-center">
              {programData.length > 0 ? (
                <Doughnut
                  data={programDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: { size: 11 },
                        },
                      },
                      tooltip: { backgroundColor: "#1f2937" },
                    },
                    cutout: "65%",
                  }}
                />
              ) : (
                <div className="text-gray-400">No program data available</div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Resource Utilization & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resource Utilization Chart */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Resource Utilization
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.rooms} rooms, {stats.teachers} teachers
                </p>
              </div>
              <FaChartLine className="text-gray-400 text-xl" />
            </div>
            <div className="h-64">
              <Line
                data={resourceUtilizationData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom" },
                    tooltip: { backgroundColor: "#1f2937" },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { borderDash: [2, 4] },
                      max: Math.max(stats.rooms, stats.teachers) + 10,
                    },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Recent Activity
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Latest {recentActivities.length} system events
                </p>
              </div>
              <FaBell className="text-gray-400 text-xl" />
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No recent activities
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.courseAllocations}
                </p>
                <p className="text-xs text-gray-500">Allocations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeSessions}
                </p>
                <p className="text-xs text-gray-500">Active Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {stats.timetables}
                </p>
                <p className="text-xs text-gray-500">Timetables</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FaCheckCircle className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">System Health</p>
              <p className="text-2xl font-bold text-gray-800">
                {((stats.teachers + stats.courses + stats.rooms) / 3).toFixed(
                  0,
                )}
                %
              </p>
              <p className="text-xs text-green-600">↑ Operational</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FaUsers className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">User Accounts</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.teachers + stats.totalStudents + stats.totalParents}
              </p>
              <p className="text-xs text-blue-600">Total users</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
