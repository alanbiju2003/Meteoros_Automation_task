import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Smartphone, LogOut, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isStudent = user?.role === 'Student';
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SA';

  return (
    <header className="flex h-16 lg:h-[70px] items-center gap-4 border-b bg-card px-4 sm:px-6 justify-between select-none shadow-sm transition-colors">
      {/* Left Section: Mobile Toggle & Live Status */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobileMenu}
          className="md:hidden text-muted-foreground hover:text-foreground"
          aria-label="Toggle Mobile Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Live Date Time Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-muted/50 border border-border/80 px-3 py-1.5 rounded-full text-xs font-medium font-mono text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Live</span>
          <span className="text-slate-400">|</span>
          <span>{currentTime || 'May 13, 2026 10:15 AM'}</span>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="hidden md:flex items-center relative w-64 lg:w-80">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search anything... ⌘K"
          className="pl-9 pr-10 text-xs bg-muted/40 border-border/70 rounded-xl h-9 focus-visible:ring-1 focus-visible:ring-primary"
        />
        <kbd className="absolute right-2.5 top-2.5 text-[10px] font-mono text-muted-foreground bg-card border px-1.5 py-0.5 rounded shadow-2xs">
          ⌘K
        </kbd>
      </div>

      {/* Right Section: Notifications & Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Icon */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-card" />
        </Button>

        {/* User Profile Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 border-2 border-primary/30 text-primary font-extrabold text-xs shadow-sm hover:ring-2 hover:ring-primary/20 transition-all outline-none">
              {userInitials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-semibold">{user ? user.name : 'Super Admin'}</DropdownMenuLabel>
            <p className="text-[11px] text-muted-foreground px-2 pb-1 font-mono">{user ? user.email : 'admin@college.edu'}</p>
            <DropdownMenuSeparator />
            {isStudent ? (
              <DropdownMenuItem onClick={() => navigate('/student-dashboard')} className="cursor-pointer gap-2 text-xs">
                <Smartphone className="h-4 w-4 text-emerald-600" /> My Student Portal
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => navigate('/')} className="cursor-pointer gap-2 text-xs">
                <Smartphone className="h-4 w-4 text-primary" /> Admin Dashboard
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-rose-500 gap-2 font-semibold text-xs">
              <LogOut className="h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
