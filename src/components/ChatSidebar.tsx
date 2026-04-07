import { Plus, Trash2, User, LogOut } from 'lucide-react';
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

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-heading text-lg font-bold tracking-tight">
          Hello <span className="text-gold">World</span>
        </h2>
      </div>

      <div className="p-3">
        <Button
          onClick={onNew}
          className="w-full font-heading font-semibold gap-2 bg-gold text-primary-foreground hover:bg-gold/90"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          Percakapan Baru
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-1">
          {conversations.map(c => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className={`group w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm flex items-center justify-between ${
                activeId === c.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true, locale: idLocale })}
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDelete(c.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all ml-2 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => { navigate('/profile'); onClose?.(); }}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <User className="w-4 h-4 text-gold" />
          <span className="truncate">{profile?.full_name || 'Profil'}</span>
        </button>
        <button
          onClick={async () => { await signOut(); navigate('/', { replace: true }); }}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
