import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.includes('Invalid login')) {
        toast.error('Email atau kata sandi salah.');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Email belum dikonfirmasi. Silakan cek inbox Anda.');
      } else {
        toast.error('Gagal masuk. Silakan coba lagi.');
      }
      return;
    }
    navigate('/chat', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center pb-2">
          <CardTitle className="font-heading text-2xl">
            Hello <span className="text-gold">World</span>
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2">Masuk ke akun Anda</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full font-heading font-semibold bg-gold text-primary-foreground hover:bg-gold/90" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Belum punya akun?{' '}
            <Link to="/register" className="text-gold hover:underline font-semibold">Daftar di sini</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
