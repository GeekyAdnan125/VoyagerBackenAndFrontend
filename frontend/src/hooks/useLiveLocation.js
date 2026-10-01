import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { getUserIdFromToken } from '../utils/jwtUtils';

const useLiveLocation = (userId) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Maximum tracking duration: 1 hour
  const MAX_TRACKING_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  const UPDATE_INTERVAL = 5000; // Send location every 5 seconds

  const sendLocationToBackend = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://voyagerserver.onrender.com/api/location/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[LiveLocation] Location sent successfully:', data);
      
    } catch (error) {
      console.error('[LiveLocation] Error sending location:', error);
      toast.error('Failed to send location update');
    }
  };

  const startTracking = () => {
    if (!userId) {
      setError('User ID is required for location tracking');
      toast.error('User ID is required for location tracking');
      return false;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      toast.error('Geolocation is not supported by your browser');
      return false;
    }

    setError(null);
    setIsTracking(true);
    startTimeRef.current = Date.now();

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        
        // Send location to backend
        sendLocationToBackend(latitude, longitude);
        
        // Check if tracking duration exceeded
        if (Date.now() - startTimeRef.current > MAX_TRACKING_DURATION) {
          stopTracking();
          toast.info('Location tracking stopped after 1 hour');
        }
      },
      (error) => {
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }
        
        setError(errorMessage);
        setIsTracking(false);
        toast.error(errorMessage);
        console.error('[LiveLocation] Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      }
    );

    // Set up periodic location sending (every 5 seconds)
    intervalRef.current = setInterval(() => {
      if (currentLocation) {
        sendLocationToBackend(currentLocation.latitude, currentLocation.longitude);
      }
    }, UPDATE_INTERVAL);

    console.log('[LiveLocation] Started tracking for user:', userId);
    toast.success('Live location tracking started');
    return true;
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTracking(false);
    setCurrentLocation(null);
    startTimeRef.current = null;
    
    console.log('[LiveLocation] Stopped tracking for user:', userId);
    toast.info('Live location tracking stopped');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Stop tracking when tab is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isTracking) {
        console.log('[LiveLocation] Tab closing, stopping tracking');
        // Note: We can't make async calls here, but the cleanup will happen
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isTracking]);

  return {
    isTracking,
    currentLocation,
    error,
    startTracking,
    stopTracking
  };
};

export default useLiveLocation; 