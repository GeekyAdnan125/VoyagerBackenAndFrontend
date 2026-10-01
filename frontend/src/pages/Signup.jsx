import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../context/AppContext";

function Signup() {
  const { user, setUser } = useAppContext();
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "User", // Default role
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, phone } = signupInfo;

    if (!name || !email || !password || !phone) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await axios.post("https://voyagerserver.onrender.com/api/users/register", signupInfo, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-800">
      <div className="bg-gray-300 shadow-lg rounded-lg p-8 w-96 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Voyager</h2>
        <h3 className="text-lg font-semibold mb-4">Sign Up</h3>
        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="mb-3 text-left">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Register as:
            </label>
            <select
              name="role"
              id="role"
              value={signupInfo.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-gray-800"
            >
              <option value="User">User</option>
              <option value="Owner">Owner</option>
              <option value="Vendor">Vendor</option>
            </select>
          </div>

          <input
            type="text"
            name="name"
            value={signupInfo.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="Full Name"
            required
          />

          <input
            type="email"
            name="email"
            value={signupInfo.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="Email Address"
            required
          />

          <input
            type="password"
            name="password"
            value={signupInfo.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="Password"
            required
          />

          <input
            type="tel"
            name="phone"
            value={signupInfo.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="Phone Number"
            required
          />

          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <p className="text-gray-600 text-sm mt-3">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-500 font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
