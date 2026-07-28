import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export default function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If student tries to visit admin routes like /, /students, /map, /settings, redirect to /student-dashboard
    if (user?.role === 'Student') {
      const allowedStudentPaths = [
        '/student-dashboard',
        '/student-schedule',
        '/student-history',
        '/student-alerts',
      ];
      if (!allowedStudentPaths.includes(location.pathname)) {
        navigate('/student-dashboard', { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
