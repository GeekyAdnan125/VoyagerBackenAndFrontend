const express = require("express");
const ownerHotelRoutes = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/AuthMiddleware"); 
const {
  createHotel,
  getAllHotels,
  deleteHotel,
  createRooms,
  getHotelsByEmail,
  getRoomsByHotelId
} = require("../controller/hotelcontroller");
ownerHotelRoutes.post(
  "/create",    
  authMiddleware,
  authorizeRoles("Owner"),
  createHotel
);
ownerHotelRoutes.get(
  "/all",
  authMiddleware, 
  authorizeRoles("Owner", "User"),
  getAllHotels
);
ownerHotelRoutes.delete(
  "/delete/:id",
  authMiddleware,
  authorizeRoles("Owner"),
  deleteHotel
);
ownerHotelRoutes.post(
  "/rooms/bulkCreate",
  authMiddleware,
  authorizeRoles("Owner"),
  createRooms
);
ownerHotelRoutes.get(
  "/by-email/:email",
  authMiddleware,
  authorizeRoles("Owner", "User"),
  getHotelsByEmail
);
ownerHotelRoutes.get(
  "/rooms/:hotelId",
  getRoomsByHotelId
)
module.exports = ownerHotelRoutes;
