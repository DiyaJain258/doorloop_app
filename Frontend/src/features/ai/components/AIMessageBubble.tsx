import React from 'react';
import { Bot, User, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';

interface AIMessageBubbleProps {
  sender: 'AI' | 'User';
  text: string;
  timestamp?: string;
  onCopy?: () => void;
}

export const AIMessageBubble: React.FC<AIMessageBubbleProps> = ({
  sender,
  text,
  timestamp,
  onCopy,
}) => {
  const isAI = sender === 'AI';

  return (
    <div className={`flex items-start space-x-3 p-4 rounded-xl ${isAI ? 'bg-primary/5 border border-primary/10' : 'bg-muted/50 ml-12'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isAI ? 'bg-primary text-white' : 'bg-secondary text-foreground'}`}>
        {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-center">
          <span className="font-extrabold text-xs text-muted-foreground">{sender}</span>
          {timestamp && <span className="text-[10px] text-muted-foreground/60">{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
        </div>
        <p className="text-sm text-foreground/90 font-medium leading-relaxed whitespace-pre-line">{text}</p>

        {isAI && (
          <div className="flex items-center space-x-2 pt-2 text-muted-foreground/60">
            <button onClick={() => alert('Thanks for the feedback!')} className="hover:text-primary transition p-1 rounded hover:bg-secondary/40">
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => alert('Thanks for reporting!')} className="hover:text-primary transition p-1 rounded hover:bg-secondary/40">
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            {onCopy && (
              <button onClick={onCopy} className="hover:text-primary transition p-1 rounded hover:bg-secondary/40 ml-2" title="Copy reply">
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default AIMessageBubble;
