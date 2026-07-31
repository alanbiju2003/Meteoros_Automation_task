import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, User, ShieldCheck, Smartphone, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isStudent = user?.role === 'Student';

  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-card px-4 sm:px-6 justify-between select-none">
      {/* Mobile Hamburger Toggle & Active Portal Badge */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobileMenu}
          className="md:hidden text-slate-700 dark:text-slate-200"
          aria-label="Toggle Mobile Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {isStudent ? (
          <Badge className="bg-emerald-600 text-white font-semibold flex items-center gap-1 text.xs">
            <Smartphone className="h-3.5 w-3.5" /> Student Portal
          </Badge>
        ) : (
          <Badge className="bg-primary text-primary-foreground font-semibold flex items-center gap-1 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" /> Admin Console
          </Badge>
        )}
      </div>

      {/* User Profile Dropdown & Notifications */}
      <div className="flex items-center gap-2 sm:gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold px-2.5 sm:px-3">
              <User className="h-4 w-4 text-primary" />
              <span className="max-w-[120px] sm:max-w-none truncate">{user ? user.name : 'System Admin'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-mono text-xs">{user ? user.email : 'admin@college.edu'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isStudent ? (
              <DropdownMenuItem onClick={() => navigate('/student-dashboard')} className="cursor-pointer gap-2">
                <Smartphone className="h-4 w-4 text-emerald-600" /> My Student Portal
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => navigate('/')} className="cursor-pointer gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Admin Dashboard
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-rose-500 gap-2 font-semibold">
              <LogOut className="h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500" />
        </Button>
      </div>
    </header>
  );
}
