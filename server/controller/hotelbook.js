const Hotel = require('../models/HotelSchema');
const Razorpay = require('razorpay');
const crypto = require("crypto");
require('dotenv').config();
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get hotel by name
const getHotelByName = async (req, res) => { 
    try {
        const hotel = await Hotel.findOne({ name: req.params.name });
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        res.status(200).json(hotel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 
// Get all hotels
const getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find();
        res.status(200).json(hotels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get hotel by ID
const getHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        res.status(200).json(hotel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Filter hotels by search query and price range
const filterHotels = async (req, res) => {
    try {
        const { searchQuery, minPrice, maxPrice } = req.query;
        let query = {};
        if (searchQuery) {
            query.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { location: { $regex: searchQuery, $options: 'i' } }
            ];
        }
        if (minPrice && maxPrice) {
            query.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
        }
        const hotels = await Hotel.find(query);
        res.status(200).json(hotels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check room availability
const checkRoomAvailability = async (req, res) => {
    try {
        const { hotelId, roomType, rooms } = req.body;
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        const roomTypeData = hotel.roomTypes.find(rt => rt.type.toLowerCase() === roomType.toLowerCase());
        if (!roomTypeData) {
            return res.status(404).json({ message: "Room type not found" });
        }
        const isAvailable = roomTypeData.available >= parseInt(rooms);
        res.status(200).json({ 
            available: isAvailable,
            remainingRooms: roomTypeData.available
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update room availability after booking
const updateRoomAvailability = async (req, res) => {
    try {
        const { hotelId, roomType, rooms } = req.body;
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        const roomTypeData = hotel.roomTypes.find(rt => rt.type.toLowerCase() === roomType.toLowerCase());
        if (!roomTypeData) {
            return res.status(404).json({ message: "Room type not found" });
        }
        if (roomTypeData.available < parseInt(rooms)) {
            return res.status(400).json({ message: "Not enough rooms available" });
        }
        roomTypeData.available -= parseInt(rooms);
        await hotel.save();
        res.status(200).json({ 
            message: "Room availability updated successfully",
            remainingRooms: roomTypeData.available
        });
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
};

// Create Razorpay order
const createOrder = async (req, res) => {
    const { hotelId, amount } = req.body;
    if (!hotelId || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid hotelId or amount" });
    }
    try {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        const totalAmount = Math.round(amount * 100); // in paise
        const options = {
            amount: totalAmount,
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };
        instance.orders.create(options, (err, order) => {
            if (err || !order) {
                console.error("Error creating Razorpay order", err);
                return res.status(500).json({ message: "Unable to create order", error: err?.message || 'Unknown error', order: null });
            }
            // Always return order and hotel, even if order is null
            res.json({ order, hotel });
        });
    } catch (error) {
        res.status(500).json({ message: error.message, order: null });
    }
};

// Verify Razorpay payment
const verifyPayment = (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const hmac = crypto.createHmac("sha256", '0BlelHv2GYnSWQRtR2fqDd63');
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const digest = hmac.digest("hex");
    if (digest === razorpay_signature) {
        res.json({ status: "ok" });
    } else {
        res.status(400).json({ status: "invalid signature" });
    }
};

// Update hotel by name
const updateHotelByName = async (req, res) => {
    console.log(`Backend: Received PUT request to update hotel by name: ${req.params.name}`);
    try {
        const hotelName = req.params.name;
        const updatedData = req.body;
        
        console.log("Backend: Update data received from frontend:", {
            hotelName: updatedData.name,
            hotelId: updatedData._id,
            bookingStatusLength: updatedData.bookingstatus?.length || 0
        });

        // Log some booking status details for debugging
        if (updatedData.bookingstatus && updatedData.bookingstatus.length > 0) {
            console.log("Backend: Sample booking status entries:");
            updatedData.bookingstatus.slice(0, 3).forEach((booking, index) => {
                console.log(`Backend: Booking ${index + 1}:`, {
                    roomType: booking.roomType,
                    bookingId: booking.bookingId,
                    userId: booking.userId,
                    email: booking.email,
                    checkIn: booking.checkIn,
                    checkOut: booking.checkOut
                });
            });
        }

        // First, check if the hotel exists
        const existingHotel = await Hotel.findOne({ name: hotelName });
        if (!existingHotel) {
            console.error(`Backend Error: Hotel with name "${hotelName}" not found. Cannot update.`);
            return res.status(404).json({ message: "Hotel not found" });
        }

        console.log(`Backend: Found existing hotel with ID: ${existingHotel._id}`);

        // Perform the update
        const updatedHotel = await Hotel.findOneAndUpdate( 
            { name: hotelName }, 
            updatedData, 
            { new: true, runValidators: true }
        );

        if (!updatedHotel) {
            console.error(`Backend Error: Hotel update failed for "${hotelName}"`);
            return res.status(500).json({ message: "Failed to update hotel" });
        }

        console.log(`Backend: Successfully updated hotel "${hotelName}".`);
        console.log(`Backend: Updated hotel has ${updatedHotel.bookingstatus?.length || 0} booking status entries.`);
        
        // Log some updated booking status for verification
        if (updatedHotel.bookingstatus && updatedHotel.bookingstatus.length > 0) {
            const nonEmptyBookings = updatedHotel.bookingstatus.filter(b => b.bookingId && b.bookingId.trim() !== "");
            console.log(`Backend: Non-empty bookings after update: ${nonEmptyBookings.length}`);
            nonEmptyBookings.slice(0, 3).forEach((booking, index) => {
                console.log(`Backend: Updated booking ${index + 1}:`, {
                    roomType: booking.roomType,
                    bookingId: booking.bookingId,
                    userId: booking.userId,
                    email: booking.email
                });
            });
        }
        
        res.status(200).json({ 
            message: "Hotel updated successfully", 
            hotel: updatedHotel 
        });

    } catch (error) {
        console.error(`Backend: An unexpected error occurred while updating hotel "${req.params.name}":`, error);
        console.error(`Backend: Error details:`, {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ message: "Failed to update hotel", error: error.message });
    }
};

module.exports = {
    verifyPayment,
    createOrder
}; 