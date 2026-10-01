"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppContext } from "../../context/AppContext"
import { Button } from "../components/ui/button"
import { Settings, LogOut, ArrowLeft, Plus, Bed, Building2, ChevronDown } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"
import AddHotelForm from "./AddHotelForm"
import CreateRoom from "./CreateRoom"

export default function Header({ hotelOwner, currentPage, onNavigate }) {
  const { user, setUser, setProfileOpen, logout, isLoading, setIsLoading, selectedHotel, setSelectedHotel } = useAppContext()
  const navigate = useNavigate()

  const [isAddHotelOpen, setIsAddHotelOpen] = useState(false)
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)
  const [availableHotels, setAvailableHotels] = useState([])
  const [hotelDropdownLoading, setHotelDropdownLoading] = useState(false)

  // Fetch hotels for dropdown
  useEffect(() => {
    const fetchHotels = async () => {
      if (user?.email) {
        setHotelDropdownLoading(true)
        try {
          const hotelMap = await getHotelsByEmail(user.email)
          console.log("[Header] Hotel Map fetched:", hotelMap)
          const hotelNames = Object.keys(hotelMap)
          const hotelsArr = hotelNames.map((name) => ({ name, id: hotelMap[name] }))
          setAvailableHotels(hotelsArr)
          // If no hotel selected, select the first one by default
          if (!selectedHotel && hotelsArr.length > 0) {
            setSelectedHotel({ id: hotelsArr[0].id, name: hotelsArr[0].name })
            console.log("[Header] Default hotel selected:", hotelsArr[0])
          }
        } catch (error) {
          console.error("[Header] Error loading hotels:", error)
        } finally {
          setHotelDropdownLoading(false)
        }
      }
    }
    fetchHotels()
    // eslint-disable-next-line
  }, [user?.email])

  // getHotelsByEmail copied from CreateRoom.jsx
  const getHotelsByEmail = async (email) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      }
      if (user?.token) {
        headers["Authorization"] = `Bearer ${user.token}`
      }
      const response = await fetch(
        `https://voyagerserver.onrender.com/api/owner/hotel/by-email/${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers,
        }
      )
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const hotels = await response.json()
      const hotelMap = {}
      hotels.forEach((hotel) => {
        hotelMap[hotel.name] = hotel._id
      })
      return hotelMap
    } catch (error) {
      console.error("[Header] Failed to fetch hotels:", error)
      return {}
    }
  }

  // StyledSelect (copied from CreateRoom.jsx)
  const StyledSelect = ({ value, onValueChange, children, className, placeholder, error }) => {
    console.log("[Header] Rendering StyledSelect with value:", value)
    return (
      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => onValueChange(e.target.value)}
          className={`appearance-none w-full px-4 py-2 pr-10 text-gray-900 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out ${error ? "border-red-400 focus:ring-red-500 focus:border-red-500" : "border-gray-200 hover:border-gray-300"} ${className}`}
        >
          <option value="" disabled className="text-gray-500">
            {placeholder}
          </option>
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    )
  }

  // Handle hotel selection
  const handleHotelChange = (selectedId) => {
    const selected = availableHotels.find((h) => h.id === selectedId)
    setSelectedHotel(selected ? { id: selected.id, name: selected.name } : null)
    console.log("[Header] Hotel selected from dropdown:", selected)
  }

  const handleLogout = async () => {
    if (logout) {
      logout()
      return
    }
    try {
      setIsLoading(true)
      await axios.get("https://voyagerserver.onrender.com/api/users/logout", {
        withCredentials: true,
      })
      localStorage.clear()
      setUser(null)
      setProfileOpen(false)
      toast.success("Logged out successfully")
      setTimeout(() => navigate("/login"), 1000)
    } catch (error) {
      console.error(error)
      toast.error("Logout failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {currentPage !== "dashboard" && (
                <Button variant="ghost" size="sm" onClick={() => onNavigate("dashboard")} className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              )}
              {/* Hotel Dropdown */}
              <div className="mr-6 min-w-[220px]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <span className="text-base font-medium text-gray-800">Hotel:</span>
                </div>
                <StyledSelect
                  value={selectedHotel?.id || ''}
                  onValueChange={handleHotelChange}
                  placeholder={hotelDropdownLoading ? "Loading hotels..." : "Choose a hotel"}
                  error={false}
                >
                  {availableHotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      🏨 {hotel.name}
                    </option>
                  ))}
                </StyledSelect>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{user?.name}</h1>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsAddHotelOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Hotel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddRoomOpen(true)}
                className="bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <Bed className="w-4 h-4 mr-2" />
                Add Rooms
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      {isAddHotelOpen && <AddHotelForm onClose={() => setIsAddHotelOpen(false)} />}
      {isAddRoomOpen && <CreateRoom onClose={() => setIsAddRoomOpen(false)} />}
    </>
  )
}
