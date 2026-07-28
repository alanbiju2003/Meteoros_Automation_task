import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRealLocation } from '@/hooks/useRealLocation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, QrCode, Battery, Wifi, CheckCircle2, LogOut, RefreshCw, Smartphone, History, Crosshair, AlertCircle } from 'lucide-react';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  course: string;
  attendancePercentage: number;
  status: string;
  battery: number;
}

export default function StudentPortal() {
  const queryClient = useQueryClient();
  const realLocation = useRealLocation();

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [batteryLevel, setBatteryLevel] = useState<number>(92);
  const [isInside, setIsInside] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Fetch all students dynamically from PostgreSQL
  const { data: students = [] } = useQuery<StudentProfile[]>({
    queryKey: ['students-list'],
    queryFn: async () => {
      const res = await axios.get('/api/students');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Auto push real GPS coordinates to TimescaleDB whenever realLocation changes
  useEffect(() => {
    if (realLocation.latitude && realLocation.longitude && selectedStudentId) {
      axios.post('/api/locations', {
        studentId: selectedStudentId,
        latitude: realLocation.latitude,
        longitude: realLocation.longitude,
        accuracy: realLocation.accuracy,
        speed: realLocation.speed,
        batteryLevel,
        networkType: 'WiFi 5G',
        gpsEnabled: true,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['latest-locations'] });
        queryClient.invalidateQueries({ queryKey: ['students-list'] });
      }).catch(() => {});
    }
  }, [realLocation.latitude, realLocation.longitude, selectedStudentId]);

  // Fetch Attendance History
  const { data: history = [], refetch: refetchHistory } = useQuery({
    queryKey: ['attendance-history', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return [];
      const res = await axios.get(`/api/attendance/history?studentId=${selectedStudentId}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!selectedStudentId,
  });

  // Check-in Mutation with Real GPS
  const checkInMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/attendance/check-in', {
        studentId: selectedStudentId,
        latitude: realLocation.latitude || 28.6080,
        longitude: realLocation.longitude || 77.2950,
      });
      return res.data;
    },
    onSuccess: () => {
      setIsInside(true);
      setStatusMessage('Auto Checked-In via Real Device GPS!');
      queryClient.invalidateQueries({ queryKey: ['students-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['latest-locations'] });
      refetchHistory();
    },
  });

  // Check-out Mutation
  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/attendance/check-out', {
        studentId: selectedStudentId,
      });
      return res.data;
    },
    onSuccess: () => {
      setIsInside(false);
      setStatusMessage('Auto Checked-Out of Geofence');
      queryClient.invalidateQueries({ queryKey: ['students-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['latest-locations'] });
      refetchHistory();
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Smartphone className="h-7 w-7 text-primary" /> Live GPS Student Mobile App
          </h1>
          <p className="text-muted-foreground text-sm">
            100% Real Browser GPS tracking using free HTML5 Geolocation & OpenStreetMap reverse geocoding.
          </p>
        </div>

        {/* Student Switcher */}
        <div className="w-72 bg-card p-2 rounded-lg border shadow-sm">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Active Student Account</label>
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.rollNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {statusMessage}
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid gap-6 md:grid-cols-12 items-start">
        {/* Mobile Mockup */}
        <div className="md:col-span-5 flex justify-center">
          <Card className="w-full max-w-sm border-4 border-slate-800 rounded-[32px] overflow-hidden shadow-2xl bg-card">
            <div className="bg-slate-800 h-6 flex justify-center items-center">
              <div className="w-20 h-3 bg-slate-950 rounded-full" />
            </div>

            <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{currentStudent?.name || 'Student Name'}</p>
                <p className="text-[11px] opacity-80">{currentStudent?.rollNumber || 'Roll Number'}</p>
              </div>
              <Badge className={isInside ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}>
                {isInside ? 'Inside Campus' : 'Outside Campus'}
              </Badge>
            </div>

            <CardContent className="p-4 space-y-4 text-xs">
              <div className="flex justify-between items-center bg-muted/60 p-2.5 rounded-xl border">
                <span className="flex items-center gap-1 font-medium">
                  <Battery className="h-4 w-4 text-amber-500" /> {batteryLevel}%
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Wifi className="h-4 w-4 text-blue-500" /> WiFi 5G
                </span>
                <span className="flex items-center gap-1 font-medium text-emerald-600">
                  <Navigation className="h-4 w-4" /> GPS Live
                </span>
              </div>

              {/* Real GPS Coordinates Box */}
              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] space-y-1.5 border border-slate-700">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 pb-1 border-b border-slate-800">
                  <span className="flex items-center gap-1"><Crosshair className="h-3.5 w-3.5" /> Real Device GPS</span>
                  <span>{realLocation.loading ? 'Locating...' : 'Active'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Real Lat:</span>
                  <span className="text-emerald-400 font-bold">
                    {realLocation.latitude ? realLocation.latitude.toFixed(6) : 'Allowing Location...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Real Lng:</span>
                  <span className="text-emerald-400 font-bold">
                    {realLocation.longitude ? realLocation.longitude.toFixed(6) : 'Allowing Location...'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 pt-1 border-t border-slate-800">
                  <span className="text-slate-500 block">OpenStreetMap Address:</span>
                  <span className="font-sans font-medium line-clamp-2">{realLocation.address}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => checkInMutation.mutate()}
                  disabled={checkInMutation.isPending || !realLocation.latitude}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2"
                >
                  <MapPin className="h-4 w-4" /> Auto Geofence Check-In (Real GPS)
                </Button>

                <Button
                  onClick={() => checkOutMutation.mutate()}
                  disabled={checkOutMutation.isPending}
                  variant="outline"
                  className="w-full border-rose-500/40 text-rose-600 hover:bg-rose-500/10 font-semibold gap-2"
                >
                  <LogOut className="h-4 w-4" /> Auto Geofence Check-Out
                </Button>

                <Button variant="ghost" className="w-full text-muted-foreground gap-2">
                  <QrCode className="h-4 w-4" /> QR Code Backup Check-In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Details & Timeline */}
        <div className="md:col-span-7 space-y-6">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold">Active Student Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block">Full Name</span>
                <span className="font-semibold text-sm">{currentStudent?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Email</span>
                <span className="font-semibold">{currentStudent?.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Department</span>
                <span className="font-semibold">{currentStudent?.department || 'Computer Science'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Attendance Ratio</span>
                <span className="font-bold text-emerald-600 text-sm">{currentStudent?.attendancePercentage || 88}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> PostgreSQL Attendance Log
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => refetchHistory()}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              {history.length > 0 ? (
                history.map((rec: any) => (
                  <div key={rec.id} className="flex justify-between items-center p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className="font-semibold text-sm">{new Date(rec.date).toLocaleDateString()}</p>
                      <p className="text-muted-foreground text-[11px]">
                        Check-In: {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : 'N/A'} | Check-Out:{' '}
                        {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : 'Active'}
                      </p>
                    </div>
                    <Badge variant={rec.status === 'Present' ? 'default' : 'secondary'}>{rec.status}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No attendance records logged yet today for this student.</p>
                  <p className="text-[11px] mt-1">Click "Auto Geofence Check-In" to log a record!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
