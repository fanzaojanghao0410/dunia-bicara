import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, User, Mail, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setFullName(profile.full_name);
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('user_id', user.id);
    setSaving(false);
    if (error) { toast.error('Gagal menyimpan profil.'); return; }
    await refreshProfile();
    toast.success('Profil berhasil diperbarui!');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <button onClick={() => navigate('/chat')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Chat
        </button>

        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold">Profil Saya</h1>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground" /> Nama Lengkap
            </Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-11 rounded-xl bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
            </Label>
            <Input value={user?.email ?? ''} disabled className="h-11 rounded-xl bg-secondary border-border opacity-60" />
          </div>
          <Button onClick={handleSave} className="w-full h-11 rounded-xl font-heading font-semibold glow-primary" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
          <Button variant="outline" onClick={handleLogout} className="w-full h-11 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
