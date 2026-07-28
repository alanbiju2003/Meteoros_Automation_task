import { useState, useEffect } from 'react';

interface RealLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  speed: number | null;
  address: string;
  batteryLevel: number;
  isCharging: boolean;
  loading: boolean;
  error: string | null;
}

export function useRealLocation() {
  const [location, setLocation] = useState<RealLocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    speed: null,
    address: 'Acquiring GPS...',
    batteryLevel: 88,
    isCharging: false,
    loading: true,
    error: null,
  });

  // Read HTML5 Real Device Battery Status API (navigator.getBattery)
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          const level = Math.round(battery.level * 100);
          setLocation((prev) => ({
            ...prev,
            batteryLevel: level,
            isCharging: battery.charging,
          }));
        };

        updateBattery();

        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);

        return () => {
          battery.removeEventListener('levelchange', updateBattery);
          battery.removeEventListener('chargingchange', updateBattery);
        };
      }).catch(() => {});
    }
  }, []);

  // Watch HTML5 Real Device Geolocation API
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser',
        address: 'Geolocation Unsupported',
      }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = position.coords.accuracy;
        const spd = position.coords.speed;

        let formattedAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        try {
          // Free OpenStreetMap Nominatim Reverse Geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          if (data && data.display_name) {
            formattedAddress = data.display_name;
          }
        } catch (e) {
          // Offline fallback
        }

        setLocation((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          speed: spd,
          address: formattedAddress,
          loading: false,
          error: null,
        }));
      },
      (error) => {
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
          address: 'Location Access Denied / Unavailable',
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return location;
}
