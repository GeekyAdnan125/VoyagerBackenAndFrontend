const express = require("express");
const bookingrouter = express.Router();

// Bookings
const {
  createBooking,
  cancelBooking,
  getMyBookings,
  getAvailableHotels,
  createBookingEntry,
  bookMultipleRoomsIfAvailable,
} = require("../controller/bookingcontroller");
const { authMiddleware } = require("../middleware/AuthMiddleware");

// Souvenirs
const {
  createSouvenir,
  getSouvenirsByPlace,
  getAllSouvenirs,
  getSouvenirsByCategory,
  getSouvenirsByVendorName,
} = require("../controller/Souviners");

// Email controller
const { sendBookingReceiptEmail } = require("../controller/emailController");

// Booking routes
bookingrouter.post("/bookingHotel", authMiddleware, createBooking);
bookingrouter.post("/cancelbooking/:booking_id", authMiddleware, cancelBooking);
bookingrouter.get("/mybookings", authMiddleware, getMyBookings);
bookingrouter.post("/available-hotels", authMiddleware, getAvailableHotels);
bookingrouter.post("/createBookingEntry", authMiddleware, createBookingEntry);
bookingrouter.post(
  "/book-multiple-rooms",
  authMiddleware,
  bookMultipleRoomsIfAvailable
);

// Email route
bookingrouter.post("/send-receipt", sendBookingReceiptEmail);

// Souvenir routes
bookingrouter.post("/createsouvenir", authMiddleware, createSouvenir);
bookingrouter.get("/souvenirs/place/:place", getSouvenirsByPlace);
bookingrouter.get("/souvenirs/getallsouviners", getAllSouvenirs);
bookingrouter.get("/souvenirs/category/:category", getSouvenirsByCategory);
bookingrouter.get("/souvenirs/vendor/:vendorName", getSouvenirsByVendorName);

module.exports = bookingrouter;
