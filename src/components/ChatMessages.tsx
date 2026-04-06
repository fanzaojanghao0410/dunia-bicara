import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Pencil, RotateCcw, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrls?: string[];
}

interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
}

const CodeBlock = ({ children, className }: { children: string; className?: string }) => {
  const [copied, setCopied] = useState(false);
  const lang = className?.replace('language-', '') || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group/code my-3 rounded-xl overflow-hidden border border-border bg-[hsl(210,25%,8%)]">
      <div className="flex items-center justify-between px-4 py-2 bg-[hsl(210,20%,12%)] border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Tersalin' : 'Salin'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
};

const MessageActions = ({
  message,
  onCopy,
  onEdit,
  onRegenerate,
  isLast,
}: {
  message: Message;
  onCopy: () => void;
  onEdit?: () => void;
  onRegenerate?: () => void;
  isLast: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover/msg:opacity-100 transition-opacity">
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        title="Salin"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      {message.role === 'user' && onEdit && (
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
      {message.role === 'assistant' && isLast && onRegenerate && (
        <button
          onClick={onRegenerate}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Ulangi respons"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

const EditableMessage = ({
  content,
  onSave,
  onCancel,
}: {
  content: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
}) => {
  const [text, setText] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="w-full max-w-[80%] md:max-w-[70%]">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
        className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 font-body"
      />
      <div className="flex gap-2 mt-2 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          Batal
        </button>
        <button
          onClick={() => text.trim() && onSave(text.trim())}
          className="px-3 py-1.5 rounded-lg text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
        >
          Kirim
        </button>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex items-start gap-3 px-2 md:px-0 max-w-3xl mx-auto">
    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
      <span className="text-primary-foreground font-heading text-[10px] font-bold">HW</span>
    </div>
    <div className="flex gap-1 px-4 py-3 rounded-2xl bg-assistant-bubble">
      <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground inline-block" />
      <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground inline-block" />
      <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground inline-block" />
    </div>
  </div>
);

const ScrollToBottom = ({ onClick, visible }: { onClick: () => void; visible: boolean }) => {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 p-2 rounded-full bg-secondary border border-border shadow-lg hover:bg-secondary/80 transition-all animate-fade-in"
    >
      <ChevronDown className="w-4 h-4 text-foreground" />
    </button>
  );
};

const ChatMessages = ({ messages, isStreaming, onEdit, onRegenerate }: ChatMessagesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const userScrolledUp = useRef(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    endRef.current?.scrollIntoView({ behavior });
    userScrolledUp.current = false;
    setShowScrollBtn(false);
  };

  useEffect(() => {
    if (!userScrolledUp.current) {
      scrollToBottom();
    }
  }, [messages, isStreaming]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    userScrolledUp.current = !atBottom;
    setShowScrollBtn(!atBottom);
  };

  const lastAssistantIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i;
    }
    return -1;
  })();

  return (
    <div className="flex-1 overflow-y-auto relative" ref={containerRef} onScroll={handleScroll}>
      <div className="px-4 py-6 space-y-6 max-w-3xl mx-auto">
        {messages.map((msg, idx) => {
          if (editingId === msg.id && msg.role === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <EditableMessage
                  content={msg.content}
                  onSave={(newContent) => {
                    setEditingId(null);
                    onEdit?.(msg.id, newContent);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`group/msg flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-3'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary-foreground font-heading text-[10px] font-bold">HW</span>
                </div>
              )}
              <div className="flex flex-col min-w-0 max-w-[80%] md:max-w-[70%]">
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-user-bubble text-user-bubble-foreground rounded-br-md'
                      : 'bg-transparent text-assistant-bubble-foreground'
                  }`}
                >
                  {msg.imageUrls && msg.imageUrls.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-2">
                      {msg.imageUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Uploaded"
                          className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:text-foreground prose-headings:font-heading prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                      <ReactMarkdown
                        components={{
                          code({ children, className, ...props }) {
                            const isBlock = className?.includes('language-') || String(children).includes('\n');
                            if (isBlock) {
                              return <CodeBlock className={className}>{String(children)}</CodeBlock>;
                            }
                            return (
                              <code className="px-1.5 py-0.5 rounded-md bg-secondary text-primary text-[13px] font-mono" {...props}>
                                {children}
                              </code>
                            );
                          },
                          pre({ children }) {
                            return <>{children}</>;
                          },
                        }}
                      >{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content !== '(gambar)' && <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                <MessageActions
                  message={msg}
                  isLast={msg.role === 'assistant' && idx === lastAssistantIdx}
                  onCopy={() => {
                    navigator.clipboard.writeText(msg.content);
                    toast.success('Tersalin ke clipboard');
                  }}
                  onEdit={msg.role === 'user' ? () => setEditingId(msg.id) : undefined}
                  onRegenerate={onRegenerate ? () => onRegenerate(msg.id) : undefined}
                />
              </div>
            </div>
          );
        })}
        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && <TypingIndicator />}
        <div ref={endRef} />
      </div>
      <ScrollToBottom onClick={() => scrollToBottom()} visible={showScrollBtn} />
    </div>
  );
};

export default ChatMessages;
