"use client"

import { useState, useEffect } from "react"
import SouvenirListing from "./sovComp/SouvenirListing"
import SouvenirDetail from "./sovComp/SouvenirDetail"
import BookingForm from "./sovComp/BookingForm"
import { LoadingSpinner } from "./sovComp/ui/loading-spinner"
import { Alert } from "./sovComp/ui/alert"

export default function App() {
  const [currentView, setCurrentView] = useState("listing")
  const [selectedSouvenir, setSelectedSouvenir] = useState(null)
  const [bookingData, setBookingData] = useState(null)
  const [souvenirs, setSouvenirs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSouvenirs = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("Fetching souvenirs from API...")
        
        const response = await fetch("https://voyagerserver.onrender.com/api/souvenirs/getallsouviners")
        console.log("API response:", response)
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, ${errorText}`)
        }
        
        const result = await response.json()
        console.log("API data received:", result)
        
        // Handle different API response structures
        let data = []
        if (Array.isArray(result)) {
          data = result
        } else if (result && Array.isArray(result.data)) {
          data = result.data
        } else {
          throw new Error("Invalid data format received from API")
        }
        
        if (data.length === 0) {
          console.warn("API returned empty data array")
        }
        
        // Transform data with proper fallbacks
        const transformedData = data.map((item, index) => ({
          id: item._id || item.id || `temp-${index}`,
          name: item.name || item.title || "Unnamed Souvenir",
          price: Number(item.price) || 0,
          image: item.image || item.imageUrl ,
          thumbnail: item.thumbnail,
          region: item.region || 'Unknown',
          category: item.category || 'General',
          description: item.description || 'No description available',
          rating: Number(item.rating) || 0,
          reviews: Number(item.reviews) || 0,
          inStock: item.inStock !== undefined ? Boolean(item.inStock) : true,
          features: Array.isArray(item.features) ? item.features : [],
          images: Array.isArray(item.images) ? item.images : [item.image ]
        }))
        
        console.log("Transformed data:", transformedData)
        setSouvenirs(transformedData)
      } catch (err) {
        console.error("Fetch error:", err)
        setError(err.message || "Failed to load souvenirs. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSouvenirs()
  }, [])

  const handleSouvenirClick = (souvenir) => {
    setSelectedSouvenir(souvenir)
    setCurrentView("detail")
  }

  const handleBookNow = (souvenir) => {
    setBookingData(souvenir)
    setCurrentView("booking")
  }

  const handleBackToListing = () => {
    setCurrentView("listing")
    setSelectedSouvenir(null)
    setBookingData(null)
  }

  const handleBookingComplete = () => {
    alert("Booking confirmed! You will receive a confirmation email shortly.")
    handleBackToListing()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3">Loading souvenirs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 mt-20">
        <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Error loading souvenirs</h2>
          <Alert type="error" title="API Error" className="mb-4">
            {error}
          </Alert>
          <div className="flex justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (souvenirs.length === 0 && !isLoading && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-2">No Souvenirs Found</h2>
          <Alert type="info" className="mb-4">
            The souvenir list is currently empty. Please check back later.
          </Alert>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === "listing" && (
        <SouvenirListing souvenirs={souvenirs} onSouvenirClick={handleSouvenirClick} />
      )}

      {currentView === "detail" && selectedSouvenir && (
        <SouvenirDetail
          souvenir={selectedSouvenir}
          onBack={handleBackToListing}
          onBookNow={handleBookNow}
        />
      )}

      {currentView === "booking" && bookingData && (
        <BookingForm
          souvenir={bookingData}
          onBack={() => setCurrentView("detail")}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  )
}