import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Kata sandi tidak cocok.');
      return;
    }
    if (password.length < 6) {
      toast.error('Kata sandi minimal 6 karakter.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Email sudah terdaftar. Silakan masuk.');
      } else {
        toast.error('Gagal mendaftar. Silakan coba lagi.');
      }
      return;
    }
    toast.success('Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi.');
    navigate('/login');
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
          <p className="text-muted-foreground text-sm">Buat akun baru</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">Nama Lengkap</Label>
            <Input id="fullName" placeholder="Nama lengkap Anda" value={fullName} onChange={e => setFullName(e.target.value)} required className="h-11 rounded-xl bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input id="email" type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-11 rounded-xl bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Kata Sandi</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Minimal 6 karakter" value={password} onChange={e => setPassword(e.target.value)} required className="h-11 rounded-xl bg-secondary border-border pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Konfirmasi Kata Sandi</Label>
            <Input id="confirmPassword" type="password" placeholder="Ulangi kata sandi" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="h-11 rounded-xl bg-secondary border-border" />
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl font-heading font-semibold glow-primary" disabled={loading}>
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
