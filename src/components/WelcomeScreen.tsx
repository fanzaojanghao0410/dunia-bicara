import { useAuth } from '@/hooks/useAuth';
import { Lightbulb, ShoppingBag, PenLine, FileText, GraduationCap, Mail } from 'lucide-react';

const suggestions = [
  { icon: PenLine, text: 'Bantu saya tulis caption Instagram' },
  { icon: ShoppingBag, text: 'Cara memulai usaha kecil-kecilan' },
  { icon: Lightbulb, text: 'Ide konten untuk bisnis saya' },
  { icon: FileText, text: 'Ringkaskan teks ini' },
  { icon: GraduationCap, text: 'Tips belajar efektif' },
  { icon: Mail, text: 'Bantu buat email profesional' },
];

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  const { profile } = useAuth();
  const name = profile?.full_name?.split(' ')[0] || 'Teman';

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2 text-center">
        Halo, {name}! 👋
      </h2>
      <p className="text-muted-foreground text-center mb-8">Ada yang bisa saya bantu?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        {suggestions.map(s => (
          <button
            key={s.text}
            onClick={() => onSuggestionClick(s.text)}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border hover:border-primary/30 transition-all text-left text-sm group"
          >
            <s.icon className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-foreground">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
