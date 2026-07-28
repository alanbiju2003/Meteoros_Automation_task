import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, MapPin, BatteryWarning, CheckCircle2, UserCheck, AlertTriangle, RefreshCw } from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
}

export default function LiveActivity() {
  const { data: events = [], isLoading, refetch } = useQuery<ActivityEvent[]>({
    queryKey: ['live-activity'],
    queryFn: async () => {
      try {
        const res = await axios.get('/api/activity');
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
    },
    refetchInterval: 3000,
  });

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Activity className="h-7 w-7 text-emerald-500" /> Live Activity Stream
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time feed of geofence check-ins, check-outs, and telemetry notifications from PostgreSQL.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh Stream
        </Button>
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold">Real-Time PostgreSQL Audit Log</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {events.length > 0 ? (
            events.map((evt) => {
              const isCheckIn = evt.type === 'CHECK_IN';
              const Icon = isCheckIn ? UserCheck : evt.type === 'CHECK_OUT' ? MapPin : AlertTriangle;
              const iconBg = isCheckIn ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500';

              return (
                <div key={evt.id} className="flex items-start gap-4 p-3.5 rounded-xl border bg-card hover:bg-muted/30 transition-all">
                  <div className={`p-2.5 rounded-lg ${iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{evt.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{evt.description}</p>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {evt.time}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="font-semibold text-sm">No activity events logged yet today.</p>
              <p className="text-xs mt-1">Check in a student via the Student App Simulator to trigger a live event!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
