import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

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

const TypingIndicator = () => (
  <div className="flex items-center gap-2 px-4 py-3">
    <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center shrink-0">
      <span className="text-primary-foreground font-heading text-xs font-bold">HW</span>
    </div>
    <div className="flex gap-1 px-3 py-2 rounded-2xl bg-assistant-bubble">
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
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center shrink-0 mt-1 mr-2">
                <span className="text-primary-foreground font-heading text-xs font-bold">HW</span>
              </div>
            )}
            <div
              className={`max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-user-bubble text-user-bubble-foreground rounded-br-md'
                  : 'bg-assistant-bubble text-assistant-bubble-foreground rounded-bl-md'
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
                <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:bg-background prose-pre:rounded-lg prose-code:text-gold">
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
