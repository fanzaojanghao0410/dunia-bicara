import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrls?: string[];
}

interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all" title="Salin">
      {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const TypingIndicator = () => (
  <div className="flex items-start gap-3 px-4 py-3 max-w-3xl mx-auto">
    <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
      <span className="gradient-text font-heading text-xs font-bold">HW</span>
    </div>
    <div className="flex gap-1.5 px-4 py-3 rounded-2xl bg-assistant-bubble">
      <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground inline-block" />
      <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground inline-block" />
      <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground inline-block" />
    </div>
  </div>
);

const ChatMessages = ({ messages, isStreaming }: ChatMessagesProps) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 mt-0.5 mr-3">
                <span className="gradient-text font-heading text-xs font-bold">HW</span>
              </div>
            )}
            <div
              className={`group relative max-w-[85%] md:max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-user-bubble text-user-bubble-foreground rounded-2xl rounded-br-lg'
                  : 'bg-assistant-bubble text-assistant-bubble-foreground rounded-2xl rounded-bl-lg'
              }`}
            >
              {msg.role === 'assistant' && <CopyButton text={msg.content} />}
              {msg.imageUrls && msg.imageUrls.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {msg.imageUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Uploaded"
                      className="max-w-[200px] max-h-[200px] rounded-xl object-cover border border-border/30"
                    />
                  ))}
                </div>
              )}
              {msg.role === 'assistant' ? (
                <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-pre:bg-background prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-code:text-primary prose-headings:font-heading prose-headings:text-foreground">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content !== '(gambar)' && <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && <TypingIndicator />}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
