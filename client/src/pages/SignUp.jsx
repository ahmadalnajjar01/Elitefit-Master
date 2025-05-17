import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import Logo from "../assets/elitefit-logo.svg"; // Import the logo

// Yup Schema
const schema = yup.object({
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  number: yup.string().required("Mobile number is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  // -----------------------------
  // 1. LOAD GOOGLE IDENTITY SCRIPT
  // -----------------------------
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id:
          "268942872776-ulvhmack82ul53133h6fkdd4f7ehnsgb.apps.googleusercontent.com",
        callback: handleGoogleLogin,
        ux_mode: "popup",
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"), // Container ID
        {
          theme: "outline",
          size: "large",
          text: "signup_with",
          shape: "pill",
        }
      );
    };
    document.body.appendChild(script);
  }, []);

  // -----------------------------
  // 2. GOOGLE SIGN-UP FUNCTION
  // -----------------------------
  const handleGoogleLogin = async (googleResponse) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/google-login",
        { credential: googleResponse.credential },
        { withCredentials: true }
      );

      console.log("Google login response data:", res.data);

      // If token is returned, save it to localStorage
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      Swal.fire({
        icon: "success",
        title: "Access Granted",
        text: "You've successfully accessed EliteFit",
        background: "#1a1a1a",
        color: "#ffffff",
        confirmButtonColor: "#F0BB78",
      }).then(() => navigate("/"));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: error.response?.data?.message || "Authentication failed.",
        background: "#1a1a1a",
        color: "#ffffff",
        confirmButtonColor: "#F0BB78",
      });
    }
  };

  // -----------------------------
  // 3. REGULAR SIGN-UP SUBMIT
  // -----------------------------
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        data
      );

      // If a token is returned, store it
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      Swal.fire({
        icon: "success",
        title: "Account Created!",
        text: response.data.message,
        confirmButtonText: "Login Now",
        background: "#1a1a1a",
        color: "#ffffff",
        confirmButtonColor: "#F0BB78",
      }).then(() => navigate("/"));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text:
          error.response?.data?.message || "An error occurred during signup.",
        background: "#1a1a1a",
        color: "#ffffff",
        confirmButtonColor: "#F0BB78",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------
  // 4. RENDER COMPONENT
  // -----------------------------
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto bg-[#181818] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Section - Visuals */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#252525] via-[#1e1e1e] to-[#181818] p-4 sm:p-6 md:p-10 text-white flex flex-col justify-center relative overflow-hidden md:min-h-[550px]">
          {/* Enhanced background decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#F0BB78]/10 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#F0BB78]/10 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
          <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-[#F0BB78]/5 blur-2xl pointer-events-none animate-pulse"></div>

          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6IiBmaWxsPSIjRjBCQjc4IiBmaWxsLW9wYWNpdHk9Ii4wMiIvPjxwYXRoIGQ9Ik0wIDMwaDMwdjMwSDB6IiBmaWxsPSIjRjBCQjc4IiBmaWxsLW9wYWNpdHk9Ii4wMiIvPjwvZz48L3N2Zz4=')] opacity-10"></div>

          {/* Content Container with better centering */}
          <div className="relative z-10 flex flex-col items-center md:items-start justify-center h-full py-6 md:py-0">
            {/* Logo container with animation */}
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 mb-8 md:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-4xl font-bold text-center mt-9 ml-5 ">
                Welcome to
              </h1>
              <div className="transform transition-all duration-500 hover:scale-105">
                <img
                  src={Logo}
                  alt="EliteFit logo"
                  className="w-[200px] sm:w-[240px] md:w-[260px] ml-0 md:ml-3"
                />
              </div>
            </div>

            {/* Enhanced message with highlight and icons */}
            <div className="text-center md:text-left max-w-md mx-auto md:mx-0 space-y-4">
              <p className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed">
                Join the ultimate fashion destination and explore the{" "}
                <span className="font-medium text-[#F0BB78]">
                  latest trends
                </span>
                .
              </p>

              {/* Feature bullets */}
              <div className="mt-8 space-y-3 px-4 md:px-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F0BB78]/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#F0BB78]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-white/90 text-sm sm:text-base">
                    Premium quality clothing from luxury brands
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F0BB78]/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#F0BB78]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-white/90 text-sm sm:text-base">
                    Exclusive deals and personalized recommendations
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F0BB78]/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#F0BB78]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-white/90 text-sm sm:text-base">
                    Fast delivery and hassle-free returns
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced glowing elements */}
          <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-[#F0BB78]/20 blur-2xl pointer-events-none"></div>
          <div className="absolute top-1/3 right-0 w-16 h-64 bg-[#F0BB78]/5 blur-xl pointer-events-none"></div>
          <div className="hidden md:block absolute bottom-10 left-10 w-24 h-24 rounded-full border border-[#F0BB78]/20 pointer-events-none"></div>
        </div>

        {/* Right Section - Sign-Up Form */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-10 bg-[#181818] text-white">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-6">
            Sign Up
          </h2>
          <span className="inline-block px-2 sm:px-3 py-1 bg-[#F0BB78] text-black rounded-full text-xs sm:text-sm font-semibold tracking-wide shadow-sm mb-4 sm:mb-6">
            Create Your Account
          </span>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div className="col-span-1">
                <input
                  type="text"
                  {...register("firstName")}
                  placeholder="First Name"
                  className="w-full px-3 sm:px-4 py-2 bg-[#252525] border border-[#303030] text-white rounded-lg focus:border-[#F0BB78] focus:outline-none focus:ring-1 focus:ring-[#F0BB78]"
                />
                {errors.firstName && (
                  <p className="text-xs sm:text-sm text-[#F0BB78] mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <input
                  type="text"
                  {...register("lastName")}
                  placeholder="Last Name"
                  className="w-full px-3 sm:px-4 py-2 bg-[#252525] border border-[#303030] text-white rounded-lg focus:border-[#F0BB78] focus:outline-none focus:ring-1 focus:ring-[#F0BB78]"
                />
                {errors.lastName && (
                  <p className="text-xs sm:text-sm text-[#F0BB78] mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
              <div className="col-span-1 sm:col-span-2">
                <input
                  type="email"
                  {...register("email")}
                  placeholder="Email"
                  className="w-full px-3 sm:px-4 py-2 bg-[#252525] border border-[#303030] text-white rounded-lg focus:border-[#F0BB78] focus:outline-none focus:ring-1 focus:ring-[#F0BB78]"
                />
                {errors.email && (
                  <p className="text-xs sm:text-sm text-[#F0BB78] mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="col-span-1 sm:col-span-2">
                <input
                  type="text"
                  {...register("number")}
                  placeholder="Mobile Number"
                  className="w-full px-3 sm:px-4 py-2 bg-[#252525] border border-[#303030] text-white rounded-lg focus:border-[#F0BB78] focus:outline-none focus:ring-1 focus:ring-[#F0BB78]"
                />
                {errors.number && (
                  <p className="text-xs sm:text-sm text-[#F0BB78] mt-1">
                    {errors.number.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="relative col-span-1 sm:col-span-1">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Password"
                  className="w-full px-3 sm:px-4 py-2 bg-[#252525] border border-[#303030] text-white rounded-lg focus:border-[#F0BB78] focus:outline-none focus:ring-1 focus:ring-[#F0BB78] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 sm:top-3 text-[#F0BB78]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && (
                  <p className="text-xs sm:text-sm text-[#F0BB78] mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="relative col-span-1 sm:col-span-1">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Confirm Password"
                  className="w-full px-3 sm:px-4 py-2 bg-[#252525] border border-[#303030] text-white rounded-lg focus:border-[#F0BB78] focus:outline-none focus:ring-1 focus:ring-[#F0BB78] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2 sm:top-3 text-[#F0BB78]"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="text-xs sm:text-sm text-[#F0BB78] mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 sm:mt-6 w-full bg-[#F0BB78] text-[#000000] py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:shadow-[0_5px_15px_rgba(240,187,120,0.4)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5 text-[#000000]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing Up...
                </>
              ) : (
                <>
                  Sign Up
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Google Sign-Up Button Container */}
          <div className="flex items-center justify-center mt-4 sm:mt-6">
            <div
              id="google-signin-btn"
              className="w-full flex justify-center"
            ></div>
          </div>

          <p className="mt-4 sm:mt-6 text-center text-white/70 text-sm sm:text-base">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#F0BB78] hover:underline font-medium"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
