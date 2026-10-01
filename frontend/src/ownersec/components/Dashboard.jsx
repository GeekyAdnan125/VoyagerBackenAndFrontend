"use client";

import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Users, Bed, TrendingUp } from "lucide-react";

export default function Dashboard({ onNavigate }) {
  const { user, setUser, setProfileOpen, isLoading, setIsLoading, selectedHotel } =
    useAppContext();
  console.log("user", user);
  console.log("[Dashboard] selectedHotel:", selectedHotel);
  
  const [hotelData, setHotelData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({});

  // Console log hotelData whenever it changes
  console.log("hotelData state:", hotelData);

  // Utility: Get today's date in IST (YYYY-MM-DD)
  function getTodayIST() {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  }

  // Fetch hotels on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedHotel?.id) return;
      try {
        // Fetch hotel info
        const hotelRes = await fetch("https://voyagerserver.onrender.com/api/owner/hotel/all", { credentials: "include" });
        const hotels = await hotelRes.json();
        const hotel = hotels.find(h => h._id === selectedHotel.id);
        setHotelData(hotel);
        console.log("[Dashboard] Filtered hotel info:", hotel);
        // Fetch rooms
        const roomsRes = await fetch(`https://voyagerserver.onrender.com/api/owner/hotel/rooms/${selectedHotel.id}`, { credentials: "include" });
        const roomsData = await roomsRes.json();
        setRooms(roomsData);
        console.log("[Dashboard] Rooms fetched:", roomsData);
        // Compute stats
        const now = new Date();
        let totalBookings = 0, todayCheckIns = 0, todayCheckOuts = 0, occupied = 0, available = 0, revenue = 0;
        if (Array.isArray(roomsData)) {
          roomsData.forEach(room => {
            const latest = room.bookingDetails && room.bookingDetails.length > 0 ? room.bookingDetails[room.bookingDetails.length - 1] : null;
            if (latest) {
              const checkIn = latest.check_in ? new Date(latest.check_in) : null;
              const checkOut = latest.check_out ? new Date(latest.check_out) : null;
              if (checkIn && checkOut) {
                totalBookings++;
                if (checkIn.toDateString() === now.toDateString()) todayCheckIns++;
                if (checkOut.toDateString() === now.toDateString()) todayCheckOuts++;
                if (checkIn <= now && now < checkOut) occupied++;
                else available++;
                // Revenue
                let price = 'N/A';
                if (hotel) {
                  let priceObj = null;
                  if (room.room_type === 'standard' && hotel.standard_rooms?.length) priceObj = hotel.standard_rooms[0];
                  if (room.room_type === 'deluxe' && hotel.deluxe_rooms?.length) priceObj = hotel.deluxe_rooms[0];
                  if (room.room_type === 'suite' && hotel.suite_rooms?.length) priceObj = hotel.suite_rooms[0];
                  price = priceObj ? priceObj.price : 'N/A';
                }
                if (price !== 'N/A') {
                  const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
                  revenue += nights * price;
                }
              } else {
                available++;
              }
            } else {
              available++;
            }
          });
        } else {
          // Handle the case where no rooms are found
          console.log("No rooms found for this hotel");
        }
        const totalRooms = Array.isArray(roomsData) ? roomsData.length : 0;
        const occupancyRate = totalRooms > 0 ? ((occupied / totalRooms) * 100).toFixed(2) : "0.00";
        setStats({ totalBookings, todayCheckIns, todayCheckOuts, occupancyRate, availableRooms: available, totalRooms, revenue });
        console.log("[Dashboard] Stats computed:", { totalBookings, todayCheckIns, todayCheckOuts, occupancyRate, availableRooms: available, totalRooms, revenue });
      } catch (err) {
        console.error("[Dashboard] Error fetching or computing:", err);
      }
    };
    fetchData();
  }, [selectedHotel?.id]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1508614999368-9260051292e5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Z3JhZGllbnR8ZW58MHx8MHx8fDA%3D')",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        {/* Hotel Info Header */}
        {hotelData && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{hotelData.name}</h1>
            <p className="text-white/80">{hotelData.location}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ">
          <Card className="bg-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Occupancy Rate
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalRooms - stats.availableRooms} of {stats.totalRooms}{" "}
                rooms occupied
              </p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Rooms
              </CardTitle>
              <Bed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableRooms}</div>
              <p className="text-xs text-muted-foreground">Ready for booking</p>
            </CardContent>
          </Card>

          <Card className="bg-green-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{typeof stats.revenue === 'number' ? stats.revenue.toLocaleString() : '0'}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-green-100">
            <CardHeader>
              <CardTitle>Today's Check-ins</CardTitle>
              <CardDescription>Guests arriving today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.todayCheckIns}
              </div>
              <p className="text-sm text-gray-600">Expected arrivals</p>
            </CardContent>
          </Card>

          <Card className="bg-indigo-100">
            <CardHeader>
              <CardTitle>Today's Check-outs</CardTitle>
              <CardDescription>Guests departing today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.todayCheckOuts}
              </div>
              <p className="text-sm text-gray-600">Expected departures</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your hotel operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
              <Button
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 border-1 border-black bg-blue-100 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-500 rounded-lg p-4 active:scale-95 cursor-pointer"
                onClick={() => onNavigate("bookings")}
              >
                <Calendar className="w-6 h-6" />
                <span>View Bookings</span>
              </Button>

              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-amber-100 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-500  rounded-lg p-4 active:scale-95 cursor-pointer"
                onClick={() => onNavigate("rooms")}
              >
                <Bed className="w-6 h-6" />
                <span>Manage Rooms</span>
              </Button>

              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-purple-100 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-500  rounded-lg p-4 active:scale-95 cursor-pointer"
                onClick={() => onNavigate("analytics")}
              >
                <TrendingUp className="w-6 h-6" />
                <span>View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
