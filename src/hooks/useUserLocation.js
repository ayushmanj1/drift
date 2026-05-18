import { useState, useEffect } from 'react';

export default function useUserLocation() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Re-fetch on every call/mount
    setLoading(true);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      // Fallback to New Delhi
      setLocation({ lat: 28.6139, lng: 77.2090 });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Location permission denied.');
        // Fallback to New Delhi
        setLocation({ lat: 28.6139, lng: 77.2090 });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Do NOT cache
      }
    );
  }, []);

  return { ...location, loading, error };
}
