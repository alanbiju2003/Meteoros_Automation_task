import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw, Clock, CheckCircle2 } from 'lucide-react';

export default function StudentHistory() {
  const { user } = useAuth();
  const studentId = user?.studentId || '';

  const { data: history = [], refetch, isLoading } = useQuery({
    queryKey: ['attendance-history', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const res = await axios.get(`/api/attendance/history?studentId=${studentId}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!studentId,
  });

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Calendar className="h-7 w-7 text-emerald-500" /> My Attendance History Log
          </h1>
          <p className="text-muted-foreground text-sm">
            14-day date-wise audit log of check-in, check-out, and campus stay duration from PostgreSQL.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh Log
        </Button>
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold">Date-Wise Attendance Audit Log</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-xs">
          {history.length > 0 ? (
            history.map((rec: any) => (
              <div key={rec.id} className="flex justify-between items-center p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-all">
                <div className="space-y-1">
                  <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    {new Date(rec.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-muted-foreground text-xs font-mono">
                    Check-In: <strong className="text-emerald-600">{rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</strong> | Check-Out:{' '}
                    <strong className="text-rose-600">{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground font-semibold">
                    {rec.duration ? `${Math.round(rec.duration / 60)}h ${rec.duration % 60}m` : 'Active'}
                  </span>
                  <Badge className={rec.status === 'Present' ? 'bg-emerald-600 text-white font-semibold' : 'bg-rose-500 text-white font-semibold'}>
                    {rec.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="font-semibold text-sm">No historical records found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
