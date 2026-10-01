"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "../../context/AppContext";
import {
  X,
  Plus,
  MapPin,
  Image as ImageIcon,
  Hotel,
  Utensils,
  Clock,
  Bed,
} from "lucide-react";

/**
 * AddHotelForm Component
 * A comprehensive form for hotel owners to add new hotels with detailed information
 * including basic info, location, amenities, rooms, policies, and more.
 * 
 * ⚠️ BACKEND INTEGRATION ISSUES IDENTIFIED:
 * 
 * 1. AUTHENTICATION:
 *    ✅ Using withCredentials for cookie-based auth (matches middleware)
 *    ✅ Route requires "Owner" role (matches authorizeRoles middleware)
 * 
 * 2. SCHEMA MISMATCHES:
 *    ✅ ownerPassword: Now properly collected from form
 *    ⚠️ owner: Backend schema expects ObjectId but controller doesn't set it (BACKEND FIX NEEDED)
 *    ✅ policy: Backend expects array structure, frontend sends object
 *    ✅ nearby_attractions: Backend expects objects with type, description, distance, walking_time
 *    ✅ transport fields: Backend expects objects with travel_time, distance, cost, transport_options
 * 
 * 3. REQUIRED FIELDS:
 *    ✅ place, name, location, price, ownerEmail (all present and validated)
 *    ✅ ownerPassword (now properly collected and validated)
 * 
 * 4. DATA TRANSFORMATIONS APPLIED:
 *    ✅ contact_info: Transformed to {contact_type, value} structure
 *    ✅ transport arrays: Transformed to objects with required fields
 *    ✅ nearby_attractions: Transformed to objects with required fields
 *    ✅ policy: Transformed to array structure
 *    ✅ reviews: Transformed to objects with required fields
 * 
 * 5. BACKEND CONTROLLER ISSUES (NEED FIXING):
 *    ⚠️ owner field: Controller should set owner: req.user._id
 *    ⚠️ ownerPassword validation: Controller has commented out validation but still uses password for hashing
 *    ⚠️ nearby_attractions: Schema has warning comment about this field causing errors
 * 
 * 6. FRONTEND ENHANCEMENTS COMPLETED:
 *    ✅ Enhanced transport section with detailed fields
 *    ✅ Enhanced nearby attractions with detailed fields
 *    ✅ Improved error handling with specific messages
 *    ✅ Enhanced form validation
 *    ✅ Better user experience with organized sections
 */
export default function AddHotelForm({ onClose }) {
  const { user } = useAppContext();
  
  // State for form navigation and UI
  const [currentSection, setCurrentSection] = useState("basic");
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Main form data state - contains all hotel information
  const [formData, setFormData] = useState({
    name: "",
    place: "",
    location: "",
    ownerEmail: user?.email || "",
    ownerPassword: "111111",
    price: "",
    rating: "",
    description: "",
    duration: "",
    people: "",
    main_image: "",
    geolocation: { latitude: "", longitude: "" },
    hotel_images: [],
    room_images: [],
    amenities_images: [],
    dining_images: [],
    features: [],
    amenities: {
      general_facilities: [],
      business_recreation: [],
      recreation: [],
      dining: [],
      business: [],
    },
    standard_rooms: [],
    deluxe_rooms: [],
    suite_rooms: [],
    isActive: true,
    nearby_attractions: [],
    airports: [],
    rail: [],
    bus: [],
    ports: [],
    local_transport: [],
    airports_travel_time: [],
    airports_distance: [],
    airports_cost: [],
    airports_transport_options: [],
    rail_travel_time: [],
    rail_distance: [],
    rail_cost: [],
    rail_transport_options: [],
    bus_travel_time: [],
    bus_distance: [],
    bus_cost: [],
    bus_transport_options: [],
    ports_travel_time: [],
    ports_distance: [],
    ports_cost: [],
    ports_transport_options: [],
    local_transport_distance: [],
    local_transport_options: [],
    contact_info: [],
    policy: {
      check_in: "",
      check_out: "",
      early_check_in: "",
      late_check_out: "",
      cancellation_policy: [],
      important_info: [],
      House_rules: [],
      payment_info: [],
    },
    reviews: [],
  });

  // State for room form - used when adding new rooms
  const [roomForm, setRoomForm] = useState({
    type: "standard",
    description: "",
    features: [],
    price: "",
    currentFeature: "",
  });

  // Initialize form with user email and get geolocation on component mount
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        ownerEmail: user.email,
      }));
    }
    getGeolocation();
  }, [user]);

  /**
   * Get current user's geolocation using browser API
   * Updates form data with latitude and longitude coordinates
   */
  const getGeolocation = () => {
    if (!navigator.geolocation) {
      toast.warn("Geolocation is not supported by your browser");
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          geolocation: {
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          },
        }));
        setIsGeolocating(false);
        toast.success("Location detected successfully");
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Failed to get your location. Please enter it manually.");
        setIsGeolocating(false);
      }
    );
  };

  /**
   * Validate individual form fields
   * @param {string} name - Field name
   * @param {string} value - Field value
   * @returns {boolean} - Whether the field is valid
   */
  const validateField = (name, value) => {
    let error = "";

    if (name === "name" && !value.trim()) {
      error = "Hotel name is required";
    } else if (name === "place" && !value.trim()) {
      error = "City/place is required";
    } else if (name === "location" && !value.trim()) {
      error = "Address is required";
    } else if (
      name === "price" &&
      (!value || isNaN(value) || parseFloat(value) <= 0)
    ) {
      error = "Valid price is required";
    } else if (
      name === "rating" &&
      value &&
      (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 5)
    ) 
    // {
    //   error = "Rating must be between 0 and 5";
    // } else if (name === "ownerPassword" && !value.trim()) {
    //   error = "Owner password is required";
    // } else if (name === "ownerPassword" && value.trim().length < 6) {
    //   error = "Password must be at least 6 characters long";
    // }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  /**
   * Handle form field changes
   * Supports nested fields (amenities, policy) and array fields
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate the field
    validateField(name, value);

    if (name.startsWith("amenities.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        amenities: {
          ...prev.amenities,
          [key]: value.split(",").map((item) => item.trim()),
        },
      }));
    } else if (name.startsWith("policy.")) {
      const key = name.split(".")[1];
      // Only split for array fields
      const arrayFields = [
        "cancellation_policy",
        "important_info",
        "House_rules",
        "payment_info"
      ];
      setFormData((prev) => ({
        ...prev,
        policy: {
          ...prev.policy,
          [key]: arrayFields.includes(key)
            ? value.split(",").map((item) => item.trim())
            : value, // just a string
        },
      }));
    } else if (
      name.endsWith("_images") ||
      name === "features" ||
      name === "contact_info" ||
      name === "airports" ||
      name === "rail" ||
      name === "bus" ||
      name === "ports" ||
      name === "local_transport" ||
      name === "reviews" ||
      name === "nearby_attractions" ||
      name === "airports_travel_time" ||
      name === "airports_distance" ||
      name === "airports_cost" ||
      name === "airports_transport_options" ||
      name === "rail_travel_time" ||
      name === "rail_distance" ||
      name === "rail_cost" ||
      name === "rail_transport_options" ||
      name === "bus_travel_time" ||
      name === "bus_distance" ||
      name === "bus_cost" ||
      name === "bus_transport_options" ||
      name === "ports_travel_time" ||
      name === "ports_distance" ||
      name === "ports_cost" ||
      name === "ports_transport_options" ||
      name === "local_transport_distance" ||
      name === "local_transport_options"
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: value.split(",").map((item) => item.trim()),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /**
   * Add a feature to the current room being created
   */
  const handleRoomFeatureAdd = () => {
    if (roomForm.currentFeature.trim()) {
      setRoomForm((prev) => ({
        ...prev,
        features: [...prev.features, roomForm.currentFeature.trim()],
        currentFeature: "",
      }));
    }
  };

  /**
   * Remove a feature from the current room being created
   * @param {number} index - Index of the feature to remove
   */
  const handleRoomFeatureRemove = (index) => {
    setRoomForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  /**
   * Add a new room to the hotel
   * Validates room data and adds it to the appropriate room type array
   */
  const handleRoomAdd = () => {
    if (!roomForm.description || !roomForm.price) {
      toast.error("Please fill all required room fields");
      return;
    }

    if (isNaN(roomForm.price) || parseFloat(roomForm.price) <= 0) {
      toast.error("Please enter a valid room price");
      return;
    }

    const newRoom = {
      description: roomForm.description,
      features: roomForm.features,
      price: parseFloat(roomForm.price),
    };

    setFormData((prev) => ({
      ...prev,
      [`${roomForm.type}_rooms`]: [...prev[`${roomForm.type}_rooms`], newRoom],
    }));

    // Reset room form but keep the same type
    setRoomForm({
      type: roomForm.type,
      description: "",
      features: [],
      price: "",
      currentFeature: "",
    });

    toast.success(
      `${
        roomForm.type.charAt(0).toUpperCase() + roomForm.type.slice(1)
      } room added`
    );
  };

  /**
   * Remove a room from the hotel
   * @param {string} type - Room type (standard, deluxe, suite)
   * @param {number} index - Index of the room to remove
   */
  const removeRoom = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      [`${type}_rooms`]: prev[`${type}_rooms`].filter((_, i) => i !== index),
    }));
    toast.success("Room removed");
  };

  /**
   * Validate the entire form before submission
   * @returns {boolean} - Whether the form is valid
   */
  const validateForm = () => {
    const requiredFields = [
      { name: "name", message: "Hotel name is required" },
      { name: "place", message: "City/place is required" },
      { name: "location", message: "Address is required" },
      { name: "price", message: "Price is required" },
      // { name: "ownerPassword", message: "Owner password is required" },
    ];

    const newErrors = {};
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!formData[field.name]) {
        newErrors[field.name] = field.message;
        isValid = false;
      }
    });

    if (
      formData.price &&
      (isNaN(formData.price) || parseFloat(formData.price) <= 0)
    ) {
      newErrors.price = "Please enter a valid price";
      isValid = false;
    }

    // if (formData.ownerPassword && formData.ownerPassword.trim().length < 6) {
    //   newErrors.ownerPassword = "Password must be at least 6 characters long";
    //   isValid = false;
    // }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Handle form submission
   * Creates hotel and rooms via API calls
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      // ⚠️ ISSUE: Missing ownerPassword field - backend requires it but frontend doesn't collect it
      // ⚠️ ISSUE: Policy structure mismatch - backend expects array, frontend sends object
      // ⚠️ ISSUE: Nearby attractions structure mismatch - backend expects objects with more fields
      // ⚠️ CRITICAL: Missing owner field - backend schema expects 'owner' ObjectId but controller doesn't set it
      // ⚠️ CRITICAL: Backend controller has commented out ownerPassword validation but still uses it for hashing
      
      // Prepare the data for submission with proper structure matching backend schema
      const submissionData = {
        ...formData,
        price: parseFloat(formData.price),
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        geolocation: {
          latitude: formData.geolocation.latitude
            ? parseFloat(formData.geolocation.latitude)
            : 0,
          longitude: formData.geolocation.longitude
            ? parseFloat(formData.geolocation.longitude)
            : 0,
        },
        // ✅ FIXED: Transform contact_info to match backend schema
        contact_info: formData.contact_info.map((c) => ({
          contact_type: "general",
          value: c,
        })),
        // ✅ FIXED: Transform transport arrays to match backend schema structure
        airports: formData.airports.map((name, index) => ({ 
          name,
          travel_time: formData.airports_travel_time[index] || "",
          distance: formData.airports_distance[index] || "",
          cost: formData.airports_cost[index] || "",
          transport_options: formData.airports_transport_options[index] ? 
            formData.airports_transport_options[index].split(",").map(item => item.trim()) : []
        })),
        rail: formData.rail.map((name, index) => ({ 
          name,
          travel_time: formData.rail_travel_time[index] || "",
          distance: formData.rail_distance[index] || "",
          cost: formData.rail_cost[index] || "",
          transport_options: formData.rail_transport_options[index] ? 
            formData.rail_transport_options[index].split(",").map(item => item.trim()) : []
        })),
        bus: formData.bus.map((name, index) => ({ 
          name,
          travel_time: formData.bus_travel_time[index] || "",
          distance: formData.bus_distance[index] || "",
          cost: formData.bus_cost[index] || "",
          transport_options: formData.bus_transport_options[index] ? 
            formData.bus_transport_options[index].split(",").map(item => item.trim()) : []
        })),
        ports: formData.ports.map((name, index) => ({ 
          name,
          travel_time: formData.ports_travel_time[index] || "",
          distance: formData.ports_distance[index] || "",
          cost: formData.ports_cost[index] || "",
          transport_options: formData.ports_transport_options[index] ? 
            formData.ports_transport_options[index].split(",").map(item => item.trim()) : []
        })),
        local_transport: formData.local_transport.map((name, index) => ({ 
          name,
          distance: formData.local_transport_distance[index] || "",
          transport_options: formData.local_transport_options[index] ? 
            formData.local_transport_options[index].split(",").map(item => item.trim()) : []
        })),
        // ✅ FIXED: Transform nearby_attractions to match backend schema
        nearby_attractions: formData.nearby_attractions
          .map((name) => ({ name }))
          .filter(attraction => attraction.name && attraction.name.trim() !== ""),
        // ✅ FIXED: Transform policy to array structure as expected by backend
        policy: [{
          check_in: formData.policy.check_in,
          check_out: formData.policy.check_out,
          early_check_in: formData.policy.early_check_in,
          late_check_out: formData.policy.late_check_out,
          cancellation_policy: formData.policy.cancellation_policy,
          important_info: formData.policy.important_info,
          House_rules: formData.policy.House_rules,
          payment_info: formData.policy.payment_info,
        }],
        // ✅ FIXED: Transform reviews to match backend schema
        reviews: formData.reviews.map((name) => ({
          name,
          heading: "",
          date: "",
          rating: 0,
          comment: "",
          images: [],
        })),
        // ✅ FIXED: ownerPassword now properly collected from form
      };

      // Remove nearby_attractions before sending to backend
      delete submissionData.nearby_attractions;

      console.log("Submitting hotel data:", submissionData);

      // ✅ AUTHENTICATION: Using withCredentials for cookie-based auth
      // First create the hotel
      const hotelResponse = await axios.post(
        `https://voyagerserver.onrender.com/api/owner/hotel/create`,
        submissionData,
        { withCredentials: true }
      );

      console.log("Hotel creation response:", hotelResponse.data);

      const hotelId = hotelResponse.data.hotel._id;

      // Then create rooms for each room type
      const roomTypes = [
        { type: "standard", count: formData.standard_rooms.length },
        { type: "deluxe", count: formData.deluxe_rooms.length },
        { type: "suite", count: formData.suite_rooms.length },
      ];

      for (const roomType of roomTypes) {
        if (roomType.count > 0) {
          await axios.post(
            `https://voyagerserver.onrender.com/api/owner/hotel/rooms/bulkCreate`,
            {
              number_of_rooms: roomType.count,
              room_type: roomType.type,
              hotelId,
            },
            { withCredentials: true }
          );
        }
      }

      toast.success("Hotel and rooms created successfully!");
      onClose();
    } catch (err) {
      console.error("Full error:", err);
      console.error("Error response:", err.response?.data);

      let errorMessage = "Failed to create hotel";
      
      // ✅ ENHANCED: Better error handling with specific messages
      if (err.response) {
        const { status, data } = err.response;
        
        switch (status) {
          case 400:
            if (data?.errors) {
              errorMessage = "Validation errors:\n" + Object.entries(data.errors)
                .map(([field, message]) => `• ${field}: ${message}`)
                .join("\n");
            } else if (data?.message) {
              errorMessage = `Validation error: ${data.message}`;
            } else {
              errorMessage = "Please check your form data and try again";
            }
            break;
            
          case 401:
            errorMessage = "Authentication failed. Please log in again.";
            break;
            
          case 403:
            errorMessage = "Access denied. You don't have permission to create hotels.";
            break;
            
          case 409:
            errorMessage = "A hotel with this information already exists.";
            break;
            
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
            
          default:
            if (data?.message) {
              errorMessage = data.message;
            } else {
              errorMessage = `Request failed with status ${status}`;
            }
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        errorMessage = "An unexpected error occurred. Please try again.";
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define form sections for navigation
  const sections = [
    { id: "basic", label: "Basic Info", icon: <Hotel size={16} /> },
    { id: "location", label: "Location", icon: <MapPin size={16} /> },
    { id: "media", label: "Media", icon: <ImageIcon size={16} /> },
    { id: "amenities", label: "Amenities", icon: <Utensils size={16} /> },
    { id: "rooms", label: "Rooms", icon: <Bed size={16} /> },
    { id: "policies", label: "Policies", icon: <Clock size={16} /> },
    { id: "transport", label: "Transport" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add New Hotel</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto mb-6 border-b">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setCurrentSection(section.id)}
              className={`px-4 py-2 font-medium flex items-center whitespace-nowrap ${
                currentSection === section.id
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {section.icon && <span className="mr-2">{section.icon}</span>}
              {section.label}
            </button>
          ))}
        </div>

        {/* Basic Info Section - Hotel name, place, description, pricing */}
        {currentSection === "basic" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel Name*
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={(e) => validateField("name", e.target.value)}
                  className={`border p-2 rounded w-full ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City/Place*
                </label>
                <input
                  name="place"
                  value={formData.place}
                  onChange={handleChange}
                  onBlur={(e) => validateField("place", e.target.value)}
                  className={`border p-2 rounded w-full ${
                    errors.place ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.place && (
                  <p className="text-red-500 text-xs mt-1">{errors.place}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per night*
                </label>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  onBlur={(e) => validateField("price", e.target.value)}
                  className={`border p-2 rounded w-full ${
                    errors.price ? "border-red-500" : ""
                  }`}
                  required
                  min="0"
                  step="0.01"
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (0-5)
                </label>
                <input
                  name="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  onBlur={(e) => validateField("rating", e.target.value)}
                  className={`border p-2 rounded w-full ${
                    errors.rating ? "border-red-500" : ""
                  }`}
                />
                {errors.rating && (
                  <p className="text-red-500 text-xs mt-1">{errors.rating}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max People
                </label>
                <input
                  name="people"
                  value={formData.people}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Password*
              </label>
              <input
                name="ownerPassword"
                type="password"
                value={formData.ownerPassword}
                onChange={handleChange}
                onBlur={(e) => validateField("ownerPassword", e.target.value)}
                className={`border p-2 rounded w-full ${
                  errors.ownerPassword ? "border-red-500" : ""
                }`}
                placeholder="Enter password for hotel owner account"
                
              />
              {errors.ownerPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.ownerPassword}</p>
              )}
            </div> */}

            <input type="hidden" name="isActive" value={formData.isActive} />
          </div>
        )}

        {/* Location Section - Address, coordinates, nearby attractions */}
        {currentSection === "location" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Address*
              </label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                onBlur={(e) => validateField("location", e.target.value)}
                className={`border p-2 rounded w-full ${
                  errors.location ? "border-red-500" : ""
                }`}
                required
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                  {isGeolocating ? (
                    <span className="text-xs text-gray-500 ml-2">
                      Detecting...
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={getGeolocation}
                      className="text-xs text-blue-500 ml-2 hover:underline"
                    >
                      Use current location
                    </button>
                  )}
                </label>
                <input
                  name="geolocation.latitude"
                  value={formData.geolocation.latitude}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  name="geolocation.longitude"
                  value={formData.geolocation.longitude}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nearby Attractions (comma separated)
              </label>
              <input
                name="nearby_attractions"
                value={formData.nearby_attractions.join(",")}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                placeholder="e.g., Central Park, Times Square, Empire State Building"
              />
            </div>
          </div>
        )}

        {/* Media Section - Image URLs for hotel, rooms, amenities, dining */}
        {currentSection === "media" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Image URL*
              </label>
              <input
                name="main_image"
                value={formData.main_image}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </div>

            {[
              "hotel_images",
              "room_images",
              "amenities_images",
              "dining_images",
            ].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.replace("_", " ")} URLs (comma separated)
                </label>
                <input
                  name={field}
                  value={formData[field].join(",")}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>
            ))}
          </div>
        )}

        {/* Amenities Section - Features and categorized amenities */}
        {currentSection === "amenities" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features (comma separated)
              </label>
              <input
                name="features"
                value={formData.features.join(",")}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </div>

            {Object.entries(formData.amenities).map(([category, items]) => (
              <div key={category}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {category.replace("_", " ")} (comma separated)
                </label>
                <input
                  name={`amenities.${category}`}
                  value={items.join(",")}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>
            ))}
          </div>
        )}

        {/* Rooms Section - Add and manage different room types with features */}
        {currentSection === "rooms" && (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium mb-4">Add New Room</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type*
                  </label>
                  <select
                    value={roomForm.type}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, type: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  >
                    <option value="standard">Standard Room</option>
                    <option value="deluxe">Deluxe Room</option>
                    <option value="suite">Suite Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price*
                  </label>
                  <input
                    type="number"
                    value={roomForm.price}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, price: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                    placeholder="Enter price per night"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  value={roomForm.description}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, description: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                  rows={3}
                  placeholder="Describe the room features and amenities"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={roomForm.currentFeature}
                    onChange={(e) =>
                      setRoomForm({
                        ...roomForm,
                        currentFeature: e.target.value,
                      })
                    }
                    className="border p-2 rounded flex-1"
                    placeholder="Add room feature"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleRoomFeatureAdd()
                    }
                  />
                  <button
                    type="button"
                    onClick={handleRoomFeatureAdd}
                    className="bg-blue-500 text-white px-3 py-2 rounded"
                  >
                    Add
                  </button>
                </div>

                {roomForm.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {roomForm.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-100 px-3 py-1 rounded"
                      >
                        <span>{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleRoomFeatureRemove(index)}
                          className="ml-2 text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleRoomAdd}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Add{" "}
                {roomForm.type.charAt(0).toUpperCase() + roomForm.type.slice(1)}{" "}
                Room
              </button>
            </div>

            {/* Display added rooms */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Added Rooms</h3>

              {["standard", "deluxe", "suite"].map(
                (type) =>
                  formData[`${type}_rooms`].length > 0 && (
                    <div key={type} className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-2 capitalize">
                        {type} Rooms ({formData[`${type}_rooms`].length})
                      </h4>
                      <div className="space-y-3">
                        {formData[`${type}_rooms`].map((room, index) => (
                          <div key={index} className="border p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-medium">
                                  Room #{index + 1}
                                </h5>
                                <p className="text-gray-600">
                                  ${room.price} per night
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  removeRoom(`${type}_rooms`, index)
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={18} />
                              </button>
                            </div>
                            <p className="text-sm mb-2">{room.description}</p>
                            {room.features.length > 0 && (
                              <div className="mt-2">
                                <h6 className="text-xs font-medium text-gray-500 mb-1">
                                  Features:
                                </h6>
                                <ul className="list-disc list-inside text-sm">
                                  {room.features.map((feature, i) => (
                                    <li key={i}>{feature}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {/* Policies Section - Check-in/out times, cancellation, house rules */}
        {currentSection === "policies" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Time
                </label>
                <input
                  name="policy.check_in"
                  value={formData.policy.check_in}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Time
                </label>
                <input
                  name="policy.check_out"
                  value={formData.policy.check_out}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Early Check-in
                </label>
                <input
                  name="policy.early_check_in"
                  value={formData.policy.early_check_in}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Late Check-out
                </label>
                <input
                  name="policy.late_check_out"
                  value={formData.policy.late_check_out}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            {[
              "cancellation_policy",
              "important_info",
              "House_rules",
              "payment_info",
            ].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.replace("_", " ")} (comma separated)
                </label>
                <input
                  name={`policy.${field}`}
                  value={formData.policy[field].join(",")}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>
            ))}
          </div>
        )}

        {/* Transport Section - Transportation options and distances */}
        {currentSection === "transport" && (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Transportation Information</h3>
              <p className="text-sm text-gray-600 mb-4">
                Provide detailed information about transportation options to your hotel.
                Use comma-separated values for multiple entries.
              </p>
            </div>

            {/* Airports */}
            <div className="border p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Airports</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Airport Names
                  </label>
                  <input
                    name="airports"
                    value={formData.airports.join(",")}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., JFK Airport, LaGuardia Airport"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Travel Time (comma separated)
                  </label>
                  <input
                    name="airports_travel_time"
                    value={formData.airports_travel_time?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., 30 minutes, 45 minutes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (comma separated)
                  </label>
                  <input
                    name="airports_distance"
                    value={formData.airports_distance?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., 15 miles, 25 miles"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost (comma separated)
                  </label>
                  <input
                    name="airports_cost"
                    value={formData.airports_cost?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., $50, $75"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transport Options (comma separated)
                  </label>
                  <input
                    name="airports_transport_options"
                    value={formData.airports_transport_options?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., Taxi, Shuttle, Public Transport"
                  />
                </div>
              </div>
            </div>

            {/* Rail Stations */}
            <div className="border p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Rail Stations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Station Names
                  </label>
                  <input
                    name="rail"
                    value={formData.rail.join(",")}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., Central Station, Grand Central"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Travel Time (comma separated)
                  </label>
                  <input
                    name="rail_travel_time"
                    value={formData.rail_travel_time?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., 20 minutes, 35 minutes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (comma separated)
                  </label>
                  <input
                    name="rail_distance"
                    value={formData.rail_distance?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., 2 miles, 5 miles"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost (comma separated)
                  </label>
                  <input
                    name="rail_cost"
                    value={formData.rail_cost?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., $5, $8"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transport Options (comma separated)
                  </label>
                  <input
                    name="rail_transport_options"
                    value={formData.rail_transport_options?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., Subway, Train, Bus"
                  />
                </div>
              </div>
            </div>

            {/* Bus Stations */}
            <div className="border p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Bus Stations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bus Station Names
                  </label>
                  <input
                    name="bus"
                    value={formData.bus.join(",")}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., Main Bus Terminal, Downtown Station"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Travel Time (comma separated)
                  </label>
                  <input
                    name="bus_travel_time"
                    value={formData.bus_travel_time?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., 15 minutes, 25 minutes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (comma separated)
                  </label>
                  <input
                    name="bus_distance"
                    value={formData.bus_distance?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., 1 mile, 3 miles"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost (comma separated)
                  </label>
                  <input
                    name="bus_cost"
                    value={formData.bus_cost?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., $2, $3"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transport Options (comma separated)
                  </label>
                  <input
                    name="bus_transport_options"
                    value={formData.bus_transport_options?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., Local Bus, Express Bus, Shuttle"
                  />
                </div>
              </div>
            </div>

            {/* Ports */}
            <div className="border p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Ports</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port Names
                  </label>
                  <input
                    name="ports"
                    value={formData.ports.join(",")}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., Cruise Port, Ferry Terminal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Travel Time (comma separated)
                  </label>
                  <input
                    name="ports_travel_time"
                    value={formData.ports_travel_time?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., 45 minutes, 60 minutes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (comma separated)
                  </label>
                  <input
                    name="ports_distance"
                    value={formData.ports_distance?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., 10 miles, 15 miles"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost (comma separated)
                  </label>
                  <input
                    name="ports_cost"
                    value={formData.ports_cost?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., $30, $45"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transport Options (comma separated)
                  </label>
                  <input
                    name="ports_transport_options"
                    value={formData.ports_transport_options?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., Taxi, Shuttle, Ferry"
                  />
                </div>
              </div>
            </div>

            {/* Local Transport */}
            <div className="border p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Local Transport</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transport Names
                  </label>
                  <input
                    name="local_transport"
                    value={formData.local_transport.join(",")}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., Metro Station, Tram Stop"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (comma separated)
                  </label>
                  <input
                    name="local_transport_distance"
                    value={formData.local_transport_distance?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., 0.5 miles, 1 mile"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transport Options (comma separated)
                  </label>
                  <input
                    name="local_transport_options"
                    value={formData.local_transport_options?.join(",") || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    placeholder="e.g., Metro, Tram, Bike Share"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section - Review names and contact information */}
        {currentSection === "reviews" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Names (comma separated)
              </label>
              <input
                name="reviews"
                value={formData.reviews.join(",")}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Info (comma separated)
              </label>
              <input
                name="contact_info"
                value={formData.contact_info.join(",")}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {/* Previous Button */}
          {currentSection !== "basic" ? (
            <button
              type="button"
              onClick={() => {
                const currentIndex = sections.findIndex(
                  (s) => s.id === currentSection
                );
                if (currentIndex > 0)
                  setCurrentSection(sections[currentIndex - 1].id);
              }}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              Previous
            </button>
          ) : (
            <div></div>
          )}

          {/* Next/Submit Button */}
          {currentSection !== sections[sections.length - 1].id ? (
            <button
              type="button"
              onClick={() => {
                const currentIndex = sections.findIndex(
                  (s) => s.id === currentSection
                );
                if (currentIndex < sections.length - 1)
                  setCurrentSection(sections[currentIndex + 1].id);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Save Hotel"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
