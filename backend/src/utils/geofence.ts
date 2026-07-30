// Calculate exact distance in meters between two lat/lng points using Haversine formula
export function getHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

// Dynamically resolve city/region from latitude & longitude coordinates
export function getCityFromCoordinates(lat: number, lng: number): string {
  if (lat >= 28.3 && lat <= 28.9 && lng >= 76.8 && lng <= 77.6) {
    return 'Delhi / NCR (Noida / Gurgaon)';
  }
  if (lat >= 18.8 && lat <= 19.4 && lng >= 72.7 && lng <= 73.3) {
    return 'Mumbai / Maharashtra';
  }
  if (lat >= 12.8 && lat <= 13.1 && lng >= 77.4 && lng <= 77.7) {
    return 'Bengaluru Campus / Karnataka';
  }
  if (lat >= 17.1 && lat <= 17.6 && lng >= 78.2 && lng <= 78.6) {
    return 'Hyderabad / Telangana';
  }
  if (lat >= 12.8 && lat <= 13.3 && lng >= 80.0 && lng <= 80.4) {
    return 'Chennai / Tamil Nadu';
  }
  if (lat >= 22.3 && lat <= 22.8 && lng >= 88.2 && lng <= 88.6) {
    return 'Kolkata / West Bengal';
  }
  if (lat >= 18.3 && lat <= 18.7 && lng >= 73.7 && lng <= 74.1) {
    return 'Pune / Maharashtra';
  }

  return `Remote Location (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
}

// Real-Time OpenStreetMap Nominatim Reverse Geocoding API Lookup
export async function fetchRealReverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SmartCampus-Attendance-Engine/1.0',
      },
    });

    if (response.ok) {
      const data: any = await response.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    }
  } catch (error) {
    // Silent fallback to city region lookup
  }

  return getCityFromCoordinates(lat, lng);
}
