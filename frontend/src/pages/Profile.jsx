import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiStar, FiLogOut, FiCamera, FiX } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";

const Profile = ({ isOpen, onClose }) => {
  const {
    user,
    setProfileOpen,
    userDetails,
    setUserDetails,
    isLoading,
    setIsLoading,
    logout,
    emergencyContacts,
    setEmergencyContacts,
  } = useAppContext();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const token = user?.token || localStorage.getItem("token");

  // load emergency contacts from localStorage
  useEffect(() => {
    const savedContacts = localStorage.getItem("emergencyContacts");
    if (savedContacts) {
      setEmergencyContacts(JSON.parse(savedContacts));
    }
  }, [setEmergencyContacts]);

  // load user details + avatar from localStorage
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const localAvatar = localStorage.getItem("avatarUrl");
        setUserDetails({
          ...decoded,
          avatarUrl: localAvatar || decoded.avatarUrl || "",
        });
      } catch (error) {
        console.error("Failed to decode token:", error);
        toast.error("Session is invalid. Please log in again.");
      }
    }
  }, [token, setUserDetails]);

  // save emergency contacts on change
  useEffect(() => {
    localStorage.setItem("emergencyContacts", JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

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
            Authorization: "Bearer " + token,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setUserDetails((prev) => ({
        ...prev,
        avatarUrl: data.user.avatarUrl,
      }));
      localStorage.setItem("avatarUrl", data.user.avatarUrl);

      toast.success("Profile picture updated!");
      setImage(null);
      setPreview("");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-lg z-50 p-5 overflow-y-auto"
        >
          {/* header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-500 p-1"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* profile picture */}
          <div className="flex flex-col items-center mb-6">
            <label className="relative cursor-pointer group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : userDetails?.avatarUrl ? (
                  <img src={userDetails.avatarUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <FiUser size={32} />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-cyan-500 text-white p-1.5 rounded-full">
                <FiCamera size={14} />
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
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

          {/* user info */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FiUser className="text-cyan-500" /> Personal Information
              </h3>
              <div className="space-y-3 pl-2">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium">{userDetails?.name || "..."}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{userDetails?.email || "..."}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">{userDetails?.phone || "..."}</p>
                </div>
              </div>
            </div>

            {/* emergency contacts */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                🧑‍🤝‍🧑 Emergency Contacts
              </h3>
              <div className="space-y-3 pl-2">
                <div>
                  <p className="text-xs text-gray-500">Mom's Number</p>
                  <input
                    type="text"
                    value={emergencyContacts.mom}
                    onChange={(e) =>
                      setEmergencyContacts({
                        ...emergencyContacts,
                        mom: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1 border rounded"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Dad's Number</p>
                  <input
                    type="text"
                    value={emergencyContacts.dad}
                    onChange={(e) =>
                      setEmergencyContacts({
                        ...emergencyContacts,
                        dad: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1 border rounded"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Best Friend's Number</p>
                  <input
                    type="text"
                    value={emergencyContacts.friend}
                    onChange={(e) =>
                      setEmergencyContacts({
                        ...emergencyContacts,
                        friend: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1 border rounded"
                  />
                </div>
                <button
                  onClick={() => {
                    localStorage.setItem("emergencyContacts", JSON.stringify(emergencyContacts));
                    toast.success("Emergency contacts saved!");
                  }}
                  className="w-full py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 mt-2"
                >
                  Save Emergency Contacts
                </button>
              </div>
            </div>

            {/* rewards */}
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

          {/* actions */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => toast.success("Thanks for your feedback! +10 points")}
              className="w-full py-2 bg-amber-100 text-amber-700 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-amber-200"
            >
              <FiStar /> Give Feedback
            </button>
            <button
              onClick={() => {
                logout();
                setProfileOpen(false);
              }}
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
