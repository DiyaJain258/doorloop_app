import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import { Mail, MessageSquare, StickyNote, Activity, Send, Loader2 } from 'lucide-react';

interface LogItem {
  id: string;
  type: 'Email' | 'SMS' | 'Note';
  message: string;
  recipientOrAuthor: string;
  timestamp: string;
}

interface CommunicationPanelProps {
  initialLogs?: LogItem[];
  entityName: string;
  onLogAdd?: (item: LogItem) => void;
}

export const CommunicationPanel: React.FC<CommunicationPanelProps> = ({
  initialLogs = [],
  entityName,
  onLogAdd,
}) => {
  const [logs, setLogs] = useState<LogItem[]>(initialLogs);
  const [loading, setLoading] = useState(false);

  // Email form
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  
  // SMS form
  const [smsBody, setSmsBody] = useState('');
  
  // Note form
  const [noteBody, setNoteBody] = useState('');

  const addLog = async (type: 'Email' | 'SMS' | 'Note', message: string, detail: string) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);

    const newLog: LogItem = {
      id: `log-${Date.now()}`,
      type,
      message,
      recipientOrAuthor: detail,
      timestamp: 'Just now',
    };
    setLogs((prev) => [newLog, ...prev]);
    onLogAdd?.(newLog);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailBody.trim()) return;
    addLog('Email', `Subject: ${emailSubject || 'No Subject'} - ${emailBody}`, `To: ${entityName}`);
    setEmailSubject('');
    setEmailBody('');
  };

  const handleSendSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsBody.trim()) return;
    addLog('SMS', smsBody, `To: ${entityName}`);
    setSmsBody('');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim()) return;
    addLog('Note', noteBody, 'Author: Manager');
    setNoteBody('');
  };

  return (
    <Card className="p-6 border-border bg-card text-foreground">
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="email" className="flex items-center gap-1.5">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-1.5">
            <StickyNote className="w-4 h-4" />
            Internal Notes
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            Activity feed
          </TabsTrigger>
        </TabsList>

        {/* EMAIL COMPOSE PANEL */}
        <TabsContent value="email">
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Subject</label>
              <Input
                placeholder="e.g. Outstanding balance reminder"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Email Body</label>
              <textarea
                placeholder="Type your email content here..."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 text-foreground"
                disabled={loading}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !emailBody.trim()} className="flex items-center gap-1">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Mock Email
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* SMS COMPOSE PANEL */}
        <TabsContent value="sms">
          <form onSubmit={handleSendSMS} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">SMS Text Message</label>
              <textarea
                placeholder="Type SMS text..."
                value={smsBody}
                onChange={(e) => setSmsBody(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 text-foreground"
                disabled={loading}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !smsBody.trim()} className="flex items-center gap-1">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Mock SMS
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* INTERNAL NOTES PANEL */}
        <TabsContent value="notes">
          <form onSubmit={handleSaveNote} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Save Internal Note</label>
              <textarea
                placeholder="Save note about this applicant/resident..."
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 text-foreground"
                disabled={loading}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !noteBody.trim()} className="flex items-center gap-1">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <StickyNote className="w-4 h-4" />}
                Save Note
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* ACTIVITY FEED PANEL */}
        <TabsContent value="activity">
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">No communication records logged.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 bg-secondary/40 border border-border/40 rounded-xl flex items-start space-x-3 text-xs">
                  <div className="p-1.5 bg-primary/10 text-primary rounded-lg mt-0.5">
                    {log.type === 'Email' ? <Mail className="w-3.5 h-3.5" /> : log.type === 'SMS' ? <MessageSquare className="w-3.5 h-3.5" /> : <StickyNote className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center font-bold">
                      <span>{log.type} Logged</span>
                      <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5 font-medium">{log.recipientOrAuthor}</p>
                    <p className="text-foreground/80 mt-1 font-semibold leading-relaxed">{log.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
export default CommunicationPanel;
