import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, ShieldCheck, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';

export default function StudentAlerts() {
  const { user } = useAuth();
  const studentId = user?.studentId || '';
  const [reason, setReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const requestMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/attendance/approval-request', {
        studentId,
        reason,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMsg(`✅ Request submitted to Faculty: "${data.message}"`);
      setReason('');
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Bell className="h-7 w-7 text-amber-500" /> Notifications & Exemption Requests
        </h1>
        <p className="text-muted-foreground text-sm">
          Submit manual attendance exemption requests or view automated geofence alert notifications.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {successMsg}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Request Form */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Request Manual Exemption
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Exemption / GPS Glitch Reason</Label>
              <Input
                placeholder="e.g. Low battery / GPS Hardware failure during 11 AM class"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => requestMutation.mutate()}
              disabled={requestMutation.isPending || !reason}
              className="w-full font-semibold"
            >
              {requestMutation.isPending ? 'Submitting...' : 'Submit to Faculty Queue'}
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Notifications */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-500" /> Geofence & System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="p-3 rounded-xl border bg-emerald-500/5 border-emerald-500/20 space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span className="text-emerald-700">Auto Check-In Confirmed</span>
                <Badge className="bg-emerald-600 text-white">Geofence</Badge>
              </div>
              <p className="text-muted-foreground">Logged inside 500m campus geofence boundary (12.9337° N, 77.6051° E).</p>
            </div>

            <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/20 space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span className="text-blue-700">GPS Telemetry Ping Recorded</span>
                <Badge className="bg-blue-600 text-white">TimescaleDB</Badge>
              </div>
              <p className="text-muted-foreground">TimescaleDB hypertable snapshot recorded with 98% trust score.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
