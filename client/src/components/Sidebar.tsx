import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, MapPin, Users, Activity, FileSpreadsheet, Settings, Smartphone, Zap, Gauge, Bot, BookOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const adminNavItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'AI Attendance Assistant', href: '/ai-assistant', icon: Bot },
  { name: 'Live Map', href: '/map', icon: MapPin },
  { name: 'Students Grid', href: '/students', icon: Users },
  { name: 'Replay & Simulator', href: '/simulator', icon: Zap },
  { name: 'DevOps & System Health', href: '/system-health', icon: Gauge },
  { name: 'Live Activity Stream', href: '/activity', icon: Activity },
  { name: 'Reports & Export', href: '/reports', icon: FileSpreadsheet },
  { name: 'System Settings', href: '/settings', icon: Settings },
];

export const studentNavItems = [
  { name: 'Phone App Check-In / Out', href: '/student-dashboard', icon: Smartphone },
  { name: 'Class Timetable', href: '/student-schedule', icon: BookOpen },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user } = useAuth();
  const isStudent = user?.role === 'Student';
  const navItems = isStudent ? studentNavItems : adminNavItems;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card px-3 py-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold shadow-md ${
            isStudent ? 'bg-emerald-600 text-white' : 'bg-primary text-primary-foreground'
          }`}>
            {isStudent ? <Smartphone className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-tight">SmartCampus</h2>
            <p className="text-[11px] text-muted-foreground font-mono">
              {isStudent ? 'Student Mobile App' : 'College Admin Portal'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 pt-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-3 text-xs font-semibold transition-all',
                isActive
                  ? isStudent
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'bg-primary text-primary-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="border-t pt-3 px-3 text-[11px] space-y-1 text-muted-foreground font-mono">
        <div className="flex items-center justify-between">
          <span>Logged Role:</span>
          <span className={`font-bold ${isStudent ? 'text-emerald-500' : 'text-primary'}`}>
            {isStudent ? 'STUDENT' : 'SUPER ADMIN'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Telemetry Stream:</span>
          <span className="text-emerald-500 font-bold">LIVE</span>
        </div>
      </div>
    </div>
  );
}
