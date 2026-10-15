import React, { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Send, User } from 'lucide-react';

export const CommunicationPage: React.FC = () => {
  const [messages, setMessages] = useState([
    { sender: 'John Doe', text: 'Hi, I paid my rent online. Please confirm.', time: '2 hours ago' },
    { sender: 'System Admin', text: 'AC diagnostic dispatched to Unit 301.', time: 'Yesterday' }
  ]);
  const [inputVal, setInputVal] = useState('');

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setMessages([
      ...messages,
      { sender: 'Sarah Davis (Manager)', text: inputVal, time: 'Just now' }
    ]);
    setInputVal('');
  };

  return (
    <div className="max-w-3xl flex flex-col h-[75vh]">
      <PageHeader
        title="Communication Hub"
        description="Text, email, and notify your tenants, vendors, and property owners from a single feed."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Communication' }
        ]}
      />

      <div className="flex-1 border border-border bg-card rounded-2xl p-4 flex flex-col overflow-hidden text-foreground">
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.map((m, idx) => (
            <div key={idx} className="flex space-x-3 p-3 bg-muted/40 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{m.sender}</span>
                  <span className="text-[10px] text-muted-foreground">{m.time}</span>
                </div>
                <p className="text-sm mt-1 text-foreground/80 font-medium">{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="mt-4 flex space-x-2 pt-3 border-t">
          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type a message to resident..."
          />
          <Button type="submit" className="flex items-center gap-1">
            <Send className="w-4 h-4" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
export default CommunicationPage;
