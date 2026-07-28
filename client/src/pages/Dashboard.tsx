import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, MapPin, Smartphone, Clock, RefreshCw, CheckCircle2, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [snapshotMessage, setSnapshotMessage] = useState('');

  // Fetch Dashboard Stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await axios.get('/api/dashboard/stats');
      return res.data;
    },
    refetchInterval: 5000,
  });

  // Fetch Dashboard Charts
  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: async () => {
      const res = await axios.get('/api/dashboard/charts');
      return res.data;
    },
  });

  // Trigger Scheduled Location Checkpoint Mutation
  const checkpointMutation = useMutation({
    mutationFn: async (label: string) => {
      const res = await axios.post('/api/scheduled/checkpoint', { checkpointLabel: label });
      return res.data;
    },
    onSuccess: (data) => {
      setSnapshotMessage(`✅ ${data.checkpointLabel}: Recorded location snapshots for ${data.summary.totalStudents} students (${data.summary.insideCampusCount} Inside, ${data.summary.outsideCampusCount} Outside) into TimescaleDB!`);
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-charts'] });
      queryClient.invalidateQueries({ queryKey: ['latest-locations'] });
      queryClient.invalidateQueries({ queryKey: ['students-list'] });
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">College Smart Attendance & Live Tracking</h1>
          <p className="text-muted-foreground text-sm">
            Campus Geofence: <strong>12.9337° N, 77.6051° E</strong> | PostgreSQL + TimescaleDB Real-Time Telemetry Engine
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchStats()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh Analytics
        </Button>
      </div>

      {/* Scheduled Location Checkpoint Banner (10 AM, 12 PM, 3 PM, 5 PM, 9 PM) */}
      <Card className="border border-primary/30 bg-primary/5 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-sm">Automated Scheduled Location Checkpoints</h3>
              <Badge className="bg-primary text-primary-foreground font-semibold">Scheduled Engine</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Automated location snapshots evaluate 500m campus geofence distance for all 50 students at scheduled checkpoints.
            </p>
          </div>

          {/* Checkpoint Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM', '09:00 PM'].map((time) => (
              <Button
                key={time}
                size="sm"
                variant="outline"
                disabled={checkpointMutation.isPending}
                onClick={() => checkpointMutation.mutate(`${time} Checkpoint`)}
                className="text-xs font-semibold hover:bg-primary hover:text-primary-foreground gap-1 border-primary/40"
              >
                <Clock className="h-3.5 w-3.5" /> {time}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {snapshotMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {snapshotMessage}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Students</p>
              <p className="text-2xl font-extrabold">{stats?.totalStudents ?? 50}</p>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Students Present</p>
              <p className="text-2xl font-extrabold text-emerald-600">{stats?.presentStudents ?? 38}</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Outside Campus</p>
              <p className="text-2xl font-extrabold text-rose-500">{stats?.absentStudents ?? 12}</p>
            </div>
            <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500">
              <UserX className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Inside 500m Geofence</p>
              <p className="text-2xl font-extrabold text-blue-600">{stats?.currentlyInsideGeofence ?? 38}</p>
            </div>
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Online Devices</p>
              <p className="text-2xl font-extrabold">{stats?.onlineDevices ?? 45}</p>
            </div>
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600">
              <Smartphone className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Avg Stay Duration</p>
              <p className="text-2xl font-extrabold">{stats?.avgDurationMinutes ?? 210}m</p>
            </div>
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base font-semibold">Hourly Student Movement (TimescaleDB Telemetry)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 h-[280px]">
            {charts?.hourlyMovement ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.hourlyMovement}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="hour" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="pings" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Location Pings" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Loading Telemetry Chart...</div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base font-semibold">Weekly Attendance Trends (PostgreSQL)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 h-[280px]">
            {charts?.weeklyAttendance ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.weeklyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
                  <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Outside Campus" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Loading Attendance Chart...</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
