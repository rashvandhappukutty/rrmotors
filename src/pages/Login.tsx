import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginAdmin } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { Lock, User } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('rrmotors');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both username and password',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await loginAdmin(username, password);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `Welcome ${result.data.name}! Redirecting to admin panel...`
        });
        setTimeout(() => navigate('/admin'), 1500);
      } else {
        toast({
          title: 'Login Failed',
          description: result.error || 'Invalid username or password',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4 p-3 bg-gradient-primary rounded-full">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            RR Motors Admin
          </h1>
          <p className="text-muted-foreground">Manage your bike inventory</p>
        </div>

        {/* Login Card */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="rrmotors"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="bg-background border-primary/20 focus:border-primary"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-background border-primary/20 focus:border-primary"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="btn-glow bg-gradient-primary hover:opacity-90 w-full text-lg py-6"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login to Admin Panel'}
              </Button>

              {/* Home Link */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2024 RR Motors Admin Dashboard
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
