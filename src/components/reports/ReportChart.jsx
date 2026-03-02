import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import api from "../../utils/axiosConfig";

const ReportChart = ({ type }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchChartData();
  }, [type]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      // For demo purposes, generate mock data
      // In production, this would call an API endpoint
      if (type === "workload") {
        const mockData = [
          { name: "Dr. Smith", workload: 18, courses: 4 },
          { name: "Dr. Johnson", workload: 22, courses: 5 },
          { name: "Prof. Williams", workload: 16, courses: 3 },
          { name: "Dr. Brown", workload: 20, courses: 4 },
          { name: "Prof. Davis", workload: 14, courses: 3 },
          { name: "Dr. Miller", workload: 19, courses: 4 },
          { name: "Prof. Wilson", workload: 17, courses: 3 },
        ];
        setData(mockData);
      } else if (type === "utilization") {
        const mockData = [
          { name: "Room A-101", utilization: 85, type: "Lecture Hall" },
          { name: "Room B-202", utilization: 65, type: "Lab" },
          { name: "Room C-303", utilization: 92, type: "Lecture Hall" },
          { name: "Room D-404", utilization: 78, type: "Tutorial" },
          { name: "Room E-505", utilization: 45, type: "Lab" },
          { name: "Room F-606", utilization: 88, type: "Lecture Hall" },
          { name: "Room G-707", utilization: 72, type: "Tutorial" },
        ];
        setData(mockData);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    theme.palette.grey[500],
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 200,
        }}>
        <Typography>Loading chart...</Typography>
      </Box>
    );
  }

  if (type === "workload") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="workload"
            fill={theme.palette.primary.main}
            name="Credit Hours"
          />
          <Bar
            dataKey="courses"
            fill={theme.palette.secondary.main}
            name="Number of Courses"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === "utilization") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="utilization"
            fill={theme.palette.success.main}
            name="Utilization %"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return null;
};

export default ReportChart;
