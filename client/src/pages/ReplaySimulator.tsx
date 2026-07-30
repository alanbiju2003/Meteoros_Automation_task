import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RefreshCw, ShieldAlert, Zap, CloudRain, Crosshair, MapPin, Gauge, User, Search, Check } from 'lucide-react';

const createCustomMarker = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker-wrapper',
    html: `
      <div style="display: flex; flex-direction: column; items-center; justify-content: center; transform: translate(-50%, -100%);">
        <div style="background-color: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 1px solid white;">
          ${label}
        </div>
        <div style="width: 14px; height: 14px; background-color: ${color}; border-radius: 50%; border: 2.5px solid white; margin: 2px auto 0 auto; box-shadow: 0 0 8px ${color};"></div>
      </div>
    `,
    iconSize: [120, 40],
    iconAnchor: [60, 40]
  });
};

export default function ReplaySimulator() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
  const [replayTime, setReplayTime] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Simulator Inputs
  const [testLat, setTestLat] = useState<number>(12.9337);
  const [testLng, setTestLng] = useState<number>(77.6051);
  const [testAccuracy, setTestAccuracy] = useState<number>(8);
  const [testSpeed, setTestSpeed] = useState<number>(0);
  const [isRainMode, setIsRainMode] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const campusCenter: [number, number] = [12.9337, 77.6051];
  const geofenceRadius = isRainMode ? 560 : 500;

  // Query 100 Students from PostgreSQL
  const { data: students = [] } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => {
      const res = await axios.get('/api/students');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // Default to Student 1 if loaded
  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const selectedStudent = students.find((s: any) => s.id === selectedStudentId) || students[0];

  // Filter students by search term (name, roll number, department)
  const filteredStudents = students.filter((s: any) =>
    s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  // Evaluate Telemetry & Fraud Detection Mutation
  const evaluateMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/telemetry/evaluate', {
        studentId: selectedStudentId || 'sim_student_1',
        latitude: testLat,
        longitude: testLng,
        accuracy: testAccuracy,
        batteryLevel: 85,
        speed: testSpeed,
        networkType: 'WiFi 5G',
        prevLat: 12.9337,
        prevLng: 77.6051,
        timeDiffSeconds: 60,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setEvaluationResult(data);
    },
  });

  // Calculate dynamic polygon based on adaptive rain geofence
  const delta = geofenceRadius / 111000;
  const dynamicPolygon: [number, number][] = [
    [12.9337 - delta, 77.6051 - delta],
    [12.9337 + delta, 77.6051 - delta],
    [12.9337 + delta, 77.6051 + delta],
    [12.9337 - delta, 77.6051 + delta],
  ];

  // Replay Time Label
  const formatReplayHour = (val: number) => {
    const totalMinutes = 9 * 60 + Math.round((val / 100) * 8 * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const displayHr = hrs > 12 ? hrs - 12 : hrs;
    return `${displayHr.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Zap className="h-7 w-7 text-primary" /> Dynamic Student Time-Travel Replay & Simulator
          </h1>
          <p className="text-muted-foreground text-sm">
            Select any student from PostgreSQL to inspect real telemetry history, GPS Trust Scores, and Adaptive Weather Geofence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isRainMode ? 'default' : 'outline'}
            onClick={() => setIsRainMode(!isRainMode)}
            className={isRainMode ? 'bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2' : 'gap-2 font-semibold'}
          >
            <CloudRain className="h-4 w-4" />
            {isRainMode ? 'Heavy Rain Geofence (560m Radius)' : 'Standard Geofence (500m Radius)'}
          </Button>
        </div>
      </div>

      {/* Student Search & Selection Card */}
      <Card className="border border-border/60 shadow-sm p-4 bg-card">
        <div className="grid gap-4 md:grid-cols-12 items-center">
          {/* Left Summary Header */}
          <div className="md:col-span-5 flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Student for Simulation</Label>
              <p className="text-[11px] text-muted-foreground">
                Loaded: <strong className="text-primary">{selectedStudent?.name || 'Student 1'} ({selectedStudent?.rollNumber})</strong> | {selectedStudent?.department}
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="md:col-span-3 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student name or roll..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {/* Student Dropdown Selector */}
          <div className="md:col-span-4">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNumber}) - {s.department} [{s.status}]
                  </option>
                ))
              ) : (
                <option value="">No students matching "{studentSearchTerm}"</option>
              )}
            </select>
          </div>
        </div>
      </Card>

      {/* Main Grid Layout */}
      <div className="grid gap-6 md:grid-cols-12 items-start">
        {/* Map & Replay Slider */}
        <div className="md:col-span-7 space-y-4">
          <Card className="border border-border/60 shadow-sm overflow-hidden flex flex-col h-[480px] relative">
            {/* Top Replay Bar */}
            <div className="bg-slate-900 text-slate-100 px-4 py-3 flex justify-between items-center text-xs font-mono border-b border-slate-800 z-10">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-7 w-7 p-0 text-emerald-400 hover:text-white"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span className="text-sm font-bold text-emerald-400">{formatReplayHour(replayTime)}</span>
              </div>
              <Badge className={isRainMode ? 'bg-blue-600 text-white' : 'bg-primary text-primary-foreground'}>
                Geofence Radius: {geofenceRadius}m
              </Badge>
            </div>

            {/* Map Engine */}
            <div className="flex-1 w-full h-full relative">
              <MapContainer center={campusCenter} zoom={15} className="h-full w-full">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Adaptive Polygon */}
                <Polygon
                  positions={dynamicPolygon}
                  pathOptions={{ color: isRainMode ? '#2563eb' : '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 3 }}
                />

                {/* Simulated Student Marker */}
                <Marker
                  position={[testLat, testLng]}
                  icon={createCustomMarker(evaluationResult?.isSpoofed ? '#ef4444' : '#10b981', selectedStudent?.name || 'Selected Student')}
                >
                  <Popup>
                    <div className="text-xs space-y-1">
                      <p className="font-bold">{selectedStudent?.name} ({selectedStudent?.rollNumber})</p>
                      <p className="text-[10px] text-muted-foreground">{selectedStudent?.department}</p>
                      <p>Lat: {testLat.toFixed(6)}, Lng: {testLng.toFixed(6)}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Replay Slider Control */}
            <div className="p-4 bg-card border-t flex items-center gap-4">
              <span className="text-xs font-semibold text-muted-foreground shrink-0">09:00 AM</span>
              <input
                type="range"
                min="0"
                max="100"
                value={replayTime}
                onChange={(e) => setReplayTime(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-xs font-semibold text-muted-foreground shrink-0">05:00 PM</span>
            </div>
          </Card>
        </div>

        {/* Telemetry Simulator Form & Audit Analysis */}
        <div className="md:col-span-5 space-y-4">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" /> Telemetry Parameter Injector
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Test Latitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={testLat}
                    onChange={(e) => setTestLat(parseFloat(e.target.value))}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Test Longitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={testLng}
                    onChange={(e) => setTestLng(parseFloat(e.target.value))}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Accuracy Radius (m)</Label>
                  <Input
                    type="number"
                    value={testAccuracy}
                    onChange={(e) => setTestAccuracy(parseFloat(e.target.value))}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Velocity / Speed (km/h)</Label>
                  <Input
                    type="number"
                    value={testSpeed}
                    onChange={(e) => setTestSpeed(parseFloat(e.target.value))}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => evaluateMutation.mutate()}
                  disabled={evaluateMutation.isPending}
                  className="w-full font-semibold gap-2 bg-primary"
                >
                  <RefreshCw className="h-4 w-4" /> Evaluate Telemetry & Run Fraud Audit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Results Card */}
          {evaluationResult && (
            <Card className={`border shadow-sm ${evaluationResult.isSpoofed ? 'border-rose-500/30 bg-rose-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
              <CardHeader className="border-b pb-3">
                <CardTitle className={`text-base font-semibold flex items-center gap-2 ${evaluationResult.isSpoofed ? 'text-rose-700' : 'text-emerald-700'}`}>
                  <ShieldAlert className="h-5 w-5" /> Evaluation Output Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-xs font-medium">
                <div className="flex justify-between border-b pb-1.5">
                  <span>GPS Trust Score:</span>
                  <span className="font-bold font-mono">{evaluationResult.trustScore}%</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span>Distance from Campus Center:</span>
                  <span className="font-mono">{evaluationResult.distanceMeters}m</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span>Spoofing / Teleport Anomaly:</span>
                  <Badge className={evaluationResult.isSpoofed ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}>
                    {evaluationResult.isSpoofed ? 'HIGH RISK FLAG' : 'PASSED (NORMAL)'}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1">{evaluationResult.reason}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
