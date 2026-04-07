import { useAuth } from '@/hooks/useAuth';
import { Lightbulb, ShoppingBag, PenLine, FileText, GraduationCap, Mail, Sparkles } from 'lucide-react';

const suggestions = [
  { icon: PenLine, text: 'Bantu saya tulis caption Instagram', color: 'text-pink-400' },
  { icon: ShoppingBag, text: 'Cara memulai usaha kecil-kecilan', color: 'text-emerald-400' },
  { icon: Lightbulb, text: 'Ide konten untuk bisnis saya', color: 'text-amber-400' },
  { icon: FileText, text: 'Ringkaskan teks ini', color: 'text-sky-400' },
  { icon: GraduationCap, text: 'Tips belajar efektif', color: 'text-violet-400' },
  { icon: Mail, text: 'Bantu buat email profesional', color: 'text-orange-400' },
];

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  const { profile } = useAuth();
  const name = profile?.full_name?.split(' ')[0] || 'Teman';

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="animate-fade-in-up text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2">
          Halo, {name}! 👋
        </h2>
        <p className="text-muted-foreground text-center">Ada yang bisa saya bantu hari ini?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full">
        {suggestions.map((s, i) => (
          <button
            key={s.text}
            onClick={() => onSuggestionClick(s.text)}
            className="flex items-start gap-3 px-4 py-4 rounded-2xl glass hover:border-primary/20 transition-all duration-300 text-left text-sm group animate-fade-in-up"
            style={{ animationDelay: `${i * 0.08 + 0.2}s`, animationFillMode: 'both' }}
          >
            <s.icon className={`w-5 h-5 ${s.color} shrink-0 mt-0.5 group-hover:scale-110 transition-transform`} />
            <span className="text-foreground/90 leading-relaxed">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
