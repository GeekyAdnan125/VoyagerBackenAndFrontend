"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Calendar, Search, Phone, Mail } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

export default function BookingsPage() {
  const { selectedHotel } = useAppContext();
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedHotel?.id) return;

      try {
        const res = await fetch(`https://voyagerserver.onrender.com/api/owner/hotel/rooms/${selectedHotel.id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setRooms(data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    };

    fetchData();
  }, [selectedHotel?.id]);

  // Fetch all hotels on mount
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch("https://voyagerserver.onrender.com/api/owner/hotel/all", { credentials: "include" });
        const data = await res.json();
        setHotels(data);
      } catch (err) {
        console.error("Error fetching hotels:", err);
      }
    };
    fetchHotels();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Flatten bookings from rooms
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const bookings = safeRooms.flatMap(room =>
    Array.isArray(room.bookingDetails) ? room.bookingDetails.map(booking => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);

      const status =
        today < checkIn
          ? "confirmed"
          : today >= checkIn && today < checkOut
          ? "checked-in"
          : "checked-out";

      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const pricePerNight = room.price || 0;
      const totalAmount = nights * pricePerNight;

      return {
        ...booking,
        roomId: room._id,
        roomType: room.room_type,
        status,
        nights,
        totalAmount,
      };
    }) : []
  );

  const roomStats = {
    total: rooms.length,
    occupied: bookings.filter(b => b.status === "checked-in").length,
    available: rooms.length - bookings.filter(b => b.status === "checked-in").length,
  };

  const filteredBookings = bookings.filter(booking => {
    const matchSearch =
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === "all" || booking.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "checked-in":
        return "bg-green-100 text-green-800";
      case "checked-out":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // In the bookings mapping, calculate total using hotel room price
  const getRoomPrice = (hotel, roomType) => {
    if (!hotel) return 0;
    const type = roomType?.toLowerCase();
    let arr = [];
    if (type === "standard") arr = hotel.standard_rooms;
    else if (type === "deluxe") arr = hotel.deluxe_rooms;
    else if (type === "suite") arr = hotel.suite_rooms;
    if (!arr || arr.length === 0) return 0;
    // Use first price found (or improve if you have more info)
    return arr[0]?.price || 0;
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1508614999368-9260051292e5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Z3JhZGllbnR8ZW58MHx8MHx8fDA%3D')",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Room Stats */}
        <Card className="mb-6 bg-white">
          <CardHeader>
            <CardTitle>Room Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {roomStats.total}
              </div>
              <div className="text-sm text-gray-600">Total Rooms</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {roomStats.occupied}
              </div>
              <div className="text-sm text-gray-600">Occupied</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {roomStats.available}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6 bg-white">
          <CardHeader>
            <CardTitle>Search & Filter Bookings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by name, email or room ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-1/2"
            />
            <div className="flex gap-2">
              {["all", "confirmed", "checked-in", "checked-out"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  onClick={() => setFilterStatus(status)}
                  size="sm"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Booking Cards */}
        <div className="space-y-4">
          {filteredBookings.map((b, i) => {
            const hotel = hotels.find(h => h._id === b.hotelId || h.id === b.hotelId);
            const pricePerNight = getRoomPrice(hotel, b.roomType);
            const totalAmount = b.nights * pricePerNight;
            return (
              <Card key={i} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{b.userName || "Guest"}</h3>
                          <p className="text-sm text-gray-600">Room ID: {b.roomId}</p>
                        </div>
                        <Badge className={getStatusColor(b.status)}>
                          {b.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Room Type</p>
                          <p className="font-medium">{b.roomType || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Check-in</p>
                          <p className="font-medium">{new Date(b.check_in).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Check-out</p>
                          <p className="font-medium">{new Date(b.check_out).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total</p>
                          <p className="font-medium">₹{totalAmount.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{b.userEmail || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{b.userPhone || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{b.nights} nights</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        {b.status === "confirmed" && (
                          <Button size="sm">Check In</Button>
                        )}
                        {b.status === "checked-in" && (
                          <Button size="sm" variant="secondary">Check Out</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredBookings.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
