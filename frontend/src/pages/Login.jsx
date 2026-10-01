import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../context/AppContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
    role: "User",
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAppContext();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setLoginInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateForm = () => {
    if (!loginInfo.email || !loginInfo.password) {
      toast.error("Please enter both email and password.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginInfo.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.post(
        "https://voyagerserver.onrender.com/api/users/login",
        loginInfo,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          timeout: 5000,
        }
      );
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Authentication failed, missing token or user data.");
      }

      // Save user data
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name);

      // Update Context
      setUser({ token, role: user.role, email: user.email, name: user.name });
      toast.success("Login Successful!");

      // Role-based navigation
      if (user.role === "Owner") {
        navigate("/hotelApp");
      } else if (user.role === "Vendor") {
        navigate("/vendorApp");
      } else {
        navigate("/"); // Default for regular user
      }
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error (${error.response.status})`;
        if (error.response.status === 401)
          errorMessage = "Invalid email or password.";
        if (error.response.status === 403)
          errorMessage = "You don't have permission.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-500 to-gray-900">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Voyager</h1>
          <h2 className="text-xl font-semibold text-gray-600 mt-2">Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Login as:
            </label>
            <select
              name="role"
              id="role"
              value={loginInfo.role}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="User">User</option>
              <option value="Owner">Owner</option>
              <option value="Vendor">Vendor</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={loginInfo.email}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={loginInfo.password}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`w-full flex justify-center py-3 rounded-lg text-lg font-medium text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }`}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-500">Don't have an account? </span>
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Create a new account
          </Link>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
