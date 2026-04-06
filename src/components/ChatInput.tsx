import { useState, useRef, useEffect } from 'react';
import { ArrowUp, ImagePlus, X, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, imageUrls?: string[]) => void;
  disabled: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && images.length === 0) || disabled) return;
    const urls = images.map(i => i.preview);
    onSend(trimmed || '(gambar)', urls.length > 0 ? urls : undefined);
    setText('');
    setImages([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    const newImages = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 4));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const hasContent = text.trim().length > 0 || images.length > 0;

  return (
    <div className="p-3 md:p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-secondary rounded-2xl border border-border focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          {images.length > 0 && (
            <div className="flex gap-2 p-3 pb-0 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-border">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-1 p-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 shrink-0 mb-0.5"
              title="Lampirkan gambar"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              rows={1}
              className="flex-1 resize-none bg-transparent py-2.5 px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none scrollbar-thin font-body max-h-[200px]"
              disabled={disabled}
            />
            <button
              onClick={handleSend}
              disabled={disabled || !hasContent}
              className={`shrink-0 mb-0.5 p-2 rounded-xl transition-all ${
                hasContent && !disabled
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
              title="Kirim pesan"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-2">
          Hello World bisa membuat kesalahan. Periksa informasi penting.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
