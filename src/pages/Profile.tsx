import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

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
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('user_id', user.id);
    setSaving(false);
    if (error) {
      toast.error('Gagal menyimpan profil.');
      return;
    }
    await refreshProfile();
    toast.success('Profil berhasil diperbarui!');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader>
          <button onClick={() => navigate('/chat')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Chat
          </button>
          <CardTitle className="font-heading text-2xl">Profil Saya</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Lengkap</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ''} disabled className="opacity-60" />
          </div>
          <Button onClick={handleSave} className="w-full font-heading font-semibold bg-gold text-primary-foreground hover:bg-gold/90" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
          <Button variant="outline" onClick={handleLogout} className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
