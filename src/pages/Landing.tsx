import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Globe, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/chat', { replace: true });
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4">
          Hello <span className="text-gold">World</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl mb-10 font-body">
          Sapa Dunia, Mulai dari Sini.
        </p>
        <div className="flex gap-4 justify-center mb-20">
          <Button
            size="lg"
            className="font-heading font-semibold text-base px-8"
            onClick={() => navigate('/register')}
          >
            Mulai Gratis
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="font-heading font-semibold text-base px-8 border-primary/30 text-foreground hover:bg-primary/10"
            onClick={() => navigate('/login')}
          >
            Masuk
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold">Gratis Selamanya</h3>
            <p className="text-muted-foreground text-sm">Tanpa biaya, tanpa batas. AI untuk semua orang.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold">Berbahasa Indonesia</h3>
            <p className="text-muted-foreground text-sm">Memahami dan menjawab dalam Bahasa Indonesia.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold">Untuk Semua Kalangan</h3>
            <p className="text-muted-foreground text-sm">Pelajar, UMKM, ibu rumah tangga, profesional.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
