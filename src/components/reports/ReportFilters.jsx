import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete,
  Chip,
  Typography,
  Paper,
  Button,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import api from "../../utils/axiosConfig";

const ReportFilters = ({ reportType, onFilterChange }) => {
  const [filters, setFilters] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const fetchFilterOptions = async () => {
    setLoading(true);
    try {
      // Fetch academic sessions
      const sessionsRes = await api.get("/academic-sessions");
      setAcademicSessions(sessionsRes.data.data || []);

      // Fetch departments
      const deptRes = await api.get("/departments");
      setDepartments(deptRes.data.data || []);

      // Fetch teachers
      const teachersRes = await api.get("/users?role=teacher");
      setTeachers(teachersRes.data.data || []);

      // Fetch rooms
      const roomsRes = await api.get("/rooms");
      setRooms(roomsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateRangeChange = (start, end) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        startDate: start,
        endDate: end,
      },
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const renderFilterControls = () => {
    switch (reportType) {
      case "teacher_workload":
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Academic Session</InputLabel>
                <Select
                  value={filters.academicSession || ""}
                  label="Academic Session"
                  onChange={(e) =>
                    handleFilterChange("academicSession", e.target.value)
                  }>
                  <MenuItem value="">All Sessions</MenuItem>
                  {academicSessions.map((session) => (
                    <MenuItem key={session._id} value={session._id}>
                      {session.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Semester</InputLabel>
                <Select
                  value={filters.semester || ""}
                  label="Semester"
                  onChange={(e) =>
                    handleFilterChange("semester", e.target.value)
                  }>
                  <MenuItem value="">All Semesters</MenuItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <MenuItem key={sem} value={sem}>
                      Semester {sem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={filters.department || ""}
                  label="Department"
                  onChange={(e) =>
                    handleFilterChange("department", e.target.value)
                  }>
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                size="small"
                options={teachers}
                getOptionLabel={(option) =>
                  `${option.name} (${option.employeeId})`
                }
                value={teachers.find((t) => t._id === filters.teacher) || null}
                onChange={(e, value) =>
                  handleFilterChange("teacher", value?._id)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Teacher (Optional)" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date (Optional)"
                  value={filters.dateRange?.startDate || null}
                  onChange={(date) =>
                    handleDateRangeChange(date, filters.dateRange?.endDate)
                  }
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        );

      case "room_utilization":
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Academic Session</InputLabel>
                <Select
                  value={filters.academicSession || ""}
                  label="Academic Session"
                  onChange={(e) =>
                    handleFilterChange("academicSession", e.target.value)
                  }>
                  <MenuItem value="">All Sessions</MenuItem>
                  {academicSessions.map((session) => (
                    <MenuItem key={session._id} value={session._id}>
                      {session.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Semester</InputLabel>
                <Select
                  value={filters.semester || ""}
                  label="Semester"
                  onChange={(e) =>
                    handleFilterChange("semester", e.target.value)
                  }>
                  <MenuItem value="">All Semesters</MenuItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <MenuItem key={sem} value={sem}>
                      Semester {sem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={filters.dayOfWeek || ""}
                  label="Day of Week"
                  onChange={(e) =>
                    handleFilterChange("dayOfWeek", e.target.value)
                  }>
                  <MenuItem value="">All Days</MenuItem>
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ].map((day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                size="small"
                options={rooms}
                getOptionLabel={(option) => `${option.name} (${option.code})`}
                value={rooms.find((r) => r._id === filters.room) || null}
                onChange={(e, value) => handleFilterChange("room", value?._id)}
                renderInput={(params) => (
                  <TextField {...params} label="Room (Optional)" />
                )}
              />
            </Grid>
          </Grid>
        );

      default:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Academic Session</InputLabel>
                <Select
                  value={filters.academicSession || ""}
                  label="Academic Session"
                  onChange={(e) =>
                    handleFilterChange("academicSession", e.target.value)
                  }>
                  <MenuItem value="">All Sessions</MenuItem>
                  {academicSessions.map((session) => (
                    <MenuItem key={session._id} value={session._id}>
                      {session.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FilterIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1">Filters</Typography>
          {Object.keys(filters).length > 0 && (
            <Chip
              label={`${Object.keys(filters).length} active`}
              size="small"
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        <Box>
          <Button
            size="small"
            onClick={clearFilters}
            disabled={Object.keys(filters).length === 0}>
            Clear All
          </Button>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        {renderFilterControls()}

        {Object.keys(filters).length > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="caption" color="textSecondary">
              Active Filters:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;

                let displayValue = value;

                if (key === "academicSession") {
                  const session = academicSessions.find((s) => s._id === value);
                  displayValue = session ? `Session: ${session.name}` : null;
                } else if (key === "department") {
                  const dept = departments.find((d) => d._id === value);
                  displayValue = dept ? `Dept: ${dept.name}` : null;
                } else if (key === "teacher") {
                  const teacher = teachers.find((t) => t._id === value);
                  displayValue = teacher ? `Teacher: ${teacher.name}` : null;
                } else if (key === "room") {
                  const room = rooms.find((r) => r._id === value);
                  displayValue = room ? `Room: ${room.name}` : null;
                } else if (key === "semester") {
                  displayValue = `Semester: ${value}`;
                } else if (key === "dayOfWeek") {
                  displayValue = `Day: ${value}`;
                } else if (key === "dateRange") {
                  if (value.startDate || value.endDate) {
                    const start = value.startDate
                      ? new Date(value.startDate).toLocaleDateString()
                      : "Any";
                    const end = value.endDate
                      ? new Date(value.endDate).toLocaleDateString()
                      : "Any";
                    displayValue = `Date Range: ${start} - ${end}`;
                  } else {
                    displayValue = null;
                  }
                }

                if (!displayValue) return null;

                return (
                  <Chip
                    key={key}
                    label={displayValue}
                    size="small"
                    onDelete={() => handleFilterChange(key, "")}
                  />
                );
              })}
            </Box>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

export default ReportFilters;
