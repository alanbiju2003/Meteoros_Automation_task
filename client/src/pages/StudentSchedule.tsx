import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, MapPin, UserCheck, Calendar } from 'lucide-react';

export default function StudentSchedule() {
  const { data: schedule = [], isLoading } = useQuery({
    queryKey: ['class-schedule'],
    queryFn: async () => {
      const res = await axios.get('/api/schedule');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" /> Class Timetable & Lecture Schedule
        </h1>
        <p className="text-muted-foreground text-sm">
          Dynamic course sessions, room assignments, and lecture times from PostgreSQL.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {schedule.map((cls: any) => (
          <Card key={cls.code} className="border border-border/60 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
              <span className="font-extrabold text-primary text-base">{cls.code}</span>
              <Badge className={cls.status === 'Completed' ? 'bg-slate-700 text-white' : cls.status === 'Ongoing' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}>
                {cls.status}
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">{cls.title}</h3>
              
              <div className="flex items-center gap-2 text-muted-foreground font-mono">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>{cls.time}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>{cls.room}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
                <UserCheck className="h-4 w-4 text-blue-500" />
                <span>Instructor: <strong>{cls.instructor}</strong></span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
