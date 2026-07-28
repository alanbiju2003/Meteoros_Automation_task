import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Save, ShieldCheck, CheckCircle2, MapPin, Database, Radio } from 'lucide-react';

export default function Settings() {
  const queryClient = useQueryClient();

  const [zoneName, setZoneName] = useState('Mayur Vihar Main Campus');
  const [centerLat, setCenterLat] = useState<number>(28.6080);
  const [centerLng, setCenterLng] = useState<number>(77.2950);
  const [geofenceRadius, setGeofenceRadius] = useState<number>(500);
  const [pingInterval, setPingInterval] = useState<number>(3);
  const [retentionDays, setRetentionDays] = useState<number>(90);
  const [saveMessage, setSaveMessage] = useState('');

  const { data: settings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const res = await axios.get('/api/settings');
      if (res.data) {
        setZoneName(res.data.zoneName || 'Mayur Vihar Main Campus');
        setCenterLat(res.data.centerLat || 28.6080);
        setCenterLng(res.data.centerLng || 77.2950);
        setGeofenceRadius(res.data.geofenceRadiusMeters || 500);
        setPingInterval(res.data.gpsPingIntervalSeconds || 3);
        setRetentionDays(res.data.timescaleRetentionDays || 90);
      }
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.put('/api/settings', {
        zoneName,
        centerLat,
        centerLng,
        geofenceRadiusMeters: geofenceRadius,
        gpsPingIntervalSeconds: pingInterval,
        timescaleRetentionDays: retentionDays,
      });
      return res.data;
    },
    onSuccess: () => {
      setSaveMessage('Campus Geofence & System Settings saved successfully to PostgreSQL!');
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      queryClient.invalidateQueries({ queryKey: ['latest-locations'] });
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-7 w-7 text-primary" /> System & Geofence Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Configure campus geofencing rules, TimescaleDB retention policies, and telemetry intervals.
        </p>
      </div>

      {saveMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {saveMessage}
        </div>
      )}

      {/* Geofence Configuration Card */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Campus Boundary & Geofence Coordinates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Primary Campus Zone Name</Label>
            <Input value={zoneName} onChange={(e) => setZoneName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Center Latitude (°N)</Label>
              <Input
                type="number"
                step="0.0001"
                value={centerLat}
                onChange={(e) => setCenterLat(parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Center Longitude (°E)</Label>
              <Input
                type="number"
                step="0.0001"
                value={centerLng}
                onChange={(e) => setCenterLng(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Geofence Proximity Radius (Meters)</Label>
            <Input
              type="number"
              value={geofenceRadius}
              onChange={(e) => setGeofenceRadius(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Telemetry & TimescaleDB Settings Card */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-600" /> TimescaleDB & Telemetry Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Radio className="h-3.5 w-3.5 text-blue-500" /> GPS Telemetry Update Frequency (Seconds)
            </Label>
            <Input
              type="number"
              value={pingInterval}
              onChange={(e) => setPingInterval(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">TimescaleDB Hypertable Data Retention (Days)</Label>
            <Input
              type="number"
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full gap-2 font-semibold py-6 text-base"
          >
            <Save className="h-5 w-5" /> Save System Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
