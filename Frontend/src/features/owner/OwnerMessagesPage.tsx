import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { OwnerMessage } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { OwnerMessageThread } from '../../components/OwnerComponents';
import { MessageSquare, Plus, Loader2 } from 'lucide-react';
import { FormDialog } from '../../components/FormDialog';

export const OwnerMessagesPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeSender, setActiveSender] = useState('Property Manager');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Form states
  const [recipient, setRecipient] = useState('Property Manager');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Queries
  const { data: conversations = [], isLoading } = useQuery({ queryKey: ['owner-conversations-list'], queryFn: () => api.ownerMessages.getAll() });

  const composeMutation = useMutation({
    mutationFn: () => {
      return api.ownerMessages.compose({
        sender: 'William Anderson (Owner)',
        recipient,
        subject,
        body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-conversations-list'] });
      setIsComposeOpen(false);
      setSubject('');
      setBody('');
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: (text: string) => {
      return api.ownerMessages.compose({
        sender: 'William Anderson (Owner)',
        recipient: activeSender,
        subject: `Re: Portfolio Update`,
        body: text,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-conversations-list'] });
    },
  });

  if (isLoading) {
    return <LoadingSkeleton type="card" />;
  }

  // Filter messages for current thread
  const threadMessages = conversations
    .filter((m) => m.sender === activeSender || m.recipient === activeSender)
    .map((m) => ({
      id: m.id,
      sender: m.sender,
      body: m.body,
      timestamp: m.timestamp,
    }))
    .reverse();

  // Distinct senders
  const sendersList = [
    { key: 'Property Manager', label: t('owner.messages.senders.propertyManager') },
    { key: 'Accountant', label: t('owner.messages.senders.accountant') },
    { key: 'Leasing Lead', label: t('owner.messages.senders.leasingLead') },
    { key: 'Resident Representative', label: t('owner.messages.senders.residentRep') },
  ];

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title={t('owner.messages.title')}
        description={t('owner.messages.desc')}
        breadcrumbs={[
          { label: t('header.home'), href: '/owner' },
          { label: t('owner.nav.messages') },
        ]}
        action={{
          label: t('owner.messages.compose'),
          onClick: () => setIsComposeOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Senders / Contacts Sidebar */}
        <Card className="md:col-span-1 p-4 border bg-card space-y-3">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">{t('owner.messages.contacts')}</h3>
          <div className="space-y-2 text-xs font-semibold">
            {sendersList.map((contact) => (
              <button
                key={contact.key}
                onClick={() => setActiveSender(contact.key)}
                className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                  activeSender === contact.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/15 hover:bg-secondary/35 border-border/40'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <MessageSquare className="w-4.5 h-4.5 shrink-0" />
                  <span className="truncate">{contact.label}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Message Thread view */}
        <div className="md:col-span-2">
          <OwnerMessageThread
            messages={threadMessages}
            onReply={(text) => sendReplyMutation.mutate(text)}
          />
        </div>

      </div>

      {/* COMPOSE DIALOG */}
      <FormDialog open={isComposeOpen} onOpenChange={setIsComposeOpen} title={t('owner.messages.compose')}>
        <div className="space-y-4 pt-2 text-xs font-semibold">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t('owner.messages.recipientGroup')}</label>
            <Select value={recipient} onChange={(e: any) => setRecipient(e.target.value)}>
              <option value="Property Manager">{t('owner.messages.senders.propertyManager')}</option>
              <option value="Accountant">{t('owner.messages.senders.accountant')}</option>
              <option value="Leasing Lead">{t('owner.messages.senders.leasingLead')}</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t('owner.messages.subjectTitle')}</label>
            <Input placeholder={t('owner.messages.subjectPlaceholder')} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t('owner.messages.messageContent')}</label>
            <textarea
              className="w-full min-h-[100px] p-2.5 rounded-lg border bg-card text-foreground"
              placeholder={t('owner.messages.contentPlaceholder')}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsComposeOpen(false)}>{t('owner.messages.cancel')}</Button>
            <Button onClick={() => composeMutation.mutate()} disabled={!subject || !body || composeMutation.isPending}>
              {composeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('owner.messages.send')}
            </Button>
          </div>

        </div>
      </FormDialog>
    </div>
  );
};
export default OwnerMessagesPage;
