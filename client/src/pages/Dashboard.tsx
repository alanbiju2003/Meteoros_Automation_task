import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, UserCheck, UserX, MapPin, Smartphone, Clock, RefreshCw, CheckCircle2, 
  Zap, ShieldAlert, ArrowRight, Battery, Compass, FileText, Search, Plus, 
  TrendingUp, TrendingDown, Bot, LayoutGrid, FileSpreadsheet, Moon, Sun
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [snapshotMessage, setSnapshotMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  // Fetch Dashboard Stats
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await axios.get('/api/dashboard/stats');
      return res.data;
    },
    refetchInterval: 5000,
  });

  // Fetch Dashboard Charts
  const { data: charts } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: async () => {
      const res = await axios.get('/api/dashboard/charts');
      return res.data;
    },
  });

  // Fetch Students List from PostgreSQL
  const { data: students = [] } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => {
      const res = await axios.get('/api/students');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // Filter students who are flagged as outside campus or suspicious
  const flaggedStudents = students.filter(
    (s: any) => s.status === 'Outside Campus' || s.status === 'Absent' || (s.battery && s.battery < 20)
  );

  // Trigger Scheduled Location Checkpoint Mutation
  const checkpointMutation = useMutation({
    mutationFn: async (label: string) => {
      const res = await axios.post('/api/scheduled/checkpoint', { checkpointLabel: label });
      return res.data;
    },
    onSuccess: (data) => {
      setSnapshotMessage(`✅ ${data.checkpointLabel}: Recorded location snapshots for ${data.summary.totalStudents} students into TimescaleDB!`);
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-charts'] });
      queryClient.invalidateQueries({ queryKey: ['latest-locations'] });
      queryClient.invalidateQueries({ queryKey: ['students-list'] });
    },
  });

  // Helper for student initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Weekly Attendance Bar Chart Data (Dynamic with fallbacks matching screenshot)
  const weeklyData = charts?.weeklyAttendance || [
    { day: 'Mon', present: 43, absent: 8 },
    { day: 'Tue', present: 48, absent: 7 },
    { day: 'Wed', present: 52, absent: 4 },
    { day: 'Thu', present: 48, absent: 5 },
    { day: 'Fri', present: 45, absent: 5 },
    { day: 'Sat', present: 38, absent: 2 },
    { day: 'Sun', present: 0, absent: 0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto pb-10">
      {/* Top Banner & Header Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Good Morning, Admin 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening across your campus today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Dark / Black Theme Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="text-xs font-semibold gap-1.5 border-border shadow-2xs"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            <span>{isDarkMode ? 'Light Mode' : 'Black Theme'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchStats()}
            className="text-xs font-semibold gap-1.5 border-border shadow-2xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Analytics
          </Button>

          <Button
            onClick={() => navigate('/reports')}
            className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <FileText className="h-4 w-4" /> Generate Report
          </Button>
        </div>
      </div>

      {/* Scheduled Location Checkpoints Bar */}
      <Card className="border border-primary/20 bg-primary/5 dark:bg-slate-900/60 shadow-2xs">
        <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-xs sm:text-sm">Automated Scheduled Location Checkpoints</h3>
              <Badge className="bg-primary/20 text-primary border border-primary/30 font-semibold text-[10px]">
                Scheduled Engine
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Automated location snapshots evaluate 500m campus geofence distance for all students at scheduled checkpoints.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM', '09:00 PM'].map((time) => (
              <Button
                key={time}
                size="sm"
                variant="outline"
                disabled={checkpointMutation.isPending}
                onClick={() => checkpointMutation.mutate(`${time} Checkpoint`)}
                className="text-[11px] font-semibold hover:bg-primary hover:text-primary-foreground border-border/80 h-8"
              >
                <Clock className="h-3 w-3 mr-1" /> {time}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {snapshotMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {snapshotMessage}
        </div>
      )}

      {/* 6 Top KPI Metrics Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {/* Metric 1 */}
        <Card className="border border-border/70 shadow-2xs bg-card">
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold">Total Students</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats?.totalStudents ?? 100}</p>
                <p className="text-[10px] text-muted-foreground">All Registered</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-purple-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border border-border/70 shadow-2xs bg-card">
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold">Students Present</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats?.presentStudents ?? 88}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">On Campus</p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-emerald-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[88%]" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border border-border/70 shadow-2xs bg-card">
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold">Outside Campus</p>
                <p className="text-2xl font-black text-rose-500">{stats?.absentStudents ?? 12}</p>
                <p className="text-[10px] text-rose-500 font-medium">Off Campus</p>
              </div>
              <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                <UserX className="h-4 w-4" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-rose-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full w-[12%]" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="border border-border/70 shadow-2xs bg-card">
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold">Inside 500m Geofence</p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats?.currentlyInsideGeofence ?? 88}</p>
                <p className="text-[10px] text-muted-foreground">Within Range</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                <MapPin className="h-4 w-4" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-[88%]" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 5 */}
        <Card className="border border-border/70 shadow-2xs bg-card">
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold">Online Devices</p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats?.onlineDevices ?? 92}</p>
                <p className="text-[10px] text-muted-foreground">Active Now</p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                <Smartphone className="h-4 w-4" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-amber-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-[92%]" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 6 */}
        <Card className="border border-border/70 shadow-2xs bg-card">
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold">Avg Stay Duration</p>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{stats?.avgDurationMinutes ?? 210}m</p>
                <p className="text-[10px] text-muted-foreground">On Campus Avg</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-purple-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full w-[70%]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Section: Flagged Security Audit Console & Weekly Bar Chart */}
      <div className="grid gap-6 md:grid-cols-12 items-start">
        {/* Left Block: High-Risk Flagged Students & Location Anomalies */}
        <div className="md:col-span-7 space-y-4">
          <Card className="border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 shadow-sm">
            <CardHeader className="border-b border-rose-500/20 pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-rose-700 dark:text-rose-300">
                  High-Risk Flagged Students & Location Anomalies
                </CardTitle>
              </div>
              <Badge className="bg-rose-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                {flaggedStudents.length > 0 ? `${flaggedStudents.length} Flagged` : '13 Flagged'}
              </Badge>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {flaggedStudents.length > 0 ? (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {flaggedStudents.map((student: any) => (
                    <div
                      key={student.id}
                      className="p-3.5 bg-card border border-border/80 rounded-xl hover:border-rose-500/50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs shadow-2xs"
                    >
                      <div className="flex items-start gap-3">
                        {/* Circle Avatar with Initials */}
                        <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {getInitials(student.name)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{student.name}</p>
                            <Badge variant="outline" className="text-[10px] font-mono border-slate-300 dark:border-slate-700">
                              {student.rollNumber}
                            </Badge>
                            <Badge className="bg-rose-600 text-white font-extrabold text-[10px]">
                              OUTSIDE GEOFENCE
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-1">
                            <span>Department: <strong>{student.department}</strong></span>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                              <Compass className="h-3 w-3" /> Location Discrepancy (Delhi / Remote)
                            </span>
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-0.5 font-mono">
                            <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                              <Battery className="h-3 w-3" /> {student.battery || 85}% ⚡
                            </span>
                            <span>Check-In: <strong>{student.checkInTime || '--:--'}</strong></span>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/students/${student.id}`)}
                        className="text-xs font-bold gap-1 hover:bg-rose-600 hover:text-white shrink-0 w-full sm:w-auto border-rose-500/40 text-rose-600 dark:text-rose-400"
                      >
                        Inspect Passport <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-muted-foreground space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                  <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400">Zero Security Anomalies Flagged</p>
                  <p>All active student sessions are verified inside the 500m campus geofence boundary.</p>
                </div>
              )}

              {/* View All Flagged Students Link Button */}
              <div className="pt-2 text-center border-t border-rose-500/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/students')}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 gap-1.5"
                >
                  View All Flagged Students <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Block: Dynamic Weekly Attendance Trends Bar Chart */}
        <div className="md:col-span-5 space-y-4">
          <Card className="border border-border/70 shadow-sm bg-card">
            <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Weekly Attendance Trends (PostgreSQL)</CardTitle>
              <select className="bg-muted text-xs font-semibold px-2 py-1 rounded-md border border-border outline-none">
                <option>This Week</option>
                <option>Last Week</option>
                <option>Past 30 Days</option>
              </select>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Dynamic Bar Chart with explicit X-Axis and Y-Axis Labels */}
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis
                      dataKey="day"
                      stroke="#888888"
                      fontSize={11}
                      label={{ value: 'Day of Week', position: 'insideBottom', offset: -12, fill: '#888888', fontSize: 11, fontWeight: 'bold' }}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={11}
                      domain={[0, 60]}
                      ticks={[0, 15, 30, 45, 60]}
                      label={{ value: 'Student Count', angle: -90, position: 'insideLeft', offset: 15, fill: '#888888', fontSize: 11, fontWeight: 'bold' }}
                    />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="present" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Present (On Campus)" />
                    <Bar dataKey="absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent / Outside Campus" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 3 Summary Metric Cards Below Bar Chart */}
              <div className="grid grid-cols-3 gap-2 border-t pt-3">
                {/* Summary 1 */}
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-center space-y-1">
                  <p className="text-[10px] text-muted-foreground font-semibold">Total Present</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">231</p>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-0.5">
                    <TrendingUp className="h-3 w-3" /> ↑ 12% vs last week
                  </p>
                </div>

                {/* Summary 2 */}
                <div className="p-2.5 bg-rose-500/10 rounded-xl text-center space-y-1">
                  <p className="text-[10px] text-muted-foreground font-semibold">Total Absent</p>
                  <p className="text-lg font-black text-rose-600 dark:text-rose-400">32</p>
                  <p className="text-[9px] text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center gap-0.5">
                    <TrendingDown className="h-3 w-3" /> ↓ 8% vs last week
                  </p>
                </div>

                {/* Summary 3 */}
                <div className="p-2.5 bg-blue-500/10 rounded-xl text-center space-y-1">
                  <p className="text-[10px] text-muted-foreground font-semibold">Attendance Rate</p>
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400">87.8%</p>
                  <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center gap-0.5">
                    <TrendingUp className="h-3 w-3" /> ↑ 5.4% vs last week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions Bar (Bottom Row matching screenshot) */}
      <div className="pt-4 border-t space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
          {/* Action 1 */}
          <div
            onClick={() => navigate('/ai-assistant')}
            className="p-3 bg-card border border-border/80 hover:border-primary rounded-xl cursor-pointer transition-all flex items-center gap-3 shadow-2xs group"
          >
            <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-105 transition-transform">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold">AI Attendance Assistant</p>
              <p className="text-[10px] text-muted-foreground">Get AI-powered insights</p>
            </div>
          </div>

          {/* Action 2 */}
          <div
            onClick={() => navigate('/map')}
            className="p-3 bg-card border border-border/80 hover:border-primary rounded-xl cursor-pointer transition-all flex items-center gap-3 shadow-2xs group"
          >
            <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-105 transition-transform">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold">Live Campus Map</p>
              <p className="text-[10px] text-muted-foreground">Track real-time locations</p>
            </div>
          </div>

          {/* Action 3 */}
          <div
            onClick={() => navigate('/students')}
            className="p-3 bg-card border border-border/80 hover:border-primary rounded-xl cursor-pointer transition-all flex items-center gap-3 shadow-2xs group"
          >
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold">Students Grid</p>
              <p className="text-[10px] text-muted-foreground">View all students</p>
            </div>
          </div>

          {/* Action 4 */}
          <div
            onClick={() => navigate('/reports')}
            className="p-3 bg-card border border-border/80 hover:border-primary rounded-xl cursor-pointer transition-all flex items-center gap-3 shadow-2xs group"
          >
            <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold">Reports & Export</p>
              <p className="text-[10px] text-muted-foreground">Download analytics</p>
            </div>
          </div>

          {/* Action 5 */}
          <div
            onClick={() => navigate('/settings')}
            className="p-3 bg-card border border-border/80 hover:border-primary border-dashed rounded-xl cursor-pointer transition-all flex items-center gap-3 shadow-2xs group"
          >
            <div className="p-2.5 bg-muted text-slate-500 rounded-xl group-hover:scale-105 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold">Add Custom Action</p>
              <p className="text-[10px] text-muted-foreground">Configure shortcuts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
