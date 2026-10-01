"use client";
import { useState, useRef, useEffect } from "react";
import { HotelCard } from "./hotel-card";
import GameSelector from "./GameSelector";
import { MapPin } from "./icons";
import jsPDF from "jspdf";
import { useAppContext } from "../context/AppContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";


export default function HotelBooking() {
  
  const Navigate= useNavigate;
  const {HotelLocation} = useAppContext();
  const { userDetails } = useAppContext();
  const [hotels, setHotels] = useState([]);
  const [availableHotels, setAvailableHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [discount, setDiscount] = useState(null);
  const [showGameSelector, setShowGameSelector] = useState(false);
  const [roomType, setRoomType] = useState("standard");
  const [sidebarRooms, setSidebarRooms] = useState(1);
  const gameSelectorRef = useRef(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showPaymentSimButtons, setShowPaymentSimButtons] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [activeGalleryCategory, setActiveGalleryCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const { user } = useAppContext();
  const token = user?.token;
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Transform API data to component format
  const transformHotelData = (apiHotel) => {
    const roomTypes = [];

    // Transform room types from API structure
    if (apiHotel.standard_rooms && Array.isArray(apiHotel.standard_rooms)) {
      apiHotel.standard_rooms.forEach((room) => {
        roomTypes.push({
          type: "Standard",
          price: typeof room.price === "number" ? room.price : 0,
          available: 5, // Default availability
          description: room.description || "No description available.",
          features: room.features || [],
        });
      });
    }

    if (apiHotel.deluxe_rooms && Array.isArray(apiHotel.deluxe_rooms)) {
      apiHotel.deluxe_rooms.forEach((room) => {
        roomTypes.push({
          type: "Deluxe",
          price: typeof room.price === "number" ? room.price : 0,
          available: 3,
          description: room.description || "No description available.",
          features: room.features || [],
        });
      });
    }

    if (apiHotel.suite_rooms && Array.isArray(apiHotel.suite_rooms)) {
      apiHotel.suite_rooms.forEach((room) => {
        roomTypes.push({
          type: "Suite",
          price: typeof room.price === "number" ? room.price : 0,
          available: 2,
          description: room.description || "No description available.",
          features: room.features || [],
        });
      });
    }

    return {
      _id: apiHotel._id,
      name: apiHotel.name || "Unnamed Hotel",
      location: apiHotel.location || apiHotel.place || "Location not specified",
      rating: typeof apiHotel.rating === "number" ? apiHotel.rating : "N/A",
      price: typeof apiHotel.price === "number" ? apiHotel.price : 0,
      description: apiHotel.description || "No description available.",
      image:
        apiHotel.main_image ||
        (apiHotel.images && apiHotel.images[0]) ||
        "/placeholder.svg?height=200&width=300&text=Hotel+Image",
      images: [
        ...(apiHotel.hotel_images || []),
        ...(apiHotel.room_images || []),
        ...(apiHotel.amenities_images || []),
        ...(apiHotel.dining_images || []),
      ],
      amenities: apiHotel.amenities || {
        general_facilities: [],
        business_recreation: [],
        recreation: [],
        dining: [],
        business: [],
      },
      roomTypes: roomTypes,
      features: apiHotel.features || [],
      duration: apiHotel.duration || "",
      people: apiHotel.people || "",
      geolocation: apiHotel.geolocation || { latitude: 0, longitude: 0 },
      contact_info: apiHotel.contact_info || [],
      reviews: apiHotel.reviews || [],
      policy: apiHotel.policy || [],
      nearby_attractions: apiHotel.nearby_attractions || [],
      airports: apiHotel.airports || [],
      rail: apiHotel.rail || [],
      bus: apiHotel.bus || [],
      ports: apiHotel.ports || [],
      local_transport: apiHotel.local_transport || [],
    };
  };
  useEffect(() => {
    if (HotelLocation) {
      setSearchQuery(HotelLocation);
    }
  }, [HotelLocation]);

  // Enhanced gallery data structure using API data
  const getEnhancedGallery = (hotel) => {
    const allImages = hotel.images || [];

    return {
      all: allImages,
      hotel: hotel.images?.filter((_, index) => index % 4 === 0) || [
        allImages[0],
      ],
      rooms: hotel.images?.filter((_, index) => index % 4 === 1) || [
        allImages[1],
      ],
      amenities: hotel.images?.filter((_, index) => index % 4 === 2) || [
        allImages[2],
      ],
      dining: hotel.images?.filter((_, index) => index % 4 === 3) || [
        allImages[3],
      ],
    };
  };

  // Get nearby attractions from API data
  const getNearbyAttractions = (hotel) => {
    if (hotel.nearby_attractions && hotel.nearby_attractions.length > 0) {
      return hotel.nearby_attractions;
    }

    // Return empty array if no data from API
    return [];
  };

  // Get transportation options from API data
  const getTransportationOptions = (hotel) => {
    return {
      airports: hotel.airports || [],
      railways: hotel.rail || [],
      busStations: hotel.bus || [],
      ports: hotel.ports || [],
      localTransport: hotel.local_transport || [],
    };
  };

  useEffect(() => {
    if (!token) {
      console.warn("🔐 No token found. Using public hotel data.");
      // Don't return early - still fetch hotels
    }
    fetchAllHotels();
  }, [token]);

  // Fetch all hotels on component mount using the API
  const fetchAllHotels = async () => {
    try {
      setLoading(true);
      console.log("🏨 Fetching all hotels from API...");

      const headers = {
        "Content-Type": "application/json",
      };

      // Only add Authorization header if token exists
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        "https://voyagerserver.onrender.com/api/owner/hotel/all",
        {
          method: "GET",
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("🏨 All hotels fetched successfully:", data);

      // Transform the API data to match component's expected format
      const transformedHotels = data.map(transformHotelData);

      setHotels(transformedHotels);
      setAvailableHotels(transformedHotels);
      setFilteredHotels(transformedHotels);
      console.log(
        "🏨 Hotels state updated with transformed data:",
        transformedHotels
      );
    } catch (error) {
      console.error("🏨 Error fetching hotels:", error);
      toast.error(
        "Failed to fetch hotels. Please check your connection and try again."
      );

      // Set empty arrays instead of fallback data
      setHotels([]);
      setAvailableHotels([]);
      setFilteredHotels([]);
    } finally {
      setLoading(false);
    }
  };

  // Always fetch hotels, regardless of token
  // useEffect(() => {
  //   fetchAllHotels()
  // }, [])

  // Enhanced filter function using the API endpoint from the image
  const applyFilters = async () => {
    if (!checkInDate || !checkOutDate || !roomType || !sidebarRooms) {
      toast.warning(
        "Please fill in all filter criteria (check-in, check-out, room type, and number of rooms)"
      );
      return;
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    // Check if dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      toast.error("Check-in date cannot be in the past");
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 Applying filters using API...");

      const requestBody = {
        room_type: roomType.toLowerCase(),
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        num_rooms: sidebarRooms,
      };

      console.log("🔍 Filter request body:", requestBody);

      // Prepare headers - include Authorization if token exists
      const headers = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if token exists
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        "https://voyagerserver.onrender.com/api/bookings/available-hotels",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(requestBody),
        }
      );

      // Handle different response statuses
      if (response.status === 400) {
        console.warn(
          "🔍 Bad request - invalid filter parameters. Applying client-side filters."
        );
        toast.warning(
          "Invalid filter parameters. Applying basic filters instead."
        );
        applyClientSideFilters();
        return;
      }

      if (response.status === 401) {
        console.warn(
          "🔐 Authentication required for filtering. Applying client-side filters only."
        );
        toast.warning(
          "Authentication required for advanced filtering. Showing all hotels with basic filters."
        );
        applyClientSideFilters();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("🔍 Filter response:", data);

      if (data.success && data.availableHotels) {
        // Extract hotel IDs from the API response
        const availableHotelIds = data.availableHotels.map(
          (hotel) => hotel.hotelId
        );

        // Filter the hotels based on API response
        const apiFilteredHotels = hotels.filter((hotel) =>
          availableHotelIds.includes(hotel._id)
        );

        // Apply additional client-side filters (search query and price range)
        const finalFilteredHotels = apiFilteredHotels.filter((hotel) => {
          const matchesSearch =
            hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotel.location.toLowerCase().includes(searchQuery.toLowerCase());

          // Check if hotel has rooms in price range OR base price is in range
          const hasRoomInPriceRange =
            hotel.roomTypes && hotel.roomTypes.length > 0
              ? hotel.roomTypes.some(
                  (rt) => rt.price >= priceRange[0] && rt.price <= priceRange[1]
                )
              : hotel.price >= priceRange[0] && hotel.price <= priceRange[1];

          return matchesSearch && hasRoomInPriceRange;
        });

        setAvailableHotels(apiFilteredHotels);
        setFilteredHotels(finalFilteredHotels);
        setAvailabilityChecked(true);

        toast.success(
          `Found ${finalFilteredHotels.length} hotels matching your criteria`
        );
        console.log("🔍 Filtered hotels updated:", finalFilteredHotels);
      } else {
        setAvailableHotels([]);
        setFilteredHotels([]);
        toast.info("No hotels available for the selected criteria");
      }
    } catch (error) {
      console.error("🔍 Error applying filters:", error);

      // Fallback to client-side filtering on any error
      console.log("🔍 Falling back to client-side filtering...");
      toast.warning("API filtering failed. Applied basic filters instead.");
      applyClientSideFilters();
    } finally {
      setLoading(false);
    }
  };

  // Add this new function after the applyFilters function
  const applyClientSideFilters = () => {
    console.log("🔍 Applying client-side filters only...");

    // Validate dates first
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      if (checkOut <= checkIn) {
        toast.error("Check-out date must be after check-in date");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        toast.error("Check-in date cannot be in the past");
        return;
      }
    }

    const clientFilteredHotels = hotels.filter((hotel) => {
      const matchesSearch =
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchQuery.toLowerCase());

      const hasRoomInPriceRange =
        hotel.roomTypes && hotel.roomTypes.length > 0
          ? hotel.roomTypes.some(
              (rt) => rt.price >= priceRange[0] && rt.price <= priceRange[1]
            )
          : hotel.price >= priceRange[0] && hotel.price <= priceRange[1];

      // Basic room type filtering
      const hasRoomType =
        hotel.roomTypes && hotel.roomTypes.length > 0
          ? hotel.roomTypes.some(
              (rt) => rt.type.toLowerCase() === roomType.toLowerCase()
            )
          : true;

      // Basic date validation (just check if dates are provided and valid)
      const hasValidDates =
        !checkInDate ||
        !checkOutDate ||
        (checkInDate &&
          checkOutDate &&
          new Date(checkInDate) < new Date(checkOutDate));

      return (
        matchesSearch && hasRoomInPriceRange && hasRoomType && hasValidDates
      );
    });

    setAvailableHotels(clientFilteredHotels);
    setFilteredHotels(clientFilteredHotels);
    setAvailabilityChecked(true);

    toast.success(
      `Found ${clientFilteredHotels.length} hotels matching your criteria (basic filtering)`
    );
  };

  // Apply client-side filters when search query or price range changes
  useEffect(() => {
    if (!availabilityChecked) {
      // If no API filtering has been done, filter all hotels
      const clientFilteredHotels = hotels.filter((hotel) => {
        const matchesSearch =
          (hotel.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (hotel.location?.toLowerCase() || "").includes(searchQuery.toLowerCase());

        const hasRoomInPriceRange =
          hotel.roomTypes && hotel.roomTypes.length > 0
            ? hotel.roomTypes.some(
                (rt) => typeof rt.price === "number" && rt.price >= priceRange[0] && rt.price <= priceRange[1]
              )
            : typeof hotel.price === "number" && hotel.price >= priceRange[0] && hotel.price <= priceRange[1];

        return matchesSearch && hasRoomInPriceRange;
      });
      setFilteredHotels(clientFilteredHotels);
    } else {
      // If API filtering has been done, apply client-side filters to available hotels
      const clientFilteredHotels = availableHotels.filter((hotel) => {
        const matchesSearch =
          (hotel.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (hotel.location?.toLowerCase() || "").includes(searchQuery.toLowerCase());

        const hasRoomInPriceRange =
          hotel.roomTypes && hotel.roomTypes.length > 0
            ? hotel.roomTypes.some(
                (rt) => typeof rt.price === "number" && rt.price >= priceRange[0] && rt.price <= priceRange[1]
              )
            : typeof hotel.price === "number" && hotel.price >= priceRange[0] && hotel.price <= priceRange[1];

        return matchesSearch && hasRoomInPriceRange;
      });
      setFilteredHotels(clientFilteredHotels);
    }
  }, [searchQuery, priceRange, hotels, availableHotels, availabilityChecked]);

  // Book multiple rooms using the API
  const bookMultipleRooms = async (hotelName) => {
    if (!checkInDate || !checkOutDate || !roomType || !rooms) {
      toast.error("Please fill in all booking details");
      return false;
    }
 

    try {
      setLoading(true);
      console.log("📝 Booking multiple rooms...");

      const requestBody = {
        hotel_name: hotelName,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        room_type: roomType.toLowerCase(),
        num_rooms: rooms,
        persons: guests || 1,
      };

      console.log("📝 Booking request body:", requestBody);

      const response = await fetch(
        "https://voyagerserver.onrender.com/api/bookings/book-multiple-rooms",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // get from localStorage or cookie
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📝 Booking response:", data);

      if (data.success) {
        toast.success(data.message || "Rooms booked successfully!");
        console.log("📝 Booking successful:", {
          bookingId: data.booking_id,
          bookings: data.bookings,
        });
        return true;
      } else {
        toast.error(data.message || "Booking failed");
        return false;
      }
    } catch (error) {
      console.error("📝 Error booking rooms:", error);
      toast.error("Failed to book rooms. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sync sidebarRooms and rooms
  useEffect(() => {
    setRooms(sidebarRooms);
  }, [sidebarRooms]);

  useEffect(() => {
    if (selectedHotel) {
      // Set main image from API data
      const gallery = getEnhancedGallery(selectedHotel);
      setMainImage(gallery.all[0] || selectedHotel.image || null);

      // Set default room type from available room types
      const defaultType = selectedHotel.roomTypes.find(
        (rt) => rt.available > 0
      );
      if (defaultType) setRoomType(defaultType.type);

      // Set reviews from API data
      setReviews(selectedHotel.reviews || []);
    }
  }, [selectedHotel]);

  const calculateDays = () => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const getBasePrice = () => {
    if (!selectedHotel) return 0;
    const selectedRoomType = selectedHotel.roomTypes.find(
      (rt) => rt.type.toLowerCase() === roomType.toLowerCase()
    );
    return selectedRoomType ? selectedRoomType.price : selectedHotel.price || 0;
  };

  const calculateTotalPrice = () => {
    const basePrice = getBasePrice();
    const days = calculateDays();
    return basePrice * days * rooms;
  };

  const calculateFinalPrice = () => {
    const total = calculateTotalPrice();
    const discounted = discount ? total - total * (discount / 100) : total;
    return Math.round(discounted * 1.12); // 12% tax
  };

  const handleBookNow = (hotelId) => {
    console.log("🎯 HotelBooking: handleBookNow called with hotelId:", hotelId);

    const hotel = hotels.find((h) => h._id === hotelId);
    console.log("🎯 HotelBooking: Found hotel:", hotel);

    setSelectedHotel(hotel);
    const gallery = getEnhancedGallery(hotel);
    setMainImage(gallery.all[0] || hotel.image || null);
    setShowGameSelector(false);
    setDiscount(null);
    setActiveGalleryCategory("all");

    // Set initial room type to the first available room type
    const firstAvailableRoomType = hotel.roomTypes.find(
      (rt) => rt.available > 0
    );
    if (firstAvailableRoomType) {
      setRoomType(firstAvailableRoomType.type);
    }

    console.log("🎯 HotelBooking: Hotel selection completed for:", hotel?.name);
  };

  const handleBackToResults = () => {
    setSelectedHotel(null);
    setShowGameSelector(false);
  };

  const handleDiscountWon = (discountAmount) => setDiscount(discountAmount);

  const handleDiscountClick = () => {
    setShowGameSelector(true);
    setTimeout(
      () => gameSelectorRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  useEffect(() => {
    if (showGameSelector && gameSelectorRef.current) {
      gameSelectorRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showGameSelector]);

  const getGoogleMapsLink = (hotel) => {
    if (
      hotel.geolocation &&
      hotel.geolocation.latitude &&
      hotel.geolocation.longitude
    ) {
      return `https://www.google.com/maps/search/?api=1&query=${hotel.geolocation.latitude},${hotel.geolocation.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      hotel.location
    )}`;
  };

  const EnhancedImageGallery = ({ hotel }) => {
    const gallery = getEnhancedGallery(hotel);
    const categories = [
      { id: "all", label: "All Photos", count: gallery.all.length },
      { id: "hotel", label: "Hotel", count: gallery.hotel.length },
      { id: "rooms", label: "Rooms", count: gallery.rooms.length },
      { id: "amenities", label: "Amenities", count: gallery.amenities.length },
      { id: "dining", label: "Dining", count: gallery.dining.length },
    ];

    const currentImages = gallery[activeGalleryCategory] || gallery.all;

    return (
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative overflow-hidden rounded-lg shadow-lg aspect-video group">
          <img
            src={
              mainImage ||
              currentImages[0] ||
              "/placeholder.svg?height=400&width=600&text=Hotel+Image"
            }
            alt={`${hotel.name} main view`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImages.length} photos
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveGalleryCategory(category.id);
                setMainImage(gallery[category.id][0]);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeGalleryCategory === category.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {currentImages.slice(0, 12).map((img, idx) => (
            <div
              key={idx}
              onClick={() => setMainImage(img)}
              className={`aspect-square cursor-pointer rounded-md overflow-hidden ring-2 transition-all hover:ring-blue-500 ${
                img === mainImage
                  ? "ring-blue-600 scale-105"
                  : "ring-transparent"
              }`}
            >
              <img
                src={img || "/placeholder.svg"}
                alt={`${activeGalleryCategory} ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
          {currentImages.length > 12 && (
            <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center text-gray-500 text-sm font-medium">
              +{currentImages.length - 12} more
            </div>
          )}
        </div>
      </div>
    );
  };

  const fetchFilteredHotelNames = async () => {
    if (!checkInDate || !checkOutDate || !roomType || !sidebarRooms) {
      toast.warning("Please fill in all filter criteria");
      return [];
    }
  
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    if (checkOut <= checkIn) {
      toast.error("Check-out date must be after check-in date");
      return [];
    }
  
    if (checkIn < today) {
      toast.error("Check-in date cannot be in the past");
      return [];
    }
  
    try {
      const requestBody = {
        room_type: roomType.toLowerCase(),
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        num_rooms: sidebarRooms,
      };
  
      console.log("📦 Filter API request body:", requestBody); // 👈 This logs the outgoing data
  
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
  
      const response = await fetch(
        "http://:5000/api/bookings/available-hotels",
        {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
        }
      );
  
      if (!response.ok) {
        console.warn(`❌ API error: ${response.status}`);
        return [];
      }
  
      const data = await response.json();
  
      if (data.success && Array.isArray(data.availableHotels)) {
        const hotelNames = data.availableHotels.map((hotel) => hotel.hotelName);
        console.log("✅ Eligible hotel names:", hotelNames);
        return hotelNames;
      } else {
        return [];
      }
    } catch (err) {
      console.error("❌ Error fetching filtered hotels:", err);
      return [];
    }
  };
  

  const handleBooking = async () => {
    if (!selectedHotel) {
      toast.error("Please select a hotel first");
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    } 
    
    
      const names = await fetchFilteredHotelNames();
      console.log("🎯 Final hotel name list:", names);
      console.log("og name", selectedHotel.name)
    

    if(names.includes(selectedHotel.name)){
      console.log("🎯 Hotel name found in the list:", selectedHotel.name);
    }
    else {
      console.log("🎯 Hotel name not found in the list:", selectedHotel.name);
      toast.error(`${selectedHotel.name} is not available for your selected filters`);
      return;
    } 

    handleDiscountClick();
  };

  // Payment and booking functions remain the same...
  async function loadRazorpay(hotel) {
    console.log("razorpay hotel", hotel);
    const payload = {
      hotelId: hotel._id,
      amount: Number(calculateFinalPrice()),
    };

    try {
      const res = await fetch("https://voyagerserver.onrender.com/api/orders/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.order) {
        alert(data.message || "Order creation failed");
        return;
      }
      const order = data.order;

      if (typeof window.Razorpay === "undefined") {
        console.error(
          "Razorpay SDK not loaded. Please include the Razorpay script in your HTML."
        );
        alert("Payment system not available. Please try again later.");
        return;
      }

      const options = {
        key: "rzp_test_wb29ohYja8YQoG",
        amount: order.amount,
        currency: order.currency,
        name: "Voyeger Ltd.",
        description: `Booking ${hotel.name}`,
        order_id: order.id,
        handler: async (response) => {
          // No-op for simulation
        },
        theme: { color: "#000" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      setShowPaymentSimButtons(true);
    } catch (error) {
      console.error("Error in payment process:", error);
      alert("Payment failed. Please try again.");
    }
  }

  const handleSimulateYes = async () => {
    console.log(
      "📧 Frontend: handleSimulateYes called - Payment simulation successful"
    );
    console.log("📧 Frontend: selectedHotel", selectedHotel.name);

    setPaymentSuccess(true);
    setShowPaymentSimButtons(false);
    setPaymentError("");

    const bookingSuccess = await bookMultipleRooms(selectedHotel.name)
    // const bookingSuccess = true;

    if (bookingSuccess) {
      console.log("📧 Frontend: Room booking completed successfully");
      await sendBookingReceiptEmail();
    } else {
      console.error("📧 Frontend: Room booking failed");
      setPaymentSuccess(false);
      setPaymentError(
        "Payment successful but booking failed. Please try again."
      );
    }
  };

  const sendBookingReceiptEmail = async () => {
    console.log("📧 Frontend: sendBookingReceiptEmail called");

    try {
      const bookingDetails = {
        userName: userDetails?.name || "",
        userEmail: userDetails?.email || "",
        hotelName: selectedHotel?.name,
        hotelLocation: selectedHotel?.location,
        roomType,
        rooms,
        checkIn: checkInDate || "Not selected",
        checkOut: checkOutDate || "Not selected",
        guests,
        specialRequests: "",
        price: getBasePrice(),
        discount: discount ?? 0,
        finalPrice: calculateFinalPrice(),
        paymentStatus: "Success",
        bookingDate: new Date().toLocaleString(),
        bookingId: `bkg-${Date.now()}`,
      };

      console.log("📧 Frontend: Prepared booking details:", bookingDetails);

      const response = await fetch(
        "https://voyagerserver.onrender.com/api/bookings/send-receipt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingDetails),
        }
      );

      const data = await response.json();
      console.log("📧 Frontend: API response data:", data);

      if (data.success) {
        console.log("📧 Frontend: Email sent successfully");
        toast.success("Booking receipt email sent successfully");
      } else {
        console.error("📧 Frontend: Email sending failed");
        toast.error(
          "Failed to send booking receipt email. Please try again later."
        );
      }
    } catch (error) {
      console.error(
        "📧 Frontend: Exception occurred while sending email:",
        error
      );
      toast.error(
        "An error occurred while sending booking receipt email. Please try again later."
      );
    }
  };

  const handleSimulateNo = () => {
    setPaymentSuccess(false);
    setShowPaymentSimButtons(false);
    setPaymentError("Payment failed. Please try again.");
  };

  const generateReceipt = () => {
    const details = {
      bookingId: Date.now(),
      userName: userDetails?.name || "",
      userEmail: userDetails?.email || "",
      hotelName: selectedHotel?.name,
      hotelLocation: selectedHotel?.location,
      roomType,
      rooms,
      checkIn: checkInDate || "Not selected",
      checkOut: checkOutDate || "Not selected",
      guests,
      specialRequests: "",
      price: getBasePrice(),
      discount: discount ?? 0,
      finalPrice: calculateFinalPrice(),
      paymentStatus: paymentSuccess ? "Success" : "Failed",
      bookingDate: new Date().toLocaleString(),
    };
    const doc = new jsPDF();
    // Draw border
    doc.setDrawColor(100);
    doc.setLineWidth(0.5);
    doc.rect(8, 8, 194, 275, "S");
    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Hotel Booking Receipt", 105, 22, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    let y = 35;
    // Section: Booking Info
    doc.setFont("helvetica", "bold");
    doc.text("Booking Information", 12, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text(`Booking ID:`, 12, y);
    doc.text(`${details.bookingId}`, 60, y);
    y += 8;
    doc.text(`Booking Date:`, 12, y);
    doc.text(`${details.bookingDate}`, 60, y);
    y += 12;
    // Section: User Info
    doc.setFont("helvetica", "bold");
    doc.text("Guest Information", 12, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text(`Name:`, 12, y);
    doc.text(`${details.userName}`, 60, y);
    y += 8;
    doc.text(`Email:`, 12, y);
    doc.text(`${details.userEmail}`, 60, y);
    y += 12;
    // Section: Hotel Info
    doc.setFont("helvetica", "bold");
    doc.text("Hotel Details", 12, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text(`Hotel:`, 12, y);
    doc.text(`${details.hotelName}`, 60, y);
    y += 8;
    doc.text(`Location:`, 12, y);
    doc.text(`${details.hotelLocation}`, 60, y);
    y += 12;
    // Section: Stay Info
    doc.setFont("helvetica", "bold");
    doc.text("Stay Details", 12, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text(`Room Type:`, 12, y);
    doc.text(`${details.roomType}`, 60, y);
    y += 8;
    doc.text(`Rooms:`, 12, y);
    doc.text(`${details.rooms}`, 60, y);
    y += 8;
    doc.text(`Check-in:`, 12, y);
    doc.text(`${details.checkIn}`, 60, y);
    y += 8;
    doc.text(`Check-out:`, 12, y);
    doc.text(`${details.checkOut}`, 60, y);
    y += 8;
    doc.text(`Guests:`, 12, y);
    doc.text(`${details.guests}`, 60, y);
    y += 8;
    doc.text(`Special Requests:`, 12, y);
    doc.text(`${details.specialRequests}`, 60, y);
    y += 12;
    // Section: Payment Info
    doc.setFont("helvetica", "bold");
    doc.text("Payment Summary", 12, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text(`Base Price:`, 12, y);
    doc.text(`Rs${details.price}`, 60, y);
    y += 8;
    doc.text(`Discount:`, 12, y);
    doc.text(`${details.discount}%`, 60, y);
    y += 8;
    doc.text(`Final Price:`, 12, y);
    doc.text(`Rs${details.finalPrice}`, 60, y);
    y += 8;
    doc.text(`Payment Status:`, 12, y);
    doc.text(`${details.paymentStatus}`, 60, y);
    y += 12;
    // Thank you note
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Thank you for booking with Voyager!", 105, y, {
      align: "center",
    });
    doc.save("receipt.pdf");
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();

    if (!newReview.title.trim() || !newReview.comment.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!userDetails?.name) {
      toast.error("Please login to submit a review");
      return;
    }

    const review = {
      id: Date.now(),
      userName: userDetails.name,
      rating: newReview.rating,
      title: newReview.title.trim(),
      comment: newReview.comment.trim(),
      date: "Just now",
      verified: false,
    };

    setReviews((prevReviews) => [review, ...prevReviews]);
    setNewReview({ rating: 5, title: "", comment: "" });
    setShowReviewForm(false);
    setReviewSubmitted(true);
    toast.success("Review submitted successfully!");

    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return selectedHotel?.rating || 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  return (
    <div className="bg-blue-50 min-h-screen mt-10 p-10">
      <ToastContainer />
      <div className="container mx-auto py-6 space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="h-12 flex items-center justify-center rounded-xl bg-blue-800 text-3xl font-bold tracking-tight text-white shadow-md">
            Find Your Perfect Stay
          </h1>
          <p className="rounded-lg bg-blue-200 py-2 text-black">
            Search for hotels, compare prices, and book your ideal
            accommodation.
          </p>
        </header>

        {paymentError && (
          <div className="flex justify-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-xl w-full text-center">
              <strong className="font-bold">Payment Failed!</strong>
              <span className="block">{paymentError}</span>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <aside className="space-y-6">
            <div className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
              <div className="space-y-2">
                <h3 className="font-medium">Search</h3>
                <input
                  type="search"
                  placeholder="Destination, hotel name..."
                  className="w-full rounded-md border px-3 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Check‑in / Check‑out</h3>
                <div className="grid gap-2">
                  <input
                    type="date"
                    className="w-full rounded-md border px-3 py-2"
                    value={checkInDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      setCheckInDate(e.target.value);
                      // Clear check-out if it's before new check-in
                      if (checkOutDate && e.target.value >= checkOutDate) {
                        setCheckOutDate("");
                      }
                    }}
                  />
                  <input
                    type="date"
                    className="w-full rounded-md border px-3 py-2"
                    value={checkOutDate}
                    min={checkInDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Room Type</h3>
                <select
                  className="w-full rounded-md border px-3 py-2"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                >
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                </select>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Number of Rooms</h3>
                <select
                  className="w-full rounded-md border px-3 py-2"
                  value={sidebarRooms || 1}
                  onChange={(e) => setSidebarRooms(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Room" : "Rooms"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Price Range</h3>
                  <span className="text-sm text-gray-500">
                    Rs{priceRange[0]} - Rs{priceRange[1]}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([
                      priceRange[0],
                      Number.parseInt(e.target.value),
                    ])
                  }
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="15000"
                  step="100"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([
                      Number.parseInt(e.target.value),
                      priceRange[1],
                    ])
                  }
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={applyFilters}
                  disabled={loading}
                  className={`w-full rounded-md py-2 px-4 font-medium text-white transition-colors ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Applying Filters..." : "Apply Filters"}
                </button>

                <button
                  onClick={applyClientSideFilters}
                  disabled={loading}
                  className="w-full rounded-md py-2 px-4 font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                >
                  Basic Filter (No API)
                </button>
              </div>

              {availabilityChecked && (
                <button
                  onClick={() => {
                    setAvailableHotels(hotels);
                    setFilteredHotels(hotels);
                    setAvailabilityChecked(false);
                    toast.info("Showing all hotels");
                  }}
                  className="w-full rounded-md py-2 px-4 font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Show All Hotels
                </button>
              )}
            </div>
          </aside>

          <main className="space-y-6">
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            )}

            {selectedHotel ? (
              <section className="space-y-6">
                <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                  {/* Header with back button and rating */}
                  <div className="flex items-center justify-between border-b p-4">
                    <button
                      onClick={handleBackToResults}
                      className="text-blue-600 hover:underline"
                    >
                      ← Back to results
                    </button>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      ⭐ {selectedHotel.rating || "N/A"}
                    </div>
                  </div>

                  {/* Hotel Title and Location */}
                  <div className="space-y-1 p-4 border-b">
                    <h2 className="text-2xl font-bold tracking-tight">
                      {selectedHotel.name}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedHotel.location}</span>
                      <a
                        href={getGoogleMapsLink(selectedHotel)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        (View on Map)
                      </a>
                    </div>
                  </div>

                  {/* Tab Navigation */}
                  <div className="border-b">
                    <nav className="flex space-x-8 px-4">
                      {[
                        { id: "overview", label: "Overview" },
                        { id: "rooms", label: "Rooms" },
                        { id: "amenities", label: "Amenities" },
                        { id: "reviews", label: "Reviews" },
                        { id: "policies", label: "Policies" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === tab.id
                              ? "border-blue-500 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="p-4">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                      <div className="space-y-8">
                        {/* Enhanced Image Gallery */}
                        <div>
                          <EnhancedImageGallery hotel={selectedHotel} />
                        </div>

                        {/* Hotel Description */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-gray-800">
                            About This Hotel
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {selectedHotel.description ||
                              "Experience luxury and comfort at this exceptional hotel."}
                          </p>

                          {/* Hotel Features */}
                          {selectedHotel.features &&
                            selectedHotel.features.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                {selectedHotel.features.map(
                                  (feature, index) => (
                                    <div
                                      key={index}
                                      className="text-center p-3 bg-blue-50 rounded-lg"
                                    >
                                      <div className="text-sm font-medium text-gray-700">
                                        {feature}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>

                        {/* Nearby Attractions from API */}
                        {getNearbyAttractions(selectedHotel).length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800">
                              Nearby Attractions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {getNearbyAttractions(selectedHotel).map(
                                (attraction, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 p-4 rounded-lg border hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-gray-800">
                                          {attraction.name}
                                        </h4>
                                        <div className="text-sm text-gray-600">
                                          {attraction.description}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Transportation from API */}
                        {(() => {
                          const transport =
                            getTransportationOptions(selectedHotel);
                          const hasTransport =
                            transport.airports.length > 0 ||
                            transport.railways.length > 0 ||
                            transport.busStations.length > 0 ||
                            transport.ports.length > 0 ||
                            transport.localTransport.length > 0;

                          if (!hasTransport) return null;

                          return (
                            <div className="space-y-6">
                              <h3 className="text-xl font-semibold text-gray-800">
                                Transportation & Connectivity
                              </h3>

                              {/* Airports */}
                              {transport.airports.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <span className="text-lg">✈️</span>
                                    Airports
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {transport.airports.map(
                                      (airport, index) => (
                                        <div
                                          key={index}
                                          className="bg-blue-50 p-3 rounded-lg border"
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-gray-800">
                                              {airport.name}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              {airport.distance}
                                            </div>
                                          </div>
                                          <div className="text-sm text-gray-600 mb-1">
                                            Travel time: {airport.travel_time}
                                          </div>
                                          <div className="text-sm text-gray-600 mb-1">
                                            Cost: {airport.cost}
                                          </div>
                                          <div className="flex flex-wrap gap-1">
                                            {airport.transport_options?.map(
                                              (mode, idx) => (
                                                <span
                                                  key={idx}
                                                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                                >
                                                  {mode}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Railways */}
                              {transport.railways.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <span className="text-lg">🚂</span>
                                    Railway Stations
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {transport.railways.map(
                                      (station, index) => (
                                        <div
                                          key={index}
                                          className="bg-green-50 p-3 rounded-lg border"
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-gray-800">
                                              {station.name}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              {station.distance}
                                            </div>
                                          </div>
                                          <div className="text-sm text-gray-600 mb-1">
                                            Travel time: {station.travel_time}
                                          </div>
                                          <div className="text-sm text-gray-600 mb-1">
                                            Cost: {station.cost}
                                          </div>
                                          <div className="flex flex-wrap gap-1">
                                            {station.transport_options?.map(
                                              (mode, idx) => (
                                                <span
                                                  key={idx}
                                                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                                                >
                                                  {mode}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Bus Stations */}
                              {transport.busStations.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <span className="text-lg">🚌</span>
                                    Bus Stations
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {transport.busStations.map(
                                      (station, index) => (
                                        <div
                                          key={index}
                                          className="bg-yellow-50 p-3 rounded-lg border"
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-gray-800">
                                              {station.name}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              {station.distance}
                                            </div>
                                          </div>
                                          <div className="text-sm text-gray-600 mb-1">
                                            Travel time: {station.travel_time}
                                          </div>
                                          <div className="text-sm text-gray-600 mb-1">
                                            Cost: {station.cost}
                                          </div>
                                          <div className="flex flex-wrap gap-1">
                                            {station.transport_options?.map(
                                              (mode, idx) => (
                                                <span
                                                  key={idx}
                                                  className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                                                >
                                                  {mode}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Ports */}
                              {transport.ports.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <span className="text-lg">🚢</span>
                                    Ports
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {transport.ports.map((port, index) => (
                                      <div
                                        key={index}
                                        className="bg-cyan-50 p-3 rounded-lg border"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="font-medium text-gray-800">
                                            {port.name}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            {port.distance}
                                          </div>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-1">
                                          Travel time: {port.travel_time}
                                        </div>
                                        <div className="text-sm text-gray-600 mb-1">
                                          Cost: {port.cost}
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {port.transport_options?.map(
                                            (mode, idx) => (
                                              <span
                                                key={idx}
                                                className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded"
                                              >
                                                {mode}
                                              </span>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Local Transport */}
                              {transport.localTransport.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <span className="text-lg">🚕</span>
                                    Local Transportation
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {transport.localTransport.map(
                                      (option, index) => (
                                        <div
                                          key={index}
                                          className="bg-purple-50 p-3 rounded-lg border"
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-gray-800">
                                              {option.name}
                                            </div>
                                          </div>
                                          <div className="text-sm text-gray-600 mb-1">
                                            Distance: {option.distance}
                                          </div>
                                          <div className="flex flex-wrap gap-1">
                                            {option.transport_options?.map(
                                              (mode, idx) => (
                                                <span
                                                  key={idx}
                                                  className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                                                >
                                                  {mode}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Contact Information from API */}
                        {selectedHotel.contact_info &&
                          selectedHotel.contact_info.length > 0 && (
                            <div className="space-y-4">
                              <h3 className="text-xl font-semibold text-gray-800">
                                Contact Information
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedHotel.contact_info.map(
                                  (contact, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-3"
                                    >
                                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600">
                                          {contact.contact_type === "phone"
                                            ? "📞"
                                            : "✉️"}
                                        </span>
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-700 capitalize">
                                          {contact.contact_type}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {contact.value}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                    {/* Rooms Tab */}
                    {activeTab === "rooms" && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Available Rooms
                        </h3>
                        {selectedHotel.roomTypes.map((room, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              roomType.toLowerCase() === room.type.toLowerCase()
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-800">
                                {room.type} Room
                              </h4>
                              <div className="text-right">
                                <span className="text-lg font-bold text-gray-800">
                                  Rs{room.price}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {" "}
                                  / night
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {room.description ||
                                `Comfortable ${room.type.toLowerCase()} accommodation.`}
                            </p>

                            {/* Room Features */}
                            {room.features && room.features.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 mb-3">
                                {room.features.map((feature, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1"
                                  >
                                    <span>✓</span>
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <button
                              onClick={() => setRoomType(room.type)}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                roomType.toLowerCase() ===
                                room.type.toLowerCase()
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {roomType.toLowerCase() ===
                              room.type.toLowerCase()
                                ? "Selected"
                                : "Select Room"}
                            </button>
                          </div>
                        ))}

                        {/* Booking Form */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-4">Book Your Stay</h4>
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-1 block font-medium">
                                  Check‑in
                                </label>
                                <input
                                  type="date"
                                  className="w-full rounded-md border px-3 py-2"
                                  value={checkInDate}
                                  onChange={(e) =>
                                    setCheckInDate(e.target.value)
                                  }
                                />
                              </div>
                              <div>
                                <label className="mb-1 block font-medium">
                                  Check‑out
                                </label>
                                <input
                                  type="date"
                                  className="w-full rounded-md border px-3 py-2"
                                  value={checkOutDate}
                                  onChange={(e) =>
                                    setCheckOutDate(e.target.value)
                                  }
                                />
                              </div>
                            </div>

                            <div>
                              <label className="mb-1 block font-medium">
                                Number of Rooms
                              </label>
                              <select
                                className="w-full rounded-md border px-3 py-2"
                                value={rooms}
                                onChange={(e) =>
                                  setRooms(Number(e.target.value))
                                }
                              >
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <option key={n} value={n}>
                                    {n} {n === 1 ? "Room" : "Rooms"}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="mb-1 block font-medium">
                                Special Requests
                              </label>
                              <textarea
                                className="min-h-[100px] w-full rounded-md border px-3 py-2"
                                placeholder="Any special requests or preferences..."
                              />
                            </div>

                            {/* Price Summary */}
                            <div className="space-y-4 border-t pt-4">
                              <h4 className="font-medium">Price Summary</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Room rate ({roomType})</span>
                                  <span>
                                    Rs{getBasePrice()} × {calculateDays()}{" "}
                                    nights × {rooms} rooms
                                  </span>
                                </div>
                                {discount && (
                                  <div className="flex justify-between text-green-600">
                                    <span>Discount ({discount}%)</span>
                                    <span>
                                      -Rs
                                      {Math.round(
                                        calculateTotalPrice() * (discount / 100)
                                      )}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span>Taxes & fees (12%)</span>
                                  <span>
                                    Rs
                                    {Math.round(
                                      (discount
                                        ? calculateTotalPrice() *
                                          (1 - discount / 100)
                                        : calculateTotalPrice()) * 0.12
                                    )}
                                  </span>
                                </div>
                                <hr />
                                <div className="flex justify-between font-medium">
                                  <span>Total</span>
                                  <span>Rs{calculateFinalPrice()}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={handleBooking}
                              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Amenities Tab */}
                    {activeTab === "amenities" && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Hotel Amenities
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-3">
                              General Facilities
                            </h4>
                            <div className="space-y-2">
                              {(
                                selectedHotel.amenities?.general_facilities ||
                                []
                              ).map((amenity, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm text-gray-600"
                                >
                                  <span className="text-green-500">✓</span>
                                  <span>{amenity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-3">
                              Business & Recreation
                            </h4>
                            <div className="space-y-2">
                              {(
                                selectedHotel.amenities?.business_recreation ||
                                []
                              ).map((amenity, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm text-gray-600"
                                >
                                  <span className="text-green-500">✓</span>
                                  <span>{amenity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Amenity Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">
                              🏊‍♂️ Recreation
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {(selectedHotel.amenities?.recreation || []).map(
                                (amenity, index) => (
                                  <li key={index}>{amenity}</li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-2">
                              🍽️ Dining
                            </h4>
                            <ul className="text-sm text-green-700 space-y-1">
                              {(selectedHotel.amenities?.dining || []).map(
                                (amenity, index) => (
                                  <li key={index}>{amenity}</li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-medium text-purple-800 mb-2">
                              💼 Business
                            </h4>
                            <ul className="text-sm text-purple-700 space-y-1">
                              {(selectedHotel.amenities?.business || []).map(
                                (amenity, index) => (
                                  <li key={index}>{amenity}</li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === "reviews" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold text-blue-600">
                              {calculateAverageRating()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`text-lg ${
                                      star <=
                                      Math.floor(calculateAverageRating())
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    ⭐
                                  </span>
                                ))}
                              </div>
                              <div className="text-sm text-gray-600">
                                Based on {reviews.length} reviews
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            {showReviewForm ? "Cancel" : "Write a Review"}
                          </button>
                        </div>

                        {reviewSubmitted && (
                          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">✓</span>
                              <span>
                                Thank you for your review! It has been added
                                successfully.
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Review Form */}
                        {showReviewForm && (
                          <div className="bg-gray-50 p-6 rounded-lg border">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">
                              Share Your Experience
                            </h4>
                            <form
                              onSubmit={handleSubmitReview}
                              className="space-y-4"
                            >
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Overall Rating
                                </label>
                                <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() =>
                                        setNewReview((prev) => ({
                                          ...prev,
                                          rating: star,
                                        }))
                                      }
                                      className={`text-2xl transition-colors ${
                                        star <= newReview.rating
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      } hover:text-yellow-400`}
                                    >
                                      ⭐
                                    </button>
                                  ))}
                                  <span className="ml-2 text-sm text-gray-600">
                                    {newReview.rating} star
                                    {newReview.rating !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Review Title
                                </label>
                                <input
                                  type="text"
                                  value={newReview.title}
                                  onChange={(e) =>
                                    setNewReview((prev) => ({
                                      ...prev,
                                      title: e.target.value,
                                    }))
                                  }
                                  placeholder="Summarize your experience..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  maxLength={100}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  {newReview.title.length}/100 characters
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Your Review
                                </label>
                                <textarea
                                  value={newReview.comment}
                                  onChange={(e) =>
                                    setNewReview((prev) => ({
                                      ...prev,
                                      comment: e.target.value,
                                    }))
                                  }
                                  placeholder="Tell others about your experience at this hotel..."
                                  rows={4}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  maxLength={500}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  {newReview.comment.length}/500 characters
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <button
                                  type="submit"
                                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  Submit Review
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowReviewForm(false);
                                    setNewReview({
                                      rating: 5,
                                      title: "",
                                      comment: "",
                                    });
                                  }}
                                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        {/* Individual Reviews from API */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-800">
                            Guest Reviews ({reviews.length})
                          </h4>
                          {reviews.map((review, index) => (
                            <div
                              key={review.id || index}
                              className={`p-4 rounded-lg border transition-all duration-300 ${
                                review.date === "Just now"
                                  ? "bg-blue-50 border-blue-200 shadow-md"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="font-medium text-gray-800">
                                    {review.title ||
                                      review.heading ||
                                      "Great Stay"}
                                  </div>
                                  {review.verified && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                      Verified Stay
                                    </span>
                                  )}
                                  {review.date === "Just now" && (
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full animate-pulse">
                                      New
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className={`text-sm ${
                                        star <= review.rating
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    >
                                      ⭐
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {review.comment}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                  - {review.userName || review.name} •{" "}
                                  {review.date}
                                </div>
                                {review.date === "Just now" && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    Your review
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {reviews.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <div className="text-4xl mb-2">📝</div>
                            <p>
                              No reviews yet. Be the first to share your
                              experience!
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Policies Tab */}
                    {activeTab === "policies" && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Hotel Policies
                        </h3>

                        {selectedHotel.policy &&
                        selectedHotel.policy.length > 0 ? (
                          selectedHotel.policy.map((policy, index) => (
                            <div key={index} className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-3">
                                    Check-in/Check-out
                                  </h4>
                                  <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                      <span>Check-in:</span>
                                      <span>
                                        {policy.check_in || "3:00 PM onwards"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Check-out:</span>
                                      <span>
                                        {policy.check_out || "12:00 PM"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Early check-in:</span>
                                      <span>
                                        {policy.early_check_in ||
                                          "Subject to availability"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Late check-out:</span>
                                      <span>
                                        {policy.late_check_out ||
                                          "Additional charges apply"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-3">
                                    Cancellation Policy
                                  </h4>
                                  <div className="space-y-2 text-sm text-gray-600">
                                    {policy.cancellation_policy &&
                                    policy.cancellation_policy.length > 0 ? (
                                      policy.cancellation_policy.map(
                                        (item, idx) => (
                                          <div key={idx}>{item}</div>
                                        )
                                      )
                                    ) : (
                                      <>
                                        <div>
                                          Free cancellation up to 24 hours
                                          before check-in
                                        </div>
                                        <div>
                                          Cancellation within 24 hours: 1 night
                                          charge
                                        </div>
                                        <div>
                                          No-show: Full booking amount charged
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {policy.important_info &&
                                policy.important_info.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-3">
                                      Important Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                      {policy.important_info.map(
                                        (info, idx) => (
                                          <div key={idx}>• {info}</div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {policy.House_rules &&
                                policy.House_rules.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-3">
                                      House Rules
                                    </h4>
                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                      <ul className="text-sm text-gray-700 space-y-1">
                                        {policy.House_rules.map((rule, idx) => (
                                          <li key={idx}>• {rule}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                              {policy.payment_info &&
                                policy.payment_info.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-3">
                                      Payment Information
                                    </h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                      {policy.payment_info.map((info, idx) => (
                                        <div key={idx}>• {info}</div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>
                              No policy information available for this hotel.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Game Selector and Booking Flow */}
                {showGameSelector && (
                  <div ref={gameSelectorRef} className="space-y-4">
                    <GameSelector
                      onDiscountWon={handleDiscountWon}
                      onBackToPackages={() => setShowGameSelector(false)}
                      discount={discount}
                      packageName={selectedHotel.name}
                    />

                    <div className="flex justify-between gap-4">
                      <button
                        className="rounded border border-gray-300 bg-white px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                        onClick={() => setShowGameSelector(false)}
                      >
                        Back to Booking
                      </button>
                      {!paymentSuccess && !showPaymentSimButtons && (
                        <button
                          className="w-full rounded-md bg-green-600 py-2 px-4 font-medium text-white hover:bg-green-700"
                          onClick={() => loadRazorpay(selectedHotel)}
                        >
                          Finalize Booking (Rs{calculateFinalPrice()})
                        </button>
                      )}
                      {showPaymentSimButtons && (
                        <div className="flex gap-4 justify-center mt-4">
                          <button
                            className="rounded-md bg-green-600 py-2 px-4 font-medium text-white hover:bg-green-700"
                            onClick={handleSimulateYes}
                          >
                            Yes
                          </button>
                          <button
                            className="rounded-md bg-red-600 py-2 px-4 font-medium text-white hover:bg-red-700"
                            onClick={handleSimulateNo}
                          >
                            No
                          </button>
                        </div>
                      )}
                      {paymentSuccess && !showPaymentSimButtons && (
                        <>
                          <button
                            className="w-full rounded-md bg-gray-400 py-2 px-4 font-medium text-white cursor-not-allowed mb-2"
                            disabled
                          >
                            Paid Successfully
                          </button>
                          <button
                            className="w-full rounded-md bg-blue-600 py-2 px-4 font-medium text-white hover:bg-blue-700"
                            onClick={generateReceipt}
                          >
                            Download Receipt
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </section>
            ) : (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {filteredHotels.length} hotel
                    {filteredHotels.length !== 1 && "s"} found
                    {availabilityChecked && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Filtered by availability)
                      </span>
                    )}
                  </h2>
                  <select className="rounded-md border px-3 py-2">
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredHotels.map((hotel, idx) => (
                    <HotelCard
                      key={hotel._id || idx}
                      hotel={hotel}
                      onBookNow={() => handleBookNow(hotel._id)}
                    />
                  ))}
                </div>

                {filteredHotels.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏨</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No hotels found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {availabilityChecked
                        ? "No hotels are available for your selected criteria. Try adjusting your search parameters."
                        : "Try adjusting your search criteria or apply filters for specific dates."}
                    </p>
                    {availabilityChecked && (
                      <button
                        onClick={() => {
                          setAvailableHotels(hotels);
                          setFilteredHotels(hotels);
                          setAvailabilityChecked(false);
                          toast.info("Showing all hotels");
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Show All Hotels
                      </button>
                    )}
                  </div>
                )}
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
