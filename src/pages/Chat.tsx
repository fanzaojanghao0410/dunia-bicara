import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { streamChat, Msg } from '@/lib/streamChat';
import ChatSidebar from '@/components/ChatSidebar';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import WelcomeScreen from '@/components/WelcomeScreen';
import { Menu, X } from 'lucide-react';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('conversations')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (data) setConversations(data);
  }, [user]);

  const fetchMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('id, role, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data as ChatMessage[]);
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { if (activeId) fetchMessages(activeId); }, [activeId, fetchMessages]);

  const handleNew = () => {
    setActiveId(null);
    setMessages([]);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('conversations').delete().eq('id', id);
    if (activeId === id) handleNew();
    fetchConversations();
  };

  const sendMessage = async (text: string) => {
    if (!user || isStreaming) return;

    let convId = activeId;

    // Create conversation if none active
    if (!convId) {
      const title = text.split(/\s+/).slice(0, 6).join(' ');
      const { data: conv, error } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title })
        .select('id')
        .single();
      if (error || !conv) {
        toast.error('Gagal membuat percakapan.');
        return;
      }
      convId = conv.id;
      setActiveId(convId);
    }

    // Save user message
    const { data: userMsg } = await supabase
      .from('messages')
      .insert({ conversation_id: convId, user_id: user.id, role: 'user', content: text })
      .select('id, role, content')
      .single();

    if (!userMsg) return;

    const newMessages = [...messages, userMsg as ChatMessage];
    setMessages(newMessages);
    setIsStreaming(true);

    // Build history for AI
    const history: Msg[] = newMessages.map(m => ({ role: m.role, content: m.content }));

    let assistantContent = '';
    const tempId = 'streaming-' + Date.now();

    try {
      await streamChat({
        messages: history,
        onDelta: (chunk) => {
          assistantContent += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.id === tempId) {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
            }
            return [...prev, { id: tempId, role: 'assistant', content: assistantContent }];
          });
        },
        onDone: () => {},
      });

      // Save assistant message to DB
      const { data: savedMsg } = await supabase
        .from('messages')
        .insert({ conversation_id: convId, user_id: user.id, role: 'assistant', content: assistantContent })
        .select('id, role, content')
        .single();

      if (savedMsg) {
        setMessages(prev => prev.map(m => m.id === tempId ? (savedMsg as ChatMessage) : m));
      }

      // Update conversation timestamp
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);
      fetchConversations();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan.');
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-50 md:z-auto h-full w-[260px] shrink-0
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={handleNew}
          onDelete={handleDelete}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center h-12 px-4 border-b border-border shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded hover:bg-secondary transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-heading font-bold text-sm">
            Hello <span className="text-gold">World</span>
          </span>
        </div>

        {activeId ? (
          <>
            <ChatMessages messages={messages} isStreaming={isStreaming} />
            <ChatInput onSend={sendMessage} disabled={isStreaming} />
          </>
        ) : (
          <>
            <WelcomeScreen onSuggestionClick={sendMessage} />
            <ChatInput onSend={sendMessage} disabled={isStreaming} />
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
