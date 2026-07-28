import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ShieldCheck, Smartphone, MapPin, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<'admin' | 'student'>('student');
  const [email, setEmail] = useState('student1@gmail.com');
  const [password, setPassword] = useState('student001');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tab: 'admin' | 'student') => {
    setActiveTab(tab);
    setErrorMsg('');
    if (tab === 'admin') {
      setEmail('admin@college.edu');
      setPassword('admin123');
    } else {
      setEmail('student1@gmail.com');
      setPassword('student001');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'Student') {
        navigate('/student-dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemoAccount = async (role: 'admin' | 'student') => {
    setIsLoading(true);
    setErrorMsg('');
    const demoEmail = role === 'admin' ? 'admin@college.edu' : 'student1@gmail.com';
    const demoPass = role === 'admin' ? 'admin123' : 'student001';

    try {
      const user = await login(demoEmail, demoPass);
      if (user.role === 'Student') {
        navigate('/student-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (role === 'admin') navigate('/');
      else navigate('/student-dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4 relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md border border-slate-800 bg-slate-900/90 text-slate-100 backdrop-blur-xl shadow-2xl z-10">
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
            <MapPin className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">SmartCampus Portal</CardTitle>
            <CardDescription className="text-slate-400 text-xs mt-1">
              Enterprise Attendance & Live Telemetry Management System
            </CardDescription>
          </div>

          {/* Role Toggle Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold mt-2">
            <button
              type="button"
              onClick={() => handleTabChange('student')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'student'
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" /> Student Portal
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-primary text-primary-foreground shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Administrator
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div className="space-y-1.5 text-xs">
              <Label htmlFor="email" className="text-slate-300">
                {activeTab === 'student' ? 'Student Email' : 'Administrator Email'}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={activeTab === 'student' ? 'student1@gmail.com' : 'admin@college.edu'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-slate-100"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full font-semibold mt-2 py-5 ${
                activeTab === 'student' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isLoading ? 'Authenticating...' : `Sign In to ${activeTab === 'student' ? 'Student App' : 'Admin Portal'}`}
            </Button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => loginDemoAccount(activeTab)}
              disabled={isLoading}
              className="w-full border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold gap-2 py-4"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>One-Click Demo Sign In ({activeTab === 'student' ? 'Student Portal' : 'College Admin'})</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t border-slate-800/80 py-3 text-[11px] text-slate-500 font-mono">
          <span>Enterprise PERN Stack + TimescaleDB Auth Engine</span>
        </CardFooter>
      </Card>
    </div>
  );
}
