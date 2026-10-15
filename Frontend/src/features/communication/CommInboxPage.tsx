import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { ChannelBadge } from '../../components/CommunicationComponents';
import { OwnerMessageThread } from '../../components/OwnerComponents';
import { User, MessageSquare, Shield, Landmark, Phone, Mail } from 'lucide-react';

export const CommInboxPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');

  // Queries
  const { data: conversations = [], isLoading: loadConv } = useQuery({ queryKey: ['comm-conversations-list'], queryFn: () => api.conversations.getAll() });
  const { data: messages = [], isLoading: loadMsg } = useQuery({ queryKey: ['comm-messages-inbox'], queryFn: () => api.messages.getAll() });

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const replyMutation = useMutation({
    mutationFn: (text: string) => {
      return api.messages.create({
        sender: 'Property Manager Staff',
        recipient: activeConv?.contactName || 'Tenant',
        body: text,
        channel: 'Chat',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comm-messages-inbox'] });
    },
  });

  if (loadConv || loadMsg || !activeConv) {
    return <LoadingSkeleton type="card" />;
  }

  // Filter messages for current thread
  const threadMessages = messages.map((m) => ({
    id: m.id,
    sender: m.sender,
    body: m.body,
    timestamp: m.timestamp,
  })).reverse();

  return (
    <div className="space-y-6 text-foreground h-[calc(100vh-140px)] flex flex-col">
      <PageHeader
        title={t('commInbox.title')}
        description={t('commInbox.desc')}
        breadcrumbs={[
          { label: t('header.home'), href: '/communication' },
          { label: t('commInbox.title') },
        ]}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
        
        {/* LEFT COLUMN: Conversation List */}
        <Card className="lg:col-span-1 p-4 border bg-card flex flex-col overflow-y-auto space-y-3 shrink-0">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground border-b pb-2">Active threads</h3>
          <div className="space-y-2 text-xs font-semibold">
            {conversations.slice(0, 8).map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedConvId(c.id)}
                className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1.5 ${
                  selectedConvId === c.id ? 'bg-primary/10 border-primary' : 'bg-secondary/15 hover:bg-secondary/35 border-border/40'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold truncate max-w-[120px]">{c.contactName}</span>
                  <ChannelBadge channel={c.channel} />
                </div>
                <p className="text-[10px] text-muted-foreground truncate w-full">{c.lastMessage}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* CENTER COLUMN: Chat Thread */}
        <div className="lg:col-span-2 flex flex-col overflow-hidden">
          <OwnerMessageThread
            messages={threadMessages}
            onReply={(text) => replyMutation.mutate(text)}
          />
        </div>

        {/* RIGHT COLUMN: Contact Details Profile */}
        <Card className="hidden lg:flex lg:col-span-1 p-5 border bg-card flex-col gap-4 text-xs font-semibold overflow-y-auto shrink-0">
          <div className="text-center border-b pb-4 space-y-2">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center font-bold text-lg text-primary mx-auto">
              {activeConv.contactName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-extrabold text-sm uppercase">{activeConv.contactName}</h4>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Resident Account</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">Active Building Location</span>
              <p className="font-bold">Skyline Luxury Lofts • Unit #304</p>
            </div>
            <div className="space-y-1 border-t pt-2.5">
              <span className="text-[10px] text-muted-foreground uppercase">Contact Email</span>
              <p className="font-bold">{activeConv.contactName.toLowerCase().replace(' ', '')}@rentals.com</p>
            </div>
            <div className="space-y-1 border-t pt-2.5">
              <span className="text-[10px] text-muted-foreground uppercase">Assigned User Agent</span>
              <p className="font-bold">{activeConv.assignedUser}</p>
            </div>
            
            {/* Quick Contact Channels */}
            <div className="space-y-2 border-t pt-3">
              <span className="text-[10px] text-muted-foreground uppercase font-black">Direct Channels</span>
              <div className="flex flex-col gap-2 pt-1 font-bold text-xs">
                <a 
                  href={`sms:5550199`} 
                  className="flex items-center justify-between p-2.5 bg-secondary/20 hover:bg-secondary/40 border border-border/40 rounded-xl transition text-foreground"
                >
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    <span>SMS Client</span>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground">555-0199</span>
                </a>
                <a 
                  href={`mailto:${activeConv.contactName.toLowerCase().replace(' ', '')}@rentals.com`} 
                  className="flex items-center justify-between p-2.5 bg-secondary/20 hover:bg-secondary/40 border border-border/40 rounded-xl transition text-foreground"
                >
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>Send Email</span>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[80px]">
                    {activeConv.contactName.toLowerCase().replace(' ', '')}@rentals.com
                  </span>
                </a>
                <a 
                  href={`https://wa.me/${((activeConv as any).phone || '').replace(/\D/g, '') || '15550199'}?text=${encodeURIComponent(`Hi ${activeConv.contactName}, contacting you regarding property management updates.`)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-2.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 rounded-xl transition text-foreground"
                >
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>WhatsApp</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-500 font-bold">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
export default CommInboxPage;
