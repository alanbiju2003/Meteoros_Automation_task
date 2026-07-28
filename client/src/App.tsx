import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { AuthProvider } from './contexts/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import StudentPortal from './pages/StudentPortal';
import StudentDashboard from './pages/StudentDashboard';
import StudentSchedule from './pages/StudentSchedule';
import StudentHistory from './pages/StudentHistory';
import StudentAlerts from './pages/StudentAlerts';
import LiveActivity from './pages/LiveActivity';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ReplaySimulator from './pages/ReplaySimulator';
import SystemHealth from './pages/SystemHealth';
import AIAssistant from './pages/AIAssistant';
import Login from './pages/Login';

// Configure Axios: If VITE_API_BASE_URL is set, use it; otherwise use relative /api path (proxied by Vite/Nginx)
if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="student-portal" element={<StudentPortal />} />
              <Route path="student-dashboard" element={<StudentDashboard />} />
              <Route path="student-schedule" element={<StudentSchedule />} />
              <Route path="student-history" element={<StudentHistory />} />
              <Route path="student-alerts" element={<StudentAlerts />} />
              <Route path="map" element={<LiveMap />} />
              <Route path="students" element={<Students />} />
              <Route path="students/:id" element={<StudentDetails />} />
              <Route path="simulator" element={<ReplaySimulator />} />
              <Route path="system-health" element={<SystemHealth />} />
              <Route path="ai-assistant" element={<AIAssistant />} />
              <Route path="activity" element={<LiveActivity />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
