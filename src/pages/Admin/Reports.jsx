import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Assessment as ReportIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  MeetingRoom as RoomIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { format } from "date-fns";
import api from "../../utils/axiosConfig";
// import LoadingSpinner from "../components/common/LoadingSpinner";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportChart from "../../components/reports/ReportChart";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportTypes, setReportTypes] = useState([
    {
      value: "teacher_workload",
      label: "Teacher Workload",
      icon: <PeopleIcon />,
    },
    {
      value: "room_utilization",
      label: "Room Utilization",
      icon: <RoomIcon />,
    },
    {
      value: "department_wise",
      label: "Department-wise",
      icon: <AssessmentIcon />,
    },
    { value: "program_wise", label: "Program-wise", icon: <ScheduleIcon /> },
    { value: "course_wise", label: "Course-wise", icon: <AssessmentIcon /> },
  ]);
  const [formats, setFormats] = useState([
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
    { value: "pdf", label: "PDF" },
  ]);
  const [selectedReport, setSelectedReport] = useState("teacher_workload");
  const [selectedFormat, setSelectedFormat] = useState("json");
  const [filters, setFilters] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReportData, setSelectedReportData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchReports();
    fetchStatistics();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get("/reports");
      setReports(response.data.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get("/reports/statistics");
      setStatistics(response.data.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const response = await api.post("/reports/generate", {
        type: selectedReport,
        format: selectedFormat,
        filters,
      });

      if (response.data.success) {
        alert("Report generated successfully!");
        fetchReports();

        // If JSON format, show in dialog
        if (selectedFormat === "json") {
          setSelectedReportData(response.data.data);
          setDialogOpen(true);
        } else {
          // For PDF/CSV, trigger download
          window.open(
            `${process.env.REACT_APP_API_URL}${response.data.data.downloadUrl}`,
            "_blank",
          );
        }
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId) => {
    try {
      const response = await api.get(`/reports/download/${reportId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await api.delete(`/reports/${reportId}`);
        fetchReports();
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
  };

  const handleViewReport = (report) => {
    setSelectedReportData(report);
    setDialogOpen(true);
  };

  const columns = [
    { field: "title", headerName: "Title", flex: 2 },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value.replace("_", " ")}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: "format",
      headerName: "Format",
      flex: 0.5,
      renderCell: (params) => (
        <Chip
          label={params.value.toUpperCase()}
          size="small"
          color="secondary"
        />
      ),
    },
    {
      field: "generatedAt",
      headerName: "Generated",
      flex: 1,
      valueGetter: (params) =>
        format(new Date(params.value), "MMM dd, yyyy HH:mm"),
    },
    {
      field: "generatedBy",
      headerName: "Generated By",
      flex: 1,
      valueGetter: (params) => params.value?.name || "N/A",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          {params.row.filePath && (
            <IconButton
              size="small"
              onClick={() => handleDownload(params.row._id)}
              title="Download">
              <DownloadIcon />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => handleViewReport(params.row)}
            title="View Details">
            <ViewIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteReport(params.row._id)}
            title="Delete"
            color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Reports
        </Typography>

        <Grid container spacing={3}>
          {/* Statistics Cards */}
          {statistics && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Report Statistics (Last 30 Days)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Reports
                        </Typography>
                        <Typography variant="h4">
                          {statistics.totalReports}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  {statistics.byType.map((stat) => (
                    <Grid item xs={12} md={3} key={stat.type}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            {stat.type.replace("_", " ")}
                          </Typography>
                          <Typography variant="h5">{stat.count}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Last:{" "}
                            {format(new Date(stat.lastGenerated), "MMM dd")}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Report Generator */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Generate New Report
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Report Type</InputLabel>
                      <Select
                        value={selectedReport}
                        label="Report Type"
                        onChange={(e) => setSelectedReport(e.target.value)}>
                        {reportTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {type.icon}
                              <Box sx={{ ml: 1 }}>{type.label}</Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Output Format</InputLabel>
                      <Select
                        value={selectedFormat}
                        label="Output Format"
                        onChange={(e) => setSelectedFormat(e.target.value)}>
                        {formats.map((format) => (
                          <MenuItem key={format.value} value={format.value}>
                            {format.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <ReportFilters
                      reportType={selectedReport}
                      onFilterChange={setFilters}
                    />
                  </Grid>
                </Grid>
              </CardContent>

              <CardActions>
                <Button
                  variant="contained"
                  onClick={handleGenerateReport}
                  disabled={generating}
                  startIcon={generating ? <RefreshIcon /> : <ReportIcon />}>
                  {generating ? "Generating..." : "Generate Report"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedFormat("pdf")}
                  startIcon={<PdfIcon />}>
                  Generate PDF
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedFormat("csv")}
                  startIcon={<CsvIcon />}>
                  Generate CSV
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Statistics
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Teacher Workload Distribution
                  </Typography>
                  <ReportChart type="workload" />
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    Room Utilization Rates
                  </Typography>
                  <ReportChart type="utilization" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Generated Reports List */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}>
                  <Typography variant="h6">Generated Reports</Typography>
                  <Button startIcon={<RefreshIcon />} onClick={fetchReports}>
                    Refresh
                  </Button>
                </Box>

                <Box sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    rows={reports}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    getRowId={(row) => row._id}
                    loading={loading}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Report Details Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="lg"
          fullWidth>
          <DialogTitle>
            Report Details
            {selectedReportData?.title && ` - ${selectedReportData.title}`}
          </DialogTitle>

          <DialogContent>
            {selectedReportData && (
              <Box>
                <Tabs
                  value={tabValue}
                  onChange={(e, newValue) => setTabValue(newValue)}>
                  <Tab label="Summary" />
                  <Tab label="Data" />
                  <Tab label="Filters" />
                  <Tab label="Metadata" />
                </Tabs>

                <Box sx={{ mt: 2 }}>
                  {tabValue === 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Report Summary
                      </Typography>
                      {selectedReportData.data?.summary && (
                        <Grid container spacing={2}>
                          {Object.entries(selectedReportData.data.summary).map(
                            ([key, value]) => (
                              <Grid item xs={6} md={3} key={key}>
                                <Paper sx={{ p: 2, textAlign: "center" }}>
                                  <Typography variant="caption" display="block">
                                    {key
                                      .replace(/([A-Z])/g, " $1")
                                      .toUpperCase()}
                                  </Typography>
                                  <Typography variant="h6">
                                    {typeof value === "number"
                                      ? value.toLocaleString()
                                      : value}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ),
                          )}
                        </Grid>
                      )}
                    </Box>
                  )}

                  {tabValue === 1 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Report Data
                      </Typography>
                      {selectedReportData.type === "teacher_workload" && (
                        <TeacherWorkloadTable data={selectedReportData.data} />
                      )}
                      {selectedReportData.type === "room_utilization" && (
                        <RoomUtilizationTable data={selectedReportData.data} />
                      )}
                    </Box>
                  )}

                  {tabValue === 2 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Applied Filters
                      </Typography>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Filter</TableCell>
                              <TableCell>Value</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedReportData.filters &&
                              Object.entries(selectedReportData.filters).map(
                                ([key, value]) => (
                                  <TableRow key={key}>
                                    <TableCell>{key}</TableCell>
                                    <TableCell>
                                      {typeof value === "object"
                                        ? JSON.stringify(value)
                                        : String(value)}
                                    </TableCell>
                                  </TableRow>
                                ),
                              )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {tabValue === 3 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Report Metadata
                      </Typography>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell>Report ID</TableCell>
                              <TableCell>{selectedReportData._id}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Generated By</TableCell>
                              <TableCell>
                                {selectedReportData.generatedBy?.name}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Generation Date</TableCell>
                              <TableCell>
                                {format(
                                  new Date(selectedReportData.generatedAt),
                                  "PPpp",
                                )}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Format</TableCell>
                              <TableCell>
                                <Chip
                                  label={selectedReportData.format.toUpperCase()}
                                  size="small"
                                  color="secondary"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Status</TableCell>
                              <TableCell>
                                <Chip
                                  label={selectedReportData.status}
                                  size="small"
                                  color={
                                    selectedReportData.status === "completed"
                                      ? "success"
                                      : "warning"
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            {selectedReportData?.filePath && (
              <Button
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload(selectedReportData._id)}>
                Download {selectedReportData.format.toUpperCase()}
              </Button>
            )}
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

// Teacher Workload Table Component
const TeacherWorkloadTable = ({ data }) => {
  if (!data?.teachers) return null;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Teacher</TableCell>
            <TableCell align="right">Department</TableCell>
            <TableCell align="right">Courses</TableCell>
            <TableCell align="right">Credit Hours</TableCell>
            <TableCell align="right">Avg. Workload</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.teachers.map((teacher) => (
            <TableRow key={teacher.teacherId}>
              <TableCell>
                <Typography variant="subtitle2">
                  {teacher.teacherName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {teacher.teacherId}
                </Typography>
              </TableCell>
              <TableCell align="right">{teacher.departmentName}</TableCell>
              <TableCell align="right">{teacher.totalCourses}</TableCell>
              <TableCell align="right">{teacher.totalCreditHours}</TableCell>
              <TableCell align="right">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}>
                  <Box sx={{ width: "60px", mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(
                        (teacher.averageWorkload / 20) * 100,
                        100,
                      )}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  {teacher.averageWorkload.toFixed(1)}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Room Utilization Table Component
const RoomUtilizationTable = ({ data }) => {
  if (!data?.rooms) return null;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Room</TableCell>
            <TableCell align="right">Type</TableCell>
            <TableCell align="right">Capacity</TableCell>
            <TableCell align="right">Total Slots</TableCell>
            <TableCell align="right">Utilization Rate</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.rooms.map((room) => (
            <TableRow key={room.roomId}>
              <TableCell>
                <Typography variant="subtitle2">{room.roomName}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {room.roomCode}
                </Typography>
              </TableCell>
              <TableCell align="right">{room.roomType}</TableCell>
              <TableCell align="right">{room.capacity}</TableCell>
              <TableCell align="right">{room.totalSlots}</TableCell>
              <TableCell align="right">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}>
                  <Box sx={{ width: "60px", mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={room.utilizationRate}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  {room.utilizationRate.toFixed(1)}%
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Reports;
