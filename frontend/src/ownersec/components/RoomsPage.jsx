"use client"

import { useState, useEffect } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Bed, Wifi, Car, Coffee, Tv, Bath } from "lucide-react"
import { useAppContext } from "../../context/AppContext"

export default function RoomsPage() {
  const { user, selectedHotel } = useAppContext()
  const [hotelData, setHotelData] = useState(null)
  const [rooms, setRooms] = useState([])
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedHotel?.id) return;
      try {
        const hotelRes = await fetch("https://voyagerserver.onrender.com/api/owner/hotel/all", { credentials: "include" })
        const hotels = await hotelRes.json()
        const hotel = hotels.find(h => h._id === selectedHotel.id)
        setHotelData(hotel)

        const roomsRes = await fetch(`https://voyagerserver.onrender.com/api/owner/hotel/rooms/${selectedHotel.id}`, { credentials: "include" })
        const roomsData = await roomsRes.json()
        setRooms(roomsData)
      } catch (err) {
        console.error("[RoomsPage] Error fetching:", err)
      }
    }
    fetchData()
  }, [selectedHotel?.id])

  const getStatus = (room) => {
    if (!room.bookingDetails || room.bookingDetails.length === 0) {
      return "available"
    }
    const latestBooking = [...room.bookingDetails].sort((a, b) => new Date(b.check_out) - new Date(a.check_out))[0]
    if (latestBooking && new Date(latestBooking.check_out) > new Date()) {
      return "occupied"
    }
    return "available"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "occupied":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case "wifi": return <Wifi className="w-4 h-4" />
      case "tv": return <Tv className="w-4 h-4" />
      case "parking": return <Car className="w-4 h-4" />
      case "minibar": return <Coffee className="w-4 h-4" />
      case "bathroom": return <Bath className="w-4 h-4" />
      default: return <Bed className="w-4 h-4" />
    }
  }

  let filteredRooms = [];
  let roomStats = {
    total: 0,
    available: 0,
    occupied: 0,
    cleaning: 0,
    maintenance: 0,
  };

  if (Array.isArray(rooms)) {
    filteredRooms = rooms.filter((room) => {
      const status = getStatus(room);
      const matchesStatus = filterStatus === "all" || status === filterStatus;
      const matchesType = filterType === "all" || room.room_type === filterType;
      return matchesStatus && matchesType;
    });

    roomStats = {
      total: rooms.length,
      available: rooms.filter((r) => getStatus(r) === "available").length,
      occupied: rooms.filter((r) => getStatus(r) === "occupied").length,
      cleaning: 0,
      maintenance: 0,
    };
  } else {
    // Handle the case where no rooms are found
    console.log("No rooms found for this hotel");
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1508614999368-9260051292e5?w=600&auto=format&fit=crop&q=60')" }}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Room Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(roomStats).map(([key, value]) => (
            <Card key={key} className="bg-white">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${
                  key === "available" ? "text-green-600"
                    : key === "occupied" ? "text-red-600"
                      : key === "cleaning" ? "text-yellow-600"
                        : key === "maintenance" ? "text-orange-600"
                          : "text-gray-800"
                }`}>{value}</div>
                <div className="text-sm text-gray-600 capitalize">{key}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white">
          <CardHeader>
            <CardTitle>Filter Rooms</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <div className="flex gap-2">
                {["all", "available", "occupied"].map(status => (
                  <Button key={status} variant={filterStatus === status ? 'default' : 'outline'}
                    onClick={() => setFilterStatus(status)} size="sm">{status.charAt(0).toUpperCase() + status.slice(1)}</Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Room Type</label>
              <div className="flex gap-2 flex-wrap">
                <Button variant={filterType === 'all' ? 'default' : 'outline'} onClick={() => setFilterType('all')} size="sm">All Types</Button>
                {["standard", "deluxe", "suite"].map(type => (
                  <Button key={type} variant={filterType === type ? 'default' : 'outline'}
                    onClick={() => setFilterType(type)} size="sm">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rooms List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const status = getStatus(room)
            const latestBooking = [...room.bookingDetails].sort((a, b) => new Date(b.check_out) - new Date(a.check_out))[0]

            return (
              <Card key={room._id} className="hover:shadow-lg transition-shadow bg-white">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Room</CardTitle>
                    <Badge className={getStatusColor(status)}>{status.toUpperCase()}</Badge>
                  </div>
                  <CardDescription>{room.room_type}</CardDescription>
                </CardHeader>
                <CardContent>
                  {status === 'occupied' && latestBooking && (
                    <div className="mb-4 p-3 bg-red-50 rounded-md">
                      <p className="text-sm font-semibold text-red-800">Currently Occupied</p>
                      <p className="text-sm text-gray-700">Guest: {latestBooking.userName}</p>
                      <p className="text-sm text-gray-700">Check-out: {new Date(latestBooking.check_out).toLocaleDateString()}</p>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-800 mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {["wifi", "tv", "bathroom", "minibar"].map((amenity, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          {getAmenityIcon(amenity)} <span>{amenity.charAt(0).toUpperCase() + amenity.slice(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    {status === 'available' && <Button size="sm">Create Booking</Button>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredRooms.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
              <p className="text-gray-600">Try adjusting your filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
