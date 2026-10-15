import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge } from './StatusBadge';
import { MessageSquare, Mail, Phone, Calendar, Send, Star, User } from 'lucide-react';
import { clsx } from 'clsx';

// --- CHANNEL BADGE ---
export const ChannelBadge: React.FC<{ channel: 'Email' | 'SMS' | 'Chat' | 'Notification' }> = ({ channel }) => {
  return (
    <span className={clsx(
      'text-[9px] font-black uppercase px-2 py-0.5 rounded border',
      channel === 'Email' && 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      channel === 'SMS' && 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      channel === 'Chat' && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      channel === 'Notification' && 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    )}>
      {channel}
    </span>
  );
};

// --- CAMPAIGN CARD ---
interface CampaignCardProps {
  name: string;
  type: string;
  audience: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  status: string;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  name,
  type,
  audience,
  sentCount,
  openRate,
  clickRate,
  status,
}) => {
  return (
    <Card className="p-5 border bg-card space-y-4 text-xs font-semibold">
      <div className="flex justify-between items-start border-b pb-2">
        <div>
          <h4 className="font-extrabold text-sm uppercase">{name}</h4>
          <span className="text-[9px] font-bold text-muted-foreground uppercase">{type} Campaign • To {audience}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center bg-secondary/15 rounded-xl p-3">
        <div>
          <p className="text-[9px] text-muted-foreground uppercase">Sent</p>
          <p className="font-black text-sm">{sentCount}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase">Open Rate</p>
          <p className="font-black text-sm text-indigo-500">{openRate}%</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase">Click Rate</p>
          <p className="font-black text-sm text-emerald-500">{clickRate}%</p>
        </div>
      </div>
    </Card>
  );
};

// --- TEMPLATE EDITOR ---
interface TemplateEditorProps {
  title: string;
  body: string;
  onChange: (body: string) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ title, body, onChange }) => {
  const insertVariable = (variable: string) => {
    onChange(body + ` {{${variable}}}`);
  };

  return (
    <div className="space-y-4 text-xs font-semibold text-foreground">
      <div className="flex flex-wrap gap-1.5 p-2 bg-secondary/15 border rounded-xl">
        <span className="text-[9px] font-bold uppercase text-muted-foreground self-center mr-1">Insert Variables:</span>
        {['tenantName', 'propertyName', 'unitNumber', 'rentAmount', 'dueDate'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => insertVariable(v)}
            className="text-[9px] font-bold uppercase bg-card border px-2.5 py-1 rounded hover:bg-secondary transition"
          >
            {v}
          </button>
        ))}
      </div>

      <textarea
        className="w-full min-h-[150px] p-3 rounded-xl border bg-card text-foreground font-semibold"
        value={body}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter template body content..."
      />
    </div>
  );
};

// --- ACTIVITY TIMELINE ---
interface ActivityItem {
  id: string;
  timestamp: string;
  user: string;
  channel: string;
  action: string;
}

export const ActivityTimeline: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
  return (
    <div className="space-y-4 text-xs font-semibold text-foreground">
      {activities.map((act) => (
        <div key={act.id} className="flex gap-3 items-start border-b pb-3 border-dashed border-border/40">
          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">{act.action}</p>
            <p className="text-[9px] text-muted-foreground font-medium mt-0.5">
              {act.timestamp} • By {act.user} • {act.channel}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
