import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { OwnerMessageThread } from '../../components/OwnerComponents';
import { MessageSquare, Plus, Loader2, Phone, Mail } from 'lucide-react';
import { FormDialog } from '../../components/FormDialog';

export const TenantMessagesPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeSender, setActiveSender] = useState('Property Manager Office');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Form states
  const [recipient, setRecipient] = useState('Property Manager Office');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Queries
  const { data: conversations = [], isLoading } = useQuery({ queryKey: ['tenant-conversations-list'], queryFn: () => api.tenantMessages.getAll() });

  const composeMutation = useMutation({
    mutationFn: () => {
      return api.tenantMessages.compose({
        sender: 'Sarah Connor (Resident)',
        recipient,
        subject,
        body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-conversations-list'] });
      setIsComposeOpen(false);
      setSubject('');
      setBody('');
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: (text: string) => {
      return api.tenantMessages.compose({
        sender: 'Sarah Connor (Resident)',
        recipient: activeSender,
        subject: `Re: Resident Discussion`,
        body: text,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-conversations-list'] });
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

  const contactsList = [
    { key: 'Property Manager Office', label: t('tenant.messages.senders.propertyManager') },
    { key: 'Leasing Office', label: t('tenant.messages.senders.leasingOffice') },
    { key: 'Maintenance Team', label: t('tenant.messages.senders.maintenanceTeam') },
    { key: 'Accounting Office', label: t('tenant.messages.senders.accountingOffice') },
  ];

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title={t('tenant.messages.title')}
        description={t('tenant.messages.desc')}
        breadcrumbs={[
          { label: t('header.home'), href: '/tenant' },
          { label: t('tenant.messages.title') },
        ]}
        action={{
          label: t('tenant.messages.compose'),
          onClick: () => setIsComposeOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Contacts Sidebar */}
        <Card className="md:col-span-1 p-4 border bg-card space-y-3">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">{t('tenant.messages.contacts')}</h3>
          <div className="space-y-2 text-xs font-semibold">
            {contactsList.map((contact) => (
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

          {/* Quick Contact Channels */}
          <div className="space-y-2 border-t pt-3.5">
            <span className="text-[10px] text-muted-foreground uppercase font-black">{t('tenant.messages.directChannels')}</span>
            <div className="flex flex-col gap-2 pt-1 font-bold text-xs">
              <a 
                href={`sms:5550199`} 
                className="flex items-center justify-between p-2.5 bg-secondary/20 hover:bg-secondary/40 border border-border/40 rounded-xl transition text-foreground"
              >
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  <span>{t('tenant.messages.smsManager')}</span>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">555-0199</span>
              </a>
              <a 
                href={`mailto:manager@apexpm.com`} 
                className="flex items-center justify-between p-2.5 bg-secondary/20 hover:bg-secondary/40 border border-border/40 rounded-xl transition text-foreground"
              >
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>{t('tenant.messages.emailManager')}</span>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">manager@apexpm.com</span>
              </a>
              <a 
                href={`https://wa.me/15550199?text=${encodeURIComponent('Hi Property Manager, contacting you from Tenant Portal.')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between p-2.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 rounded-xl transition text-foreground"
              >
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('tenant.messages.whatsapp')}</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-500 font-bold">WhatsApp</span>
              </a>
            </div>
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
      <FormDialog open={isComposeOpen} onOpenChange={setIsComposeOpen} title={t('tenant.messages.compose')}>
        <div className="space-y-4 pt-2 text-xs font-semibold">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t('tenant.messages.recipientGroup')}</label>
            <Select value={recipient} onChange={(e: any) => setRecipient(e.target.value)}>
              <option value="Property Manager Office">{t('tenant.messages.senders.propertyManager')}</option>
              <option value="Leasing Office">{t('tenant.messages.senders.leasingOffice')}</option>
              <option value="Maintenance Team">{t('tenant.messages.senders.maintenanceTeam')}</option>
              <option value="Accounting Office">{t('tenant.messages.senders.accountingOffice')}</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t('tenant.messages.subjectTitle')}</label>
            <Input placeholder={t('tenant.messages.subjectPlaceholder')} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t('tenant.messages.messageContent')}</label>
            <textarea
              className="w-full min-h-[100px] p-2.5 rounded-lg border bg-card text-foreground"
              placeholder={t('tenant.messages.contentPlaceholder')}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsComposeOpen(false)}>{t('tenant.messages.cancel')}</Button>
            <Button onClick={() => composeMutation.mutate()} disabled={!subject || !body || composeMutation.isPending}>
              {composeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('tenant.messages.send')}
            </Button>
          </div>

        </div>
      </FormDialog>
    </div>
  );
};
export default TenantMessagesPage;
