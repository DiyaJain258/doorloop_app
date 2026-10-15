import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge } from './StatusBadge';
import { FileText, ShieldAlert, Wrench, Download, Send, Star } from 'lucide-react';
import { clsx } from 'clsx';

import { useTranslation } from 'react-i18next';

// --- OWNER SUMMARY CARD ---
interface OwnerSummaryCardProps {
  title: string;
  value: number | string;
  subText?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

export const OwnerSummaryCard: React.FC<OwnerSummaryCardProps> = ({
  title,
  value,
  subText,
  trend,
  trendType = 'neutral',
}) => {
  return (
    <Card className="p-5 border bg-card text-foreground flex flex-col justify-between h-full">
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black mt-1.5">
          {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
        </p>
      </div>
      {(trend || subText) && (
        <div className="flex items-center justify-between mt-4 text-[10px] font-bold">
          {trend && (
            <span className={clsx(
              trendType === 'positive' && 'text-emerald-500',
              trendType === 'negative' && 'text-rose-500',
              trendType === 'neutral' && 'text-muted-foreground'
            )}>
              {trend}
            </span>
          )}
          {subText && <span className="text-muted-foreground font-medium">{subText}</span>}
        </div>
      )}
    </Card>
  );
};

// --- PROPERTY PERFORMANCE CARD ---
interface PropertyPerformanceCardProps {
  propertyName: string;
  occupancy: string;
  revenue: number;
  expenses: number;
  net: number;
}

export const PropertyPerformanceCard: React.FC<PropertyPerformanceCardProps> = ({
  propertyName,
  occupancy,
  revenue,
  expenses,
  net,
}) => {
  return (
    <Card className="p-5 border bg-card space-y-4">
      <div className="flex justify-between items-start border-b pb-2">
        <div>
          <h4 className="font-extrabold text-sm uppercase">{propertyName}</h4>
          <span className="text-[9px] font-bold text-muted-foreground uppercase">Active Portfolio</span>
        </div>
        <span className="text-[10px] font-black bg-secondary px-2.5 py-0.5 rounded-full border">
          {occupancy} Occ
        </span>
      </div>

      <div className="space-y-2 text-xs font-semibold">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Monthly Revenue:</span>
          <span className="text-emerald-500 font-bold">${revenue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Monthly Expenses:</span>
          <span className="text-rose-500 font-bold">-${expenses.toLocaleString()}</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-dashed">
          <span className="font-bold">Net Operating Income:</span>
          <span className="text-emerald-500 font-extrabold">${net.toLocaleString()}</span>
        </div>
      </div>
    </Card>
  );
};

// --- DISTRIBUTION CARD ---
interface DistributionCardProps {
  distNumber: string;
  amount: number;
  date: string;
  status: string;
  method: string;
}

export const DistributionCard: React.FC<DistributionCardProps> = ({
  distNumber,
  amount,
  date,
  status,
  method,
}) => {
  return (
    <Card className="p-4 border bg-card flex justify-between items-center text-xs font-semibold">
      <div>
        <p className="font-bold">{distNumber}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{date} • {method}</p>
      </div>
      <div className="text-right">
        <p className="font-extrabold text-emerald-500 text-sm">${amount.toLocaleString()}</p>
        <StatusBadge status={status} />
      </div>
    </Card>
  );
};

// --- OWNER MESSAGE THREAD ---
interface MessageItem {
  id: string;
  sender: string;
  body: string;
  timestamp: string;
}

interface OwnerMessageThreadProps {
  messages: MessageItem[];
  onReply: (body: string) => void;
}

export const OwnerMessageThread: React.FC<OwnerMessageThreadProps> = ({ messages, onReply }) => {
  const { t } = useTranslation();
  const [replyText, setReplyText] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(replyText);
    setReplyText('');
  };

  return (
    <Card className="p-5 border bg-card flex flex-col h-[450px]">
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
        {messages.map((m) => {
          const isMe = m.sender.includes('Owner');
          return (
            <div key={m.id} className={clsx('flex flex-col text-xs', isMe ? 'items-end' : 'items-start')}>
              <span className="text-[9px] text-muted-foreground uppercase font-bold mb-1">{m.sender}</span>
              <div className={clsx(
                'max-w-[75%] p-3 rounded-xl font-semibold',
                isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-secondary/40 text-foreground rounded-tl-none border'
              )}>
                {m.body}
              </div>
              <span className="text-[8px] text-muted-foreground font-medium mt-1">{m.timestamp}</span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 pt-3 border-t flex gap-2">
        <input
          type="text"
          className="flex-1 text-xs p-2.5 rounded-lg border bg-card text-foreground"
          placeholder={t('owner.messages.typePlaceholder')}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
        <Button type="submit" size="sm" className="flex items-center gap-1">
          <Send className="w-3.5 h-3.5" /> {t('owner.messages.send')}
        </Button>
      </form>
    </Card>
  );
};
