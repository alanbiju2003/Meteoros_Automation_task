import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'Student') {
        setErrorMsg('Access Denied: Student account credentials cannot access Admin Console.');
        return;
      }
      navigate('/');
    } catch (err: any) {
      console.error('Admin Login error:', err);
      setErrorMsg(err.response?.data?.message || 'Invalid administrator email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md border border-slate-800 bg-slate-900/95 text-slate-100 backdrop-blur-xl shadow-2xl z-10">
        <CardHeader className="space-y-3 text-center pb-4">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">System Administration</CardTitle>
            <CardDescription className="text-slate-400 text-xs mt-1">
              Authorized College Admin Security Console Access
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
            </div>
          )}

          {/* Admin Login Form */}
          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div className="space-y-1.5 text-xs">
              <Label htmlFor="email" className="text-slate-300 font-semibold">
                Administrator Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 py-5 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <Label htmlFor="password" className="text-slate-300 font-semibold">Security Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-slate-100 py-5 text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-semibold py-6 text-xs mt-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              {isLoading ? 'Authenticating Console...' : 'Authenticate Admin Session'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-slate-800/80 py-3 text-[11px] text-slate-500 font-mono">
          <span>SmartCampus Administrator Access Control</span>
        </CardFooter>
      </Card>
    </div>
  );
}
