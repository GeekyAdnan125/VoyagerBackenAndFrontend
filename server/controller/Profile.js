"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiStar,
  FiLogOut,
  FiCamera,
  FiX,
} from "react-icons/fi";
import { jwtDecode } from "jwt-decode";

const Profile = ({ isOpen, onClose }) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const { user, setUser, setProfileOpen, userDetails, setUserDetails } =
    useAppContext();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match("image.*")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      toast.warn("Please select a valid image");
    }
  };

  const handleImageUpload = async () => {
    if (!image) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("avatar", image);

      const { data } = await axios.post(
        "https://voyagerserver.onrender.com/api/users/avater",
        formData,
        {
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUserDetails(data.user);
      toast.success("Profile picture updated!");
      setImage(null);
      setPreview("");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.get("/api/users/logout", { withCredentials: true });
      localStorage.removeItem("token");
      setUser(null);
      setProfileOpen(false);
      toast.success("Logged out successfully");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      toast.error("Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDetails = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get(
        "https://voyagerserver.onrender.com/api/users/profile",
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      setUserData(data?.user || {});
      console.log("user data", userData)
    } catch (error) {
      toast.error("Unable to fetch user details");
    }
  };
  console.log("data", data)

  useEffect(() => {
    getUserDetails();
  }, [image]);

  let decoded = {};
  if (token) {
    try {
      decoded = jwtDecode(token);
      console.log("Decoded Token:", {
        name: decoded.name,
        email: decoded.email,
        phone: decoded.phone,
      });
    } catch (e) {
      console.error("Error decoding token:", e);
    }
  } else {
    console.log("No user token found.");
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-lg z-50 p-5"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-500 p-1"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <label className="relative cursor-pointer group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : userDetails?.avatarUrl ? (
                  <img
                    src={userDetails.avatarUrl}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <FiUser size={32} />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-cyan-500 text-white p-1.5 rounded-full">
                <FiCamera size={14} />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {image && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleImageUpload}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-70"
                >
                  {isLoading ? "Uploading..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setImage(null);
                    setPreview("");
                  }}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FiUser className="text-cyan-500" /> Personal Information
              </h3>
              <div className="space-y-3 pl-2">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium">{userData.name || "......"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{userData.email || "......."}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">{userData.phone || "......"}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FiStar className="text-amber-400" /> Rewards
              </h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Points</p>
                  <p className="font-bold text-amber-500">120 pts</p>
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  Silver Tier
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full py-2 bg-amber-100 text-amber-700 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-amber-200">
              <FiStar /> Give Feedback
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-200 disabled:opacity-70"
            >
              <FiLogOut /> {isLoading ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Profile;
