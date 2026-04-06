import { useAuth } from '@/hooks/useAuth';
import { Lightbulb, ShoppingBag, PenLine, FileText, GraduationCap, Mail } from 'lucide-react';

const suggestions = [
  { icon: PenLine, text: 'Bantu saya tulis caption Instagram', desc: 'Konten sosial media' },
  { icon: ShoppingBag, text: 'Cara memulai usaha kecil-kecilan', desc: 'Bisnis & kewirausahaan' },
  { icon: Lightbulb, text: 'Ide konten untuk bisnis saya', desc: 'Kreativitas & ide' },
  { icon: FileText, text: 'Ringkaskan teks ini', desc: 'Produktivitas' },
  { icon: GraduationCap, text: 'Tips belajar efektif', desc: 'Pendidikan' },
  { icon: Mail, text: 'Bantu buat email profesional', desc: 'Komunikasi' },
];

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  const { profile } = useAuth();
  const name = profile?.full_name?.split(' ')[0] || 'Teman';

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <span className="text-primary font-heading text-xl font-bold">HW</span>
        </div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-1">
          Halo, {name}!
        </h2>
        <p className="text-muted-foreground text-sm">Ada yang bisa saya bantu hari ini?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl w-full">
        {suggestions.map(s => (
          <button
            key={s.text}
            onClick={() => onSuggestionClick(s.text)}
            className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-border transition-all text-left group"
          >
            <s.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
            <div className="min-w-0">
              <p className="text-sm text-foreground leading-snug">{s.text}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
