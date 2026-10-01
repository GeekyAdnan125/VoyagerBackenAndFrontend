import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import marker images for Leaflet icon fix
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const TrackLocationPage = () => {
  const { userId } = useParams();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const intervalRef = useRef(null);
  const leafletRef = useRef(null);

  // Initialize Leaflet map after DOM is ready
  useEffect(() => {
    let mapInstance;
    let L;
    const initMap = async () => {
      try {
        L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');
        // Fix Leaflet's default icon path
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: markerIcon2x,
          iconUrl: markerIcon,
          shadowUrl: markerShadow,
        });
        leafletRef.current = L;
        // Only initialize if the element exists
        const mapDiv = document.getElementById('map');
        if (!mapDiv) return;
        mapInstance = L.map('map').setView([0, 0], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);
        mapRef.current = mapInstance;
        console.log('[TrackLocation] Map initialized');
      } catch (error) {
        console.error('[TrackLocation] Error initializing map:', error);
        setError('Failed to load map');
      }
    };
    // Wait for DOM to be ready
    setTimeout(initMap, 0);
    // Cleanup
    return () => {
      if (mapInstance) mapInstance.remove();
    };
  }, []);

  // Fetch location data
  const fetchLocation = async () => {
    try {
      const response = await fetch(`https://voyagerserver.onrender.com/api/location/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Location tracking not found or has expired');
          setLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        setLocation(data.data);
        setLastUpdated(new Date(data.data.updatedAt));
        setError(null);
        // Update map if available
        if (mapRef.current && data.data.latitude && data.data.longitude && leafletRef.current) {
          updateMapMarker(data.data.latitude, data.data.longitude);
        }
      }
    } catch (error) {
      console.error('[TrackLocation] Error fetching location:', error);
      setError('Failed to fetch location data');
    } finally {
      setLoading(false);
    }
  };

  // Update map marker
  const updateMapMarker = (lat, lng) => {
    try {
      const L = leafletRef.current;
      if (!L || !mapRef.current) return;
      if (markerRef.current) {
        markerRef.current.remove();
      }
      // Create new marker
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
      // Add popup
      markerRef.current.bindPopup(`
        <div class="text-center">
          <strong>Current Location</strong><br>
          📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}<br>
          ⏰ ${new Date().toLocaleTimeString()}
        </div>
      `);
      // Center map on marker
      mapRef.current.setView([lat, lng], 15);
    } catch (error) {
      console.error('[TrackLocation] Error updating map marker:', error);
    }
  };

  // Start polling for location updates
  useEffect(() => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }
    // Initial fetch
    fetchLocation();
    // Set up polling every 5 seconds
    intervalRef.current = setInterval(fetchLocation, 5000);
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    return timestamp.toLocaleString();
  };

  // Get time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading location tracking...</h2>
          <p className="text-gray-500 mt-2">User ID: {userId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🚨</div>
          <h2 className="text-2xl font-bold text-red-700 mb-4">Tracking Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">User ID: {userId}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📍 Live Location Tracking</h1>
              <p className="text-gray-600">User ID: {userId}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Live</span>
              </div>
              {lastUpdated && (
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {getTimeAgo(lastUpdated)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div id="map" className="w-full h-96"></div>
        </div>

        {/* Location Info */}
        {location && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-700 mb-2">📍 Coordinates</h3>
              <p className="text-sm text-gray-600">
                Lat: {location.latitude?.toFixed(6)}<br />
                Lng: {location.longitude?.toFixed(6)}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-700 mb-2">⏰ Last Updated</h3>
              <p className="text-sm text-gray-600">
                {formatTimestamp(lastUpdated)}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-700 mb-2">🔗 Quick Links</h3>
              <div className="space-y-2">
                <a
                  href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:text-blue-800 transition"
                >
                  📍 Open in Google Maps
                </a>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:text-blue-800 transition"
                >
                  🗺️ Open in OpenStreetMap
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Status Info */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-yellow-600 mr-3 mt-1">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-800">Important Information</h3>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• This tracking link is active for 1 hour from when tracking started</li>
                <li>• Location updates every 5 seconds</li>
                <li>• Tracking stops automatically when the user closes their browser tab</li>
                <li>• This page refreshes location data every 5 seconds</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackLocationPage; 