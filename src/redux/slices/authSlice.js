import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Create axios instance with default headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add a request interceptor to include token in every request
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsedUserInfo = JSON.parse(userInfo);
      if (parsedUserInfo.token) {
        config.headers.Authorization = `Bearer ${parsedUserInfo.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      // Store token in localStorage
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Also store token separately for easy access
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("userInfo");
  localStorage.removeItem("token");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.userInfo = null;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
