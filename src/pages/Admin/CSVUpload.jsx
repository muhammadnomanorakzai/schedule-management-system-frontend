import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaFileUpload,
  FaFileCsv,
  FaDownload,
  FaHistory,
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
  FaEye,
  FaFileExcel,
  FaUpload,
  FaCogs,
  FaExclamationTriangle,
  FaClock,
  FaUsers,
  FaBuilding,
  FaCalendarAlt,
  FaListAlt,
  FaSearch,
} from "react-icons/fa";

const CSVUpload = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadType, setUploadType] = useState("course_allocations");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    academicSession: "",
    semester: "",
    program: "",
    notes: "",
  });

  // Upload history
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [stats, setStats] = useState({});

  // Conflict detection
  const [conflicts, setConflicts] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [showConflictsModal, setShowConflictsModal] = useState(false);
  const [detailsTab, setDetailsTab] = useState("details");
  const [uploadConflicts, setUploadConflicts] = useState([]);
  const [showUploadConflictsModal, setShowUploadConflictsModal] =
    useState(false);
  const [conflictData, setConflictData] = useState(null);

  // Dropdown data
  const [uploadTypes, setUploadTypes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [programs, setPrograms] = useState([]);

  // Templates
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    fetchDropdownData();
    fetchUploadTypes();
    if (activeTab === "history") {
      fetchUploadHistory();
      fetchStats();
    }
  }, [activeTab]);

  useEffect(() => {
    if (uploadType) {
      fetchTemplate(uploadType);
    }
  }, [uploadType]);

  const fetchDropdownData = async () => {
    try {
      // Fetch academic sessions
      const sessionsRes = await api.get("/academic-sessions");
      setSessions(sessionsRes.data);

      // Fetch programs
      const programsRes = await api.get("/programs");
      setPrograms(programsRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const fetchUploadTypes = async () => {
    try {
      const { data } = await api.get("/csv/upload-types");
      setUploadTypes(data.data);
    } catch (error) {
      console.error("Error fetching upload types:", error);
    }
  };

  const fetchUploadHistory = async () => {
    try {
      const { data } = await api.get("/csv/uploads?limit=20");
      setUploads(data.data || []);

      if (data.stats) {
        setStats((prev) => ({
          ...prev,
          summary: data.stats,
        }));
      }
    } catch (error) {
      console.error("Error fetching upload history:", error);
      setUploads([]);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/csv/stats");
      setStats(data.data || {});
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({});
    }
  };

  const fetchTemplate = async (type) => {
    try {
      const { data } = await api.get(`/csv/template/${type}`);
      setTemplate(data.data);
    } catch (error) {
      console.error("Error fetching template:", error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        toast.error("Please select a CSV file");
        return;
      }
      setFile(selectedFile);
      setValidationResult(null);
      setConflicts(null);
      setUploadConflicts([]);
    }
  };

  const handleValidateCSV = async () => {
    if (!file) {
      toast.error("Please select a CSV file first");
      return;
    }

    setValidating(true);
    const formData = new FormData();
    formData.append("csvFile", file);
    formData.append("uploadType", uploadType);

    try {
      const { data } = await api.post("/csv/validate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setValidationResult(data.data);

      if (data.data.isValid) {
        toast.success("CSV validation passed!");
      } else {
        toast.error(
          `Validation failed: ${data.data.validationErrors.length} errors found`,
        );
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setValidating(false);
    }
  };

  const handleDetectConflicts = async () => {
    if (!file || !uploadType) {
      toast.error("Please select a file and upload type first");
      return;
    }

    if (uploadType !== "schedule_entries") {
      toast.error("Conflict detection is only available for schedule entries");
      return;
    }

    setDetecting(true);
    const formDataObj = new FormData();
    formDataObj.append("csvFile", file);
    formDataObj.append("uploadType", uploadType);

    if (formData.academicSession) {
      formDataObj.append("academicSession", formData.academicSession);
    }
    if (formData.semester) {
      formDataObj.append("semester", formData.semester);
    }
    if (formData.program) {
      formDataObj.append("program", formData.program);
    }

    try {
      const { data } = await api.post("/csv/analyze-conflicts", formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setConflicts(data.data);
      toast.success(
        `Detected ${data.data.summary.totalConflicts} potential conflicts`,
      );
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setDetecting(false);
    }
  };

  const handleUploadCSV = async () => {
    if (!file) {
      toast.error("Please select a CSV file first");
      return;
    }

    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append("csvFile", file);
    formDataObj.append("uploadType", uploadType);

    if (formData.academicSession) {
      formDataObj.append("academicSession", formData.academicSession);
    }
    if (formData.semester) {
      formDataObj.append("semester", formData.semester);
    }
    if (formData.program) {
      formDataObj.append("program", formData.program);
    }

    try {
      const { data } = await api.post("/csv/upload", formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(
        `Upload processed: ${data.results.successful} successful, ${data.results.failed} failed`,
      );

      // Check for conflicts in response
      if (data.createdConflicts && data.createdConflicts.length > 0) {
        setUploadConflicts(data.createdConflicts);
        setShowUploadConflictsModal(true);
        toast.warning(
          `⚠️ ${data.createdConflicts.length} conflicts detected after upload`,
        );
      } else if (data.conflictDetection?.totalConflicts > 0) {
        toast.warning(
          `⚠️ ${data.conflictDetection.totalConflicts} conflicts detected after upload`,
        );
      }

      // Reset form
      setFile(null);
      setValidationResult(null);
      setConflicts(null);
      setFormData({
        academicSession: "",
        semester: "",
        program: "",
        notes: "",
      });

      // Switch to history tab and refresh
      setActiveTab("history");
      fetchUploadHistory();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get(`/csv/template/${uploadType}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `template_${uploadType}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Template downloaded successfully");
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleRetryUpload = async (uploadId) => {
    try {
      await api.post(`/csv/uploads/${uploadId}/retry`);
      toast.success("Upload retry initiated");
      fetchUploadHistory();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const handleViewUpload = async (upload) => {
    try {
      // First get upload details
      const { data: uploadData } = await api.get(`/csv/uploads/${upload._id}`);
      setSelectedUpload(uploadData.data);

      // If it's a schedule upload, get conflicts
      if (upload.uploadType === "schedule_entries") {
        try {
          const { data: conflictData } = await api.get(
            `/csv/uploads/${upload._id}/conflicts`,
          );
          // Store conflict data
          setConflictData(conflictData.data);
        } catch (conflictError) {
          console.log("No conflict data available", conflictError);
          setConflictData(null);
        }
      }

      setDetailsTab("details");
    } catch (error) {
      toast.error("Failed to fetch upload details");
      console.error("Error:", error.response?.data);
    }
  };

  const getUploadTypeIcon = (type) => {
    switch (type) {
      case "schedule_entries":
        return <FaClock className="text-purple-600" />;
    }
  };

  const getUploadTypeName = (type) => {
    const typeInfo = uploadTypes.find((t) => t.type === type);
    return typeInfo ? typeInfo.name : type.replace(/_/g, " ");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      uploaded: { color: "bg-blue-100 text-blue-800", label: "Uploaded" },
      processing: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Processing",
      },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      failed: { color: "bg-red-100 text-red-800", label: "Failed" },
      partial_success: {
        color: "bg-orange-100 text-orange-800",
        label: "Partial Success",
      },
    };

    const config = statusConfig[status] || statusConfig.uploaded;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const ConflictAnalysisDisplay = () => {
    if (!conflicts) return null;

    return (
      <div className="mt-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-600" />
            <h4 className="font-semibold text-yellow-800">
              Conflict Analysis Results
            </h4>
          </div>
          <button
            onClick={() => setShowConflictsModal(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View Details →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-3 rounded border">
            <div className="text-sm text-gray-600">Total Rows</div>
            <div className="text-lg font-bold">
              {conflicts.summary?.totalRows || 0}
            </div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="text-sm text-gray-600">Rows with Conflicts</div>
            <div className="text-lg font-bold text-red-600">
              {conflicts.summary?.rowsWithConflicts || 0}
            </div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="text-sm text-gray-600">Teacher Conflicts</div>
            <div className="text-lg font-bold text-orange-600">
              {conflicts.summary?.conflictTypes?.teacher || 0}
            </div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="text-sm text-gray-600">Room Conflicts</div>
            <div className="text-lg font-bold text-purple-600">
              {conflicts.summary?.conflictTypes?.room || 0}
            </div>
          </div>
        </div>

        {conflicts.summary?.rowsWithConflicts > 0 && (
          <div className="text-sm text-yellow-700">
            ⚠️ Some rows have conflicts. Review them before uploading.
          </div>
        )}
      </div>
    );
  };

  // Add this component to show conflicts after upload
  const UploadConflictDisplay = () => {
    if (uploadConflicts.length === 0) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              ⚠️ Conflicts Detected After Upload
            </h2>
            <button
              onClick={() => setShowUploadConflictsModal(false)}
              className="text-gray-400 hover:text-gray-600">
              <FaTimesCircle size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {uploadConflicts.map((conflict, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  conflict.severity === "critical"
                    ? "border-red-300 bg-red-50"
                    : "border-yellow-300 bg-yellow-50"
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <FaExclamationTriangle
                    className={
                      conflict.severity === "critical"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }
                  />
                  <span className="font-semibold">
                    {conflict.type === "teacher_schedule"
                      ? "Teacher Conflict"
                      : "Room Conflict"}
                  </span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs ${
                      conflict.severity === "critical"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {conflict.severity}
                  </span>
                </div>
                <p className="text-gray-700">{conflict.description}</p>
                <div className="mt-2 text-sm text-gray-600">
                  Timetable: {conflict.timetable?.name || "Unknown"}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setShowUploadConflictsModal(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50">
              Close
            </button>
            <button
              onClick={() => {
                // Navigate to conflicts page
                window.location.href = "/conflicts";
                setShowUploadConflictsModal(false);
              }}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
              View All Conflicts
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FaFileUpload /> CSV Bulk Upload
            </h1>
            <p className="text-gray-600 mt-1">
              Upload CSV files for bulk scheduling operations
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-4 text-center font-medium text-sm ${
                activeTab === "upload"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}>
              <FaUpload className="inline mr-2" /> Upload CSV
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-4 text-center font-medium text-sm ${
                activeTab === "history"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}>
              <FaHistory className="inline mr-2" /> Upload History
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 py-4 text-center font-medium text-sm ${
                activeTab === "stats"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}>
              <FaChartBar className="inline mr-2" /> Statistics
            </button>
          </div>
        </div>

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Upload Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Upload CSV File
                </h2>

                {/* Step 1: Select Upload Type */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <FaCogs /> Step 1: Select Upload Type
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {uploadTypes.map((type) => (
                      <div
                        key={type.type}
                        onClick={() => setUploadType(type.type)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          uploadType === type.type
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        }`}>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg">
                            {getUploadTypeIcon(type.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {type.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {type.description}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              <FaClock className="inline mr-1" />{" "}
                              {type.estimatedTime} •
                              <FaFileExcel className="inline ml-3 mr-1" />{" "}
                              {type.sampleSize}
                            </div>
                          </div>
                          {uploadType === type.type && (
                            <FaCheckCircle className="text-green-500 text-xl mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 2: Upload File */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <FaFileUpload /> Step 2: Upload CSV File
                  </h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
                    <FaFileCsv className="text-4xl text-gray-400 mx-auto mb-4" />

                    {file ? (
                      <div>
                        <div className="font-medium text-gray-900 mb-2">
                          {file.name}
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                          {formatFileSize(file.size)} • Last modified:{" "}
                          {new Date(file.lastModified).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => setFile(null)}
                          className="text-red-600 hover:text-red-800 text-sm">
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600 mb-4">
                          Drag & drop your CSV file here, or click to browse
                        </p>
                        <label className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                          <FaUpload className="inline mr-2" /> Browse Files
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-4">
                          Maximum file size: 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Additional Information */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <FaExclamationTriangle /> Step 3: Additional Information
                    (Optional)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Academic Session
                      </label>
                      <select
                        value={formData.academicSession}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            academicSession: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                        <option value="">Select Session (Optional)</option>
                        {sessions.map((session) => (
                          <option key={session._id} value={session._id}>
                            {session.name} ({session.year})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Semester
                      </label>
                      <select
                        value={formData.semester}
                        onChange={(e) =>
                          setFormData({ ...formData, semester: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                        <option value="">Select Semester (Optional)</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Program
                      </label>
                      <select
                        value={formData.program}
                        onChange={(e) =>
                          setFormData({ ...formData, program: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                        <option value="">Select Program (Optional)</option>
                        {programs.map((program) => (
                          <option key={program._id} value={program._id}>
                            {program.code} - {program.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Conflict Detection Button */}
                {file && uploadType === "schedule_entries" && (
                  <button
                    onClick={handleDetectConflicts}
                    disabled={detecting}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-4">
                    {detecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Detecting Conflicts...
                      </>
                    ) : (
                      <>
                        <FaSearch /> Detect Conflicts Before Upload
                      </>
                    )}
                  </button>
                )}

                {/* Conflict Analysis Display */}
                <ConflictAnalysisDisplay />

                {/* Action Buttons */}
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleValidateCSV}
                    disabled={!file || validating}
                    className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {validating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Validating...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle /> Validate CSV
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleUploadCSV}
                    disabled={!file || uploading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaUpload /> Upload & Process
                      </>
                    )}
                  </button>
                </div>

                {/* Validation Results */}
                {validationResult && (
                  <div
                    className={`mt-6 p-4 rounded-lg ${
                      validationResult.isValid
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {validationResult.isValid ? (
                        <FaCheckCircle className="text-green-600" />
                      ) : (
                        <FaTimesCircle className="text-red-600" />
                      )}
                      <span className="font-medium">
                        {validationResult.isValid
                          ? "Validation Passed"
                          : "Validation Failed"}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="mb-1">
                        Rows: {validationResult.rowCount}
                      </div>
                      {validationResult.validationErrors.length > 0 && (
                        <div>
                          <div className="font-medium mb-1">Errors:</div>
                          <ul className="list-disc pl-5 space-y-1">
                            {validationResult.validationErrors.map(
                              (error, index) => (
                                <li key={index} className="text-red-700">
                                  Row {error.row}: {error.message}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Template Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaFileCsv /> CSV Template
                </h3>

                {template ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Required Columns:
                      </div>
                      <div className="space-y-1">
                        {template.columns.map((column, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className={`text-xs px-2 py-1 rounded ${
                                template.required.includes(column)
                                  ? "bg-red-100 text-red-800 font-medium"
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                              {column}
                            </div>
                            {template.required.includes(column) && (
                              <span className="text-xs text-red-600 font-medium">
                                Required
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Sample Data:
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="bg-gray-100">
                              {template.columns.map((column, index) => (
                                <th
                                  key={index}
                                  className="px-2 py-1 text-left font-medium text-gray-700">
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {template.sampleData.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {template.columns.map((column, colIndex) => (
                                  <td
                                    key={colIndex}
                                    className="px-2 py-1 border-t border-gray-200">
                                    {row[column] || ""}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <button
                      onClick={handleDownloadTemplate}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      <FaDownload /> Download Template
                    </button>

                    <div className="text-xs text-gray-500 mt-4">
                      <p className="font-medium mb-1">
                        Tips for successful upload:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Use the exact column names from the template</li>
                        <li>Ensure required columns are not empty</li>
                        <li>Use valid values for each field</li>
                        <li>Save file as UTF-8 encoded CSV</li>
                        <li>Maximum file size: 10MB</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading template...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-6">
            {/* Stats Summary */}
            {stats.summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="text-sm text-gray-600">Total Uploads</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {stats.summary.totalUploads || 0}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="text-sm text-gray-600">Successful</div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.summary.successfulUploads || 0}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="text-sm text-gray-600">Failed</div>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.summary.failedUploads || 0}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.summary.successRate || 0}%
                  </div>
                </div>
              </div>
            )}

            {/* Upload History Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Uploads
                </h3>
              </div>

              {uploads.length === 0 ? (
                <div className="p-8 text-center">
                  <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Upload History
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Upload your first CSV file to see history here
                  </p>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Go to Upload
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Upload
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Results
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {uploads.map((upload) => (
                        <tr key={upload._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                {getUploadTypeIcon(upload.uploadType)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {getUploadTypeName(upload.uploadType)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(
                                    upload.createdAt,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {upload.originalName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatFileSize(upload.fileSize)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(upload.status)}
                            <div className="text-xs text-gray-500 mt-1">
                              Progress: {upload.progress}%
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="text-green-600">
                                ✓ {upload.successfulRecords || 0}
                              </div>
                              <div className="text-red-600">
                                ✗ {upload.failedRecords || 0}
                              </div>
                              <div className="text-gray-600">
                                Total: {upload.totalRecords || 0}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleViewUpload(upload)}
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs">
                                <FaEye /> Details
                              </button>

                              {(upload.status === "failed" ||
                                upload.status === "partial_success") && (
                                <button
                                  onClick={() => handleRetryUpload(upload._id)}
                                  className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs">
                                  <FaSync /> Retry
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {/* Overall Statistics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Overall Statistics
              </h3>

              {stats.stats && stats.stats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.stats.map((stat, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium text-gray-900">
                          {getUploadTypeName(stat._id)}
                        </div>
                        {getUploadTypeIcon(stat._id)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Uploads:</span>
                          <span className="font-medium">
                            {stat.totalUploads}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Records:</span>
                          <span className="font-medium">
                            {stat.totalRecords}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Success Rate:</span>
                          <span className="font-medium text-green-600">
                            {stat.avgSuccessRate
                              ? stat.avgSuccessRate.toFixed(1)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No statistics available yet
                </div>
              )}
            </div>

            {/* Recent Uploads */}
            {stats.recentUploads && stats.recentUploads.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">
                  Recent Uploads
                </h3>
                <div className="space-y-4">
                  {stats.recentUploads.slice(0, 5).map((upload) => (
                    <div
                      key={upload._id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        {getUploadTypeIcon(upload.uploadType)}
                        <div>
                          <div className="font-medium text-gray-900">
                            {getUploadTypeName(upload.uploadType)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(upload.createdAt).toLocaleDateString()} •{" "}
                            {upload.originalName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div
                            className={`font-medium ${
                              upload.status === "completed"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}>
                            {getStatusBadge(upload.status)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {upload.successfulRecords || 0}/
                            {upload.totalRecords || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Details Modal */}
        {selectedUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Upload Details -{" "}
                  {getUploadTypeName(selectedUpload.uploadType)}
                </h2>
                <button
                  onClick={() => setSelectedUpload(null)}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimesCircle size={24} />
                </button>
              </div>

              {/* Add tabs for details and conflicts */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setDetailsTab("details")}
                    className={`py-3 px-4 font-medium ${
                      detailsTab === "details"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}>
                    <FaFileUpload className="inline mr-2" />
                    Upload Details
                  </button>
                  {selectedUpload.uploadType === "schedule_entries" && (
                    <button
                      onClick={() => setDetailsTab("conflicts")}
                      className={`py-3 px-4 font-medium ${
                        detailsTab === "conflicts"
                          ? "border-b-2 border-red-500 text-red-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}>
                      <FaExclamationTriangle className="inline mr-2" />
                      Conflict Analysis
                    </button>
                  )}
                </nav>
              </div>

              {detailsTab === "details" ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Upload Type</div>
                        <div className="font-medium">
                          {getUploadTypeName(selectedUpload.uploadType)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Filename</div>
                        <div className="font-medium">
                          {selectedUpload.originalName}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">File Size</div>
                        <div className="font-medium">
                          {formatFileSize(selectedUpload.fileSize)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Status</div>
                        <div>{getStatusBadge(selectedUpload.status)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Uploaded By</div>
                        <div className="font-medium">
                          {selectedUpload.uploadedBy?.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Uploaded At</div>
                        <div className="font-medium">
                          {new Date(selectedUpload.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Results Summary */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">
                      Results Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-800">
                          {selectedUpload.totalRecords}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Records
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedUpload.successfulRecords}
                        </div>
                        <div className="text-sm text-green-600">Successful</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {selectedUpload.failedRecords}
                        </div>
                        <div className="text-sm text-red-600">Failed</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedUpload.totalRecords > 0
                            ? (
                                (selectedUpload.successfulRecords /
                                  selectedUpload.totalRecords) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </div>
                        <div className="text-sm text-blue-600">
                          Success Rate
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Errors */}
                  {selectedUpload.errors &&
                    selectedUpload.errors.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-3">
                          Errors ({selectedUpload.errors.length})
                        </h3>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="border-b border-red-200">
                                <th className="px-3 py-2 text-left font-medium text-red-800">
                                  Row
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-red-800">
                                  Column
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-red-800">
                                  Error
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-red-800">
                                  Message
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedUpload.errors.map((error, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-red-100 last:border-0">
                                  <td className="px-3 py-2">{error.row}</td>
                                  <td className="px-3 py-2">{error.column}</td>
                                  <td className="px-3 py-2">{error.error}</td>
                                  <td className="px-3 py-2">{error.message}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Processing Logs */}
                  {selectedUpload.processingLogs &&
                    selectedUpload.processingLogs.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-3">
                          Processing Logs
                        </h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                          <div className="space-y-2">
                            {selectedUpload.processingLogs.map((log, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3">
                                <div
                                  className={`w-2 h-2 rounded-full mt-2 ${
                                    log.level === "error"
                                      ? "bg-red-500"
                                      : log.level === "warning"
                                        ? "bg-yellow-500"
                                        : log.level === "success"
                                          ? "bg-green-500"
                                          : "bg-blue-500"
                                  }`}></div>
                                <div className="flex-1">
                                  <div className="text-sm">{log.message}</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(
                                      log.timestamp,
                                    ).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setSelectedUpload(null)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                      Close
                    </button>
                    {(selectedUpload.status === "failed" ||
                      selectedUpload.status === "partial_success") && (
                      <button
                        onClick={() => {
                          handleRetryUpload(selectedUpload._id);
                          setSelectedUpload(null);
                        }}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                        Retry Upload
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {conflictData ? (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-3">
                          Conflict Summary
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {conflictData.summary?.totalTimetables || 0}
                            </div>
                            <div className="text-sm text-gray-600">
                              Timetables
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {conflictData.summary?.timetablesWithConflicts ||
                                0}
                            </div>
                            <div className="text-sm text-gray-600">
                              With Conflicts
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {conflictData.summary?.totalConflicts || 0}
                            </div>
                            <div className="text-sm text-gray-600">
                              Total Conflicts
                            </div>
                          </div>
                        </div>
                      </div>

                      {conflictData.timetableConflicts &&
                      conflictData.timetableConflicts.length > 0 ? (
                        <div>
                          <h3 className="font-medium text-gray-700 mb-3">
                            Detailed Conflicts
                          </h3>
                          <div className="space-y-4">
                            {conflictData.timetableConflicts.map(
                              (tc, index) => (
                                <div
                                  key={index}
                                  className="border border-gray-200 rounded-lg p-4">
                                  <div className="flex justify-between items-center mb-3">
                                    <div>
                                      <h4 className="font-medium text-gray-900">
                                        {tc.timetable.name} (
                                        {tc.timetable.section})
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {tc.count} conflict
                                        {tc.count !== 1 ? "s" : ""} detected
                                      </p>
                                    </div>
                                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                      {tc.count} Conflict
                                      {tc.count !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  <div className="space-y-3">
                                    {tc.conflicts.map((conflict, cIndex) => (
                                      <div
                                        key={cIndex}
                                        className={`p-3 rounded border-l-4 ${
                                          conflict.severity === "critical"
                                            ? "border-red-500 bg-red-50"
                                            : "border-yellow-500 bg-yellow-50"
                                        }`}>
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="font-medium text-gray-900">
                                              {conflict.type ===
                                              "teacher_schedule"
                                                ? "Teacher Conflict"
                                                : "Room Conflict"}
                                            </p>
                                            <p className="text-sm text-gray-700 mt-1">
                                              {conflict.description}
                                            </p>
                                          </div>
                                          <span
                                            className={`px-2 py-1 rounded text-xs font-bold ${
                                              conflict.severity === "critical"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {conflict.severity}
                                          </span>
                                        </div>
                                        {conflict.teacher && (
                                          <p className="text-sm text-gray-600 mt-2">
                                            Teacher: {conflict.teacher.name} (
                                            {conflict.teacher.email})
                                          </p>
                                        )}
                                        {conflict.room && (
                                          <p className="text-sm text-gray-600 mt-1">
                                            Room: {conflict.room.roomNumber} (
                                            {conflict.room.name})
                                          </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">
                                          Detected:{" "}
                                          {new Date(
                                            conflict.createdAt,
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FaCheckCircle className="text-4xl text-green-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No Conflicts Found
                          </h3>
                          <p className="text-gray-500">
                            This upload did not create any schedule conflicts.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <FaExclamationTriangle className="text-4xl text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Conflict Analysis
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Loading conflict data for this upload...
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            const { data } = await api.get(
                              `/csv/uploads/${selectedUpload._id}/conflicts`,
                            );
                            setConflictData(data.data);
                            toast.success("Conflict data loaded");
                          } catch (error) {
                            toast.error("Failed to load conflict data");
                          }
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        Load Conflict Data
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Pre-Upload Conflicts Details Modal */}
        {showConflictsModal && conflicts && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Conflict Analysis Report
                </h2>
                <button
                  onClick={() => setShowConflictsModal(false)}
                  className="text-gray-400 hover:text-gray-600">
                  <FaTimesCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Analysis Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {conflicts.summary?.totalRows || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Rows</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {conflicts.summary?.rowsWithConflicts || 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        Rows with Conflicts
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {conflicts.summary?.conflictTypes?.teacher || 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        Teacher Conflicts
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {conflicts.summary?.conflictTypes?.room || 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        Room Conflicts
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Conflicts */}
                {conflicts.conflicts && conflicts.conflicts.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">
                      Detailed Conflicts
                    </h3>
                    <div className="space-y-3">
                      {conflicts.conflicts.map((conflict, index) => (
                        <div
                          key={index}
                          className={`border rounded-lg p-4 ${
                            conflict.type === "teacher_conflict"
                              ? "border-red-200 bg-red-50"
                              : "border-purple-200 bg-purple-50"
                          }`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium text-gray-900">
                                Row {conflict.row}:{" "}
                                {conflict.type === "teacher_conflict"
                                  ? `Teacher Conflict - ${conflict.teacher}`
                                  : `Room Conflict - ${conflict.room}`}
                              </div>
                              <div className="text-sm text-gray-600">
                                {conflict.type === "teacher_conflict"
                                  ? "Teacher has overlapping schedule"
                                  : "Room is double-booked"}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                conflict.type === "teacher_conflict"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}>
                              {conflict.type === "teacher_conflict"
                                ? "Teacher"
                                : "Room"}
                            </span>
                          </div>
                          {conflict.conflicts &&
                            conflict.conflicts.map((c, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-gray-700 mt-2 pl-4 border-l-2 border-gray-300">
                                {c.message || "Conflict detected"}
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {conflicts.recommendations && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">
                      Recommendations
                    </h3>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <ul className="space-y-2">
                        {conflicts.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowConflictsModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Close
                  </button>
                  {conflicts.summary?.rowsWithConflicts === 0 && (
                    <button
                      onClick={() => {
                        setShowConflictsModal(false);
                        handleUploadCSV();
                      }}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                      Proceed with Upload
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Post-Upload Conflicts Display */}
        {showUploadConflictsModal && <UploadConflictDisplay />}
      </div>
    </div>
  );
};

export default CSVUpload;
