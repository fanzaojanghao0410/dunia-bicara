import { useState } from 'react';
import { Plus, Trash2, User, LogOut, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}

const ChatSidebar = ({ conversations, activeId, onSelect, onNew, onDelete, onClose }: ChatSidebarProps) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = search
    ? conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold">
            Hello <span className="gradient-text">World</span>
          </h2>
          <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-sidebar-accent text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <Button onClick={onNew} className="w-full font-heading font-semibold gap-2 rounded-xl h-10 glow-primary" size="sm">
          <Plus className="w-4 h-4" />
          Percakapan Baru
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari percakapan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-sidebar-accent text-sm text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-body"
          />
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 pb-2">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">
              {search ? 'Tidak ditemukan' : 'Belum ada percakapan'}
            </p>
          )}
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className={`group w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 text-sm flex items-center justify-between ${
                activeId === c.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[13px]">{c.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true, locale: idLocale })}
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDelete(c.id); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all ml-2 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => { navigate('/profile'); onClose?.(); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="truncate text-[13px] font-medium">{profile?.full_name || 'Profil'}</span>
        </button>
        <button
          onClick={async () => { await signOut(); navigate('/', { replace: true }); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0">
            <LogOut className="w-3.5 h-3.5" />
          </div>
          <span className="text-[13px]">Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
