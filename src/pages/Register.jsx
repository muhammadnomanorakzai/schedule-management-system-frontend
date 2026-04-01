import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiArrowLeft,
  FiUserPlus,
} from "react-icons/fi";

import FloatingBackground from "../components/FloatingBackground";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    setPasswordStrength(strength);
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "password") {
      checkPasswordStrength(value);
      // Clear confirm password error when password changes
      if (formData.confirmPassword) {
        validateField("confirmPassword", formData.confirmPassword);
      }
    }

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (value.trim().length < 2)
          error = "Name must be at least 2 characters";
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) error = "Email is required";
        else if (!emailRegex.test(value)) error = "Please enter a valid email";
        break;

      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 6)
          error = "Password must be at least 6 characters";
        break;

      case "confirmPassword":
        if (!value) error = "Please confirm your password";
        else if (value !== formData.password) error = "Passwords do not match";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = ["name", "email", "password", "confirmPassword"];
    let isValid = true;

    fields.forEach((field) => {
      const fieldValid = validateField(field, formData[field]);
      if (!fieldValid) isValid = false;
    });

    return isValid;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        },
      );

      setSuccess(true);
      toast.success("Registration submitted successfully!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-blue-500";
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      case 5:
        return "Very Strong";
      default:
        return "";
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <FloatingBackground />

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative z-10 w-full max-w-md px-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-400">
              <FiCheckCircle className="w-10 h-10 text-green-400" />
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-3">
              Registration Submitted!
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-purple-200 mb-6">
              Your account is pending admin approval. You will receive an email
              once your account is approved.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4">
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                />
              </div>
              <p className="text-sm text-purple-300">
                Redirecting to login page...
              </p>

              <Link
                to="/login"
                className="inline-flex items-center text-sm text-purple-300 hover:text-white transition-colors">
                <FiArrowLeft className="mr-2" />
                Go to login now
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

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
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-center mb-8">
          <p className="text-purple-200">Create your account to get started</p>
        </motion.div>

        {/* Registration Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Info Message */}

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </motion.div>
          )}

          <form onSubmit={submitHandler} className="space-y-5">
            {/* Name Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-purple-300" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleChange("name")}
                  onBlur={() => {
                    setIsFocused((prev) => ({ ...prev, name: false }));
                    validateField("name", formData.name);
                  }}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, name: true }))
                  }
                  className={`block w-full pl-10 pr-3 py-3 bg-white/10 border ${
                    errors.name ? "border-red-400" : "border-white/20"
                  } rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 ${
                    isFocused.name
                      ? "ring-2 ring-purple-400 border-transparent"
                      : ""
                  } transition-all duration-200`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-300">
                  {errors.name}
                </motion.p>
              )}
            </motion.div>

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
                  value={formData.email}
                  onChange={handleChange("email")}
                  onBlur={() => {
                    setIsFocused((prev) => ({ ...prev, email: false }));
                    validateField("email", formData.email);
                  }}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, email: true }))
                  }
                  className={`block w-full pl-10 pr-3 py-3 bg-white/10 border ${
                    errors.email ? "border-red-400" : "border-white/20"
                  } rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 ${
                    isFocused.email
                      ? "ring-2 ring-purple-400 border-transparent"
                      : ""
                  } transition-all duration-200`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-300">
                  {errors.email}
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
                  value={formData.password}
                  onChange={handleChange("password")}
                  onBlur={() => {
                    setIsFocused((prev) => ({ ...prev, password: false }));
                    validateField("password", formData.password);
                  }}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, password: true }))
                  }
                  className={`block w-full pl-10 pr-10 py-3 bg-white/10 border ${
                    errors.password ? "border-red-400" : "border-white/20"
                  } rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 ${
                    isFocused.password
                      ? "ring-2 ring-purple-400 border-transparent"
                      : ""
                  } transition-all duration-200`}
                  placeholder="••••••••"
                  minLength="6"
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-purple-300">
                      {getPasswordStrengthText()}
                    </span>
                  </div>

                  {/* Password requirements */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span
                      className={`flex items-center ${formData.password.length >= 6 ? "text-green-400" : "text-purple-300"}`}>
                      <span className="mr-1">•</span> Min 6 characters
                    </span>
                    <span
                      className={`flex items-center ${/[A-Z]/.test(formData.password) ? "text-green-400" : "text-purple-300"}`}>
                      <span className="mr-1">•</span> Uppercase
                    </span>
                    <span
                      className={`flex items-center ${/[0-9]/.test(formData.password) ? "text-green-400" : "text-purple-300"}`}>
                      <span className="mr-1">•</span> Number
                    </span>
                    <span
                      className={`flex items-center ${/[^A-Za-z0-9]/.test(formData.password) ? "text-green-400" : "text-purple-300"}`}>
                      <span className="mr-1">•</span> Special char
                    </span>
                  </div>
                </div>
              )}

              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-300">
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-purple-300" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  onBlur={() => {
                    setIsFocused((prev) => ({
                      ...prev,
                      confirmPassword: false,
                    }));
                    validateField("confirmPassword", formData.confirmPassword);
                  }}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, confirmPassword: true }))
                  }
                  className={`block w-full pl-10 pr-10 py-3 bg-white/10 border ${
                    errors.confirmPassword
                      ? "border-red-400"
                      : "border-white/20"
                  } rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 ${
                    isFocused.confirmPassword
                      ? "ring-2 ring-purple-400 border-transparent"
                      : ""
                  } transition-all duration-200`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-purple-300 hover:text-white transition-colors" />
                  ) : (
                    <FiEye className="h-5 w-5 text-purple-300 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-300">
                  {errors.confirmPassword}
                </motion.p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-4">
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <FiUserPlus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Create Account
                  </>
                )}
              </button>
            </motion.div>

            {/* Login Link */}
            <motion.div variants={itemVariants} className="text-center pt-4">
              <p className="text-purple-200">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-white hover:text-purple-200 underline decoration-2 underline-offset-2 transition-colors">
                  Sign in
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

export default Register;
