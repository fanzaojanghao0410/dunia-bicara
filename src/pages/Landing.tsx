import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Globe, MessageCircle, Users, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/chat', { replace: true });
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <h1 className="font-heading text-xl font-bold">
          Hello <span className="gradient-text">World</span>
        </h1>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="font-heading">
            Masuk
          </Button>
          <Button size="sm" onClick={() => navigate('/register')} className="font-heading glow-primary">
            Mulai Gratis
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-muted-foreground mb-8">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            AI Asisten untuk semua orang Indonesia
          </div>

          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight tracking-tight">
            Hello <span className="gradient-text">World</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-10 font-body max-w-xl mx-auto leading-relaxed">
            Sapa Dunia, Mulai dari Sini. Asisten AI gratis yang memahami kebutuhan masyarakat Indonesia.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              className="font-heading font-semibold text-base px-8 gap-2 glow-primary"
              onClick={() => navigate('/register')}
            >
              Mulai Gratis
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="font-heading font-semibold text-base px-8 border-border hover:bg-secondary"
              onClick={() => navigate('/login')}
            >
              Masuk
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-24 w-full px-4">
          {[
            { icon: Zap, title: 'Gratis Selamanya', desc: 'Tanpa biaya, tanpa batas. AI berkualitas untuk semua orang.' },
            { icon: MessageCircle, title: 'Berbahasa Indonesia', desc: 'Memahami konteks dan budaya Indonesia dengan natural.' },
            { icon: Shield, title: 'Untuk Semua Kalangan', desc: 'Pelajar, UMKM, ibu rumah tangga, hingga profesional.' },
          ].map((f, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 text-center hover:border-primary/20 transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1 + 0.3}s`, animationFillMode: 'both' }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border">
        Dibuat dengan ❤️ oleh Ahmad Fauzan — SMK Metland Cibitung
      </footer>
    </div>
  );
};

export default Landing;
