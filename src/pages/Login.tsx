import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="w-full max-w-sm animate-fade-in-up">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold mb-1">
            Hello <span className="gradient-text">World</span>
          </h1>
          <p className="text-muted-foreground text-sm">Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input id="email" type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-11 rounded-xl bg-secondary border-border focus:border-primary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Kata Sandi</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="h-11 rounded-xl bg-secondary border-border focus:border-primary pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl font-heading font-semibold glow-primary" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Belum punya akun?{' '}
          <Link to="/register" className="text-primary hover:underline font-semibold">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
