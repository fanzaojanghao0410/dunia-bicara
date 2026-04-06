import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { streamChat, Msg, ContentPart } from '@/lib/streamChat';
import ChatSidebar from '@/components/ChatSidebar';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import WelcomeScreen from '@/components/WelcomeScreen';
import { Menu } from 'lucide-react';
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
  imageUrls?: string[];
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

  const handleNew = () => { setActiveId(null); setMessages([]); };

  const handleDelete = async (id: string) => {
    await supabase.from('conversations').delete().eq('id', id);
    if (activeId === id) handleNew();
    fetchConversations();
  };

  const uploadImages = async (imageUrls: string[]): Promise<string[]> => {
    if (!user) return [];
    const uploaded: string[] = [];
    for (const blobUrl of imageUrls) {
      try {
        const resp = await fetch(blobUrl);
        const blob = await resp.blob();
        const ext = blob.type.split('/')[1] || 'png';
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('chat-attachments').upload(fileName, blob, { contentType: blob.type });
        if (!error) {
          const { data: urlData } = supabase.storage.from('chat-attachments').getPublicUrl(fileName);
          uploaded.push(urlData.publicUrl);
        }
      } catch (e) { console.error('Upload failed:', e); }
    }
    return uploaded;
  };

  const buildHistory = (msgs: ChatMessage[]): Msg[] => {
    return msgs.map(m => {
      if (m.imageUrls && m.imageUrls.length > 0) {
        const parts: ContentPart[] = [];
        if (m.content && m.content !== '(gambar)') {
          parts.push({ type: 'text', text: m.content });
        }
        for (const url of m.imageUrls) {
          parts.push({ type: 'image_url', image_url: { url } });
        }
        return { role: m.role, content: parts };
      }
      return { role: m.role, content: m.content };
    });
  };

  const streamAssistant = async (convId: string, history: Msg[], currentMessages: ChatMessage[]) => {
    let assistantContent = '';
    const tempId = 'streaming-' + Date.now();
    setIsStreaming(true);

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

      const { data: savedMsg } = await supabase
        .from('messages')
        .insert({ conversation_id: convId, user_id: user!.id, role: 'assistant', content: assistantContent })
        .select('id, role, content')
        .single();

      if (savedMsg) {
        setMessages(prev => prev.map(m => m.id === tempId ? (savedMsg as ChatMessage) : m));
      }

      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);
      fetchConversations();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan.');
    } finally {
      setIsStreaming(false);
    }
  };

  const sendMessage = async (text: string, imageUrls?: string[]) => {
    if (!user || isStreaming) return;

    let convId = activeId;
    let uploadedUrls: string[] = [];

    if (imageUrls && imageUrls.length > 0) {
      uploadedUrls = await uploadImages(imageUrls);
    }

    if (!convId) {
      const title = text.split(/\s+/).slice(0, 6).join(' ');
      const { data: conv, error } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title: title || 'Analisis Gambar' })
        .select('id')
        .single();
      if (error || !conv) { toast.error('Gagal membuat percakapan.'); return; }
      convId = conv.id;
      setActiveId(convId);
    }

    const contentToSave = uploadedUrls.length > 0 ? `${text}\n\n[IMAGES: ${uploadedUrls.join(', ')}]` : text;
    const { data: userMsg } = await supabase
      .from('messages')
      .insert({ conversation_id: convId, user_id: user.id, role: 'user', content: contentToSave })
      .select('id, role, content')
      .single();
    if (!userMsg) return;

    const displayMsg: ChatMessage = {
      id: userMsg.id, role: 'user', content: text,
      imageUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
    };

    const newMessages = [...messages, displayMsg];
    setMessages(newMessages);
    await streamAssistant(convId, buildHistory(newMessages), newMessages);
  };

  const handleEdit = async (messageId: string, newContent: string) => {
    if (!user || !activeId || isStreaming) return;

    // Find the message index
    const msgIdx = messages.findIndex(m => m.id === messageId);
    if (msgIdx === -1) return;

    // Keep messages before the edited one, then add the edited version
    const before = messages.slice(0, msgIdx);

    // Delete old messages from DB (the edited one and everything after)
    const idsToDelete = messages.slice(msgIdx).map(m => m.id).filter(id => !id.startsWith('streaming-'));
    for (const id of idsToDelete) {
      await supabase.from('messages').delete().eq('id', id);
    }

    // Save new user message
    const { data: newUserMsg } = await supabase
      .from('messages')
      .insert({ conversation_id: activeId, user_id: user.id, role: 'user', content: newContent })
      .select('id, role, content')
      .single();
    if (!newUserMsg) return;

    const editedMsg: ChatMessage = { id: newUserMsg.id, role: 'user', content: newContent };
    const newMessages = [...before, editedMsg];
    setMessages(newMessages);
    await streamAssistant(activeId, buildHistory(newMessages), newMessages);
  };

  const handleRegenerate = async (messageId: string) => {
    if (!user || !activeId || isStreaming) return;

    const msgIdx = messages.findIndex(m => m.id === messageId);
    if (msgIdx === -1 || messages[msgIdx].role !== 'assistant') return;

    // Delete the assistant message from DB
    if (!messageId.startsWith('streaming-')) {
      await supabase.from('messages').delete().eq('id', messageId);
    }

    // Remove the assistant message
    const before = messages.slice(0, msgIdx);
    setMessages(before);
    await streamAssistant(activeId, buildHistory(before), before);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

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

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center h-12 px-4 border-b border-border shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-heading font-bold text-sm">
            Hello <span className="text-gold">World</span>
          </span>
        </div>

        {activeId ? (
          <>
            <ChatMessages
              messages={messages}
              isStreaming={isStreaming}
              onEdit={handleEdit}
              onRegenerate={handleRegenerate}
            />
            <ChatInput onSend={sendMessage} disabled={isStreaming} />
          </>
        ) : (
          <>
            <WelcomeScreen onSuggestionClick={(text) => sendMessage(text)} />
            <ChatInput onSend={sendMessage} disabled={isStreaming} />
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
