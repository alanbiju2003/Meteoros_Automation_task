import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Battery, Wifi, MapPin, Compass } from 'lucide-react';

// Custom Colored Leaflet Marker Icons with Coordinate Badges
const createCustomMarker = (color: string, name: string, lat: number, lng: number) => {
  return L.divIcon({
    className: 'custom-leaflet-marker-wrapper',
    html: `
      <div style="display: flex; flex-direction: column; items-center; justify-content: center; transform: translate(-50%, -100%);">
        <div style="background-color: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 1px solid white;">
          ${name} (${lat.toFixed(4)}, ${lng.toFixed(4)})
        </div>
        <div style="width: 14px; height: 14px; background-color: ${color}; border-radius: 50%; border: 2.5px solid white; margin: 2px auto 0 auto; box-shadow: 0 0 8px ${color};"></div>
      </div>
    `,
    iconSize: [120, 40],
    iconAnchor: [60, 40]
  });
};

const greenMarker = (name: string, lat: number, lng: number) => createCustomMarker('#10b981', name, lat, lng);
const redMarker = (name: string, lat: number, lng: number) => createCustomMarker('#ef4444', name, lat, lng);

interface StudentLocation {
  studentId: string;
  name: string;
  rollNumber: string;
  department: string;
  latitude: number;
  longitude: number;
  batteryLevel: number;
  lastPingTime: string;
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function LiveMap() {
  const [selectedStudent, setSelectedStudent] = useState<StudentLocation | null>(null);
  
  // Exact Campus Center: 12.9337° N, 77.6051° E
  const campusCenter: [number, number] = [12.9337, 77.6051];

  // Dynamic fetch of live locations from TimescaleDB every 2 seconds
  const { data: locations = [] } = useQuery<StudentLocation[]>({
    queryKey: ['latest-locations'],
    queryFn: async () => {
      try {
        const res = await axios.get('/api/locations/latest');
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
    },
    refetchInterval: 2000,
  });

  // Campus Geofence Boundary Polygon Coordinates
  const geofencePolygon: [number, number][] = [
    [12.9290, 77.6000],
    [12.9380, 77.6000],
    [12.9380, 77.6100],
    [12.9290, 77.6100],
  ];

  const mapCenter: [number, number] = locations.length > 0 
    ? [locations[0].latitude, locations[0].longitude] 
    : campusCenter;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-100px)] animate-in fade-in">
      {/* Map Display Container */}
      <div className="flex-1 rounded-xl overflow-hidden border border-border/60 shadow-sm relative flex flex-col">
        {/* Top Info Bar */}
        <div className="bg-slate-900 text-slate-100 px-4 py-2 flex justify-between items-center text-xs font-mono border-b border-slate-800 z-10">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-emerald-400" />
            <span>Campus Center Lat: <strong>12.9337° N</strong> | Lng: <strong>77.6051° E</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">🟢 Inside Geofence ({locations.filter(l => l.latitude >= 12.9290 && l.latitude <= 12.9380 && l.longitude >= 77.6000 && l.longitude <= 77.6100).length})</span>
            <span className="flex items-center gap-1 text-rose-400">🔴 Outside ({locations.filter(l => !(l.latitude >= 12.9290 && l.latitude <= 12.9380 && l.longitude >= 77.6000 && l.longitude <= 77.6100)).length})</span>
          </div>
        </div>

        {/* Leaflet Map Engine */}
        <div className="flex-1 w-full h-full relative">
          <MapContainer center={mapCenter} zoom={15} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapRecenter center={mapCenter} />

            {/* Geofence Boundary Polygon */}
            <Polygon 
              positions={geofencePolygon} 
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.12, weight: 3, dashArray: '6, 6' }} 
            />

            {/* Student Markers with Latitude & Longitude Labels */}
            {locations.map((loc) => {
              const isInside = loc.latitude >= 12.9290 && loc.latitude <= 12.9380 && loc.longitude >= 77.6000 && loc.longitude <= 77.6100;
              const icon = isInside 
                ? greenMarker(loc.name, loc.latitude, loc.longitude) 
                : redMarker(loc.name, loc.latitude, loc.longitude);

              return (
                <Marker 
                  key={loc.studentId} 
                  position={[loc.latitude, loc.longitude]} 
                  icon={icon}
                  eventHandlers={{
                    click: () => setSelectedStudent(loc)
                  }}
                >
                  <Popup>
                    <div className="text-xs font-semibold p-1 space-y-1">
                      <p className="font-bold text-sm">{loc.name}</p>
                      <p className="text-muted-foreground">{loc.rollNumber} ({loc.department})</p>
                      <p className={isInside ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                        {isInside ? '🟢 Inside Geofence' : '🔴 Outside Campus'}
                      </p>
                      <div className="bg-slate-900 text-slate-100 p-1.5 rounded font-mono text-[10px] mt-1">
                        <p>Latitude: <strong className="text-emerald-400">{loc.latitude.toFixed(6)}° N</strong></p>
                        <p>Longitude: <strong className="text-emerald-400">{loc.longitude.toFixed(6)}° E</strong></p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Side Panel for Selected Student */}
      {selectedStudent ? (
        <Card className="w-full lg:w-80 border border-border/60 shadow-md flex flex-col">
          <CardHeader className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{selectedStudent.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{selectedStudent.rollNumber}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Department</span>
              <span className="font-medium">{selectedStudent.department}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Battery className="h-3.5 w-3.5" /> Battery Level
              </span>
              <span className="font-semibold">{selectedStudent.batteryLevel}%</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Wifi className="h-3.5 w-3.5" /> Network Type
              </span>
              <span className="font-semibold">WiFi 5G</span>
            </div>

            {/* Latitude & Longitude Box */}
            <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] space-y-1 border border-slate-700">
              <p className="text-[10px] text-slate-400 font-sans border-b border-slate-800 pb-1 font-semibold flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-400" /> TimescaleDB Recorded Coordinates
              </p>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Latitude:</span>
                <span className="text-emerald-400 font-bold">{selectedStudent.latitude.toFixed(6)}° N</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Longitude:</span>
                <span className="text-emerald-400 font-bold">{selectedStudent.longitude.toFixed(6)}° E</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="font-semibold text-muted-foreground mb-2">Telemetry Timestamp</p>
              <div className="space-y-2 border-l-2 border-primary/20 pl-3">
                <div className="relative">
                  <div className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="font-semibold">Last GPS Ping Received</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(selectedStudent.lastPingTime).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>

            <Button className="w-full mt-4 font-semibold" size="sm" onClick={() => window.location.href = `/students/${selectedStudent.studentId}`}>
              View Full Profile & History
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full lg:w-80 border border-border/60 shadow-sm flex flex-col justify-center items-center text-center p-6">
          <MapPin className="h-10 w-10 text-muted-foreground/40 mb-2" />
          <p className="text-sm font-semibold">Campus GPS Map</p>
          <p className="text-xs text-muted-foreground">Every marker displays exact real-time Latitude (12.9337° N) & Longitude (77.6051° E) coordinates.</p>
        </Card>
      )}
    </div>
  );
}
