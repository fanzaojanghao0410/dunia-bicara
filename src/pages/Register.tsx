import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center pb-2">
          <CardTitle className="font-heading text-2xl">
            Hello <span className="text-gold">World</span>
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2">Buat akun baru</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input id="fullName" placeholder="Nama lengkap Anda" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input id="password" type="password" placeholder="Minimal 6 karakter" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
              <Input id="confirmPassword" type="password" placeholder="Ulangi kata sandi" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full font-heading font-semibold bg-gold text-primary-foreground hover:bg-gold/90" disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-gold hover:underline font-semibold">Masuk di sini</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
