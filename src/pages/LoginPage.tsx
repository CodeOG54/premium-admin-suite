import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = login(username, password);
    
    if (success) {
      toast.success('Welcome back!', {
        description: 'Successfully logged in to ModernTech HR'
      });
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials', {
        description: 'Please check your username and password'
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-sidebar-primary-foreground relative overflow-hidden"
        style={{ background: 'var(--gradient-hero)' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">ModernTech</h1>
              <p className="text-sm opacity-70">HR Solutions</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Streamline Your<br />
            <span className="text-primary">HR Operations</span>
          </h2>
          <p className="text-lg opacity-80 max-w-md">
            Manage employees, track attendance, process payroll, and more with our comprehensive HR management system.
          </p>
          <div className="flex items-center gap-4 text-sm opacity-60">
            <span>✓ Employee Management</span>
            <span>✓ Payroll Processing</span>
            <span>✓ Leave Tracking</span>
          </div>
        </div>
        
        <div className="relative z-10 text-sm opacity-50">
          © 2025 ModernTech Solutions. All rights reserved.
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">ModernTech</h1>
              <p className="text-sm text-muted-foreground">HR Solutions</p>
            </div>
          </div>
          
          <div className="text-center lg:text-left">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-muted-foreground">
              Sign in to access your HR dashboard
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>
          
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium text-foreground mb-2">Demo Credentials</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Username: <code className="rounded bg-muted px-1 py-0.5 font-mono text-primary">admin</code></p>
              <p>Password: <code className="rounded bg-muted px-1 py-0.5 font-mono text-primary">admin123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
