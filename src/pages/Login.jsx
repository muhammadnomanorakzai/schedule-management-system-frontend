import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../redux/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiLogIn,
  FiEye,
  FiEyeOff,
  FiArrowRight,
} from "react-icons/fi";
import FloatingBackground from "../components/FloatingBackground";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isFocused, setIsFocused] = useState({ email: false, password: false });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  // Form validation
  const validateForm = () => {
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Password validation
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  useEffect(() => {
    if (userInfo) {
      const roleRoutes = {
        Admin: "/admin/dashboard",
        Teacher: "/teacher/dashboard",
        Student: "/student/dashboard",
      };

      const route = roleRoutes[userInfo.role];
      if (route) {
        navigate(route);
      } else {
        console.error("Unknown role in userInfo:", userInfo);
        dispatch(logout());
      }
    }
  }, [userInfo, navigate, dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(login({ email, password }));
    }
  };

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (field === "email") setEmailError("");
    if (field === "password") setPasswordError("");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Animated background */}
      <FloatingBackground />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4">
        {/* Logo or Brand */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-purple-200">Sign in to continue your journey</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </motion.div>
          )}

          <form onSubmit={submitHandler} className="space-y-6">
            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-purple-300" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={handleInputChange(setEmail, "email")}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, email: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, email: false }))
                  }
                  className={`block w-full pl-10 pr-3 py-3 bg-white/10 border ${
                    emailError ? "border-red-400" : "border-white/20"
                  } rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 ${
                    isFocused.email
                      ? "ring-2 ring-purple-400 border-transparent"
                      : ""
                  } transition-all duration-200`}
                  placeholder="you@example.com"
                />
              </div>
              {emailError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-300">
                  {emailError}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-purple-300" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handleInputChange(setPassword, "password")}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, password: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, password: false }))
                  }
                  className={`block w-full pl-10 pr-10 py-3 bg-white/10 border ${
                    passwordError ? "border-red-400" : "border-white/20"
                  } rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 ${
                    isFocused.password
                      ? "ring-2 ring-purple-400 border-transparent"
                      : ""
                  } transition-all duration-200`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-purple-300 hover:text-white transition-colors" />
                  ) : (
                    <FiEye className="h-5 w-5 text-purple-300 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
              {passwordError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-300">
                  {passwordError}
                </motion.p>
              )}
            </motion.div>

            {/* Forgot Password Link */}
            <motion.div variants={itemVariants} className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-purple-300 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={loading}
                className="w-full group relative py-3 px-4 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <FiLogIn className="mr-2 h-5 w-5 group-hover:translate-x-[-2px] transition-transform" />
                    Sign In
                    <FiArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>

            {/* Register Link */}
            <motion.div variants={itemVariants} className="text-center mt-6">
              <p className="text-purple-200">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-white hover:text-purple-200 underline decoration-2 underline-offset-2 transition-colors">
                  Create account
                </Link>
              </p>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;
