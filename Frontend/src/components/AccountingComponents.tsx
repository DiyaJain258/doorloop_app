import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { StatusBadge } from './StatusBadge';
import { Trash2, Plus, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

// --- ACCOUNTING SUMMARY CARD ---
interface AccountingSummaryCardProps {
  title: string;
  value: number | string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  description?: string;
}

export const AccountingSummaryCard: React.FC<AccountingSummaryCardProps> = ({
  title,
  value,
  trend,
  trendType = 'neutral',
  description,
}) => {
  return (
    <Card className="p-5 border border-border bg-card text-foreground flex flex-col justify-between h-full">
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black mt-1.5">
          {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
        </p>
      </div>
      {(trend || description) && (
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
          {description && <span className="text-muted-foreground font-medium">{description}</span>}
        </div>
      )}
    </Card>
  );
};

// --- FINANCIAL CHART CARD ---
interface FinancialChartCardProps {
  title: string;
  children: React.ReactNode;
}

export const FinancialChartCard: React.FC<FinancialChartCardProps> = ({ title, children }) => {
  return (
    <Card className="p-6 border border-border bg-card">
      <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground mb-4">{title}</h3>
      <div className="h-72">{children}</div>
    </Card>
  );
};

// --- JOURNAL ENTRY EDITOR ---
interface JournalEntryLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
}

interface JournalEntryEditorProps {
  accounts: { id: string; accountName: string; accountNumber: string }[];
  onSave: (lines: JournalEntryLine[], description: string, date: string) => void;
  onCancel: () => void;
}

export const JournalEntryEditor: React.FC<JournalEntryEditorProps> = ({ accounts, onSave, onCancel }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<JournalEntryLine[]>([
    { accountId: '', accountName: '', debit: 0, credit: 0, memo: '' },
    { accountId: '', accountName: '', debit: 0, credit: 0, memo: '' },
  ]);

  const addLine = () => {
    setLines([...lines, { accountId: '', accountName: '', debit: 0, credit: 0, memo: '' }]);
  };

  const removeLine = (idx: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: keyof JournalEntryLine, val: any) => {
    const nextLines = [...lines];
    if (field === 'accountId') {
      const acc = accounts.find((a) => a.id === val);
      nextLines[idx].accountId = val;
      nextLines[idx].accountName = acc ? acc.accountName : '';
    } else if (field === 'debit') {
      nextLines[idx].debit = Number(val) || 0;
      if (Number(val) > 0) nextLines[idx].credit = 0; // standard double-entry
    } else if (field === 'credit') {
      nextLines[idx].credit = Number(val) || 0;
      if (Number(val) > 0) nextLines[idx].debit = 0;
    } else {
      nextLines[idx][field] = val;
    }
    setLines(nextLines);
  };

  const totalDebits = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredits = lines.reduce((sum, l) => sum + l.credit, 0);
  const diff = totalDebits - totalCredits;
  const balanced = totalDebits > 0 && totalCredits > 0 && Math.abs(diff) < 0.01;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanced || !description.trim()) return;
    onSave(lines, description, date);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-foreground bg-card border rounded-2xl p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase">Entry Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase">Entry Description</label>
          <Input placeholder="E.g., Fiscal adjusting entries" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Transaction Lines</h4>
          <Button type="button" variant="outline" size="sm" onClick={addLine} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Line
          </Button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center bg-secondary/10 p-3 rounded-lg border">
              <Select value={line.accountId} onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}>
                <option value="">Select Account...</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>({a.accountNumber}) {a.accountName}</option>
                ))}
              </Select>
              <Input type="number" step="0.01" placeholder="Debit ($)" value={line.debit || ''} onChange={(e) => handleLineChange(idx, 'debit', e.target.value)} />
              <Input type="number" step="0.01" placeholder="Credit ($)" value={line.credit || ''} onChange={(e) => handleLineChange(idx, 'credit', e.target.value)} />
              <div className="flex items-center space-x-2">
                <Input placeholder="Line memo..." value={line.memo} onChange={(e) => handleLineChange(idx, 'memo', e.target.value)} className="text-xs" />
                <Button type="button" variant="ghost" onClick={() => removeLine(idx)} className="text-rose-500 p-2 h-9 w-9 shrink-0">
                  <Trash2 className="w-4.5 h-4.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DOUBLE ENTRY VALIDATION DIALOG */}
      <div className="bg-secondary/15 border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between text-xs font-semibold">
        <div className="space-y-1">
          <p className="flex justify-between md:justify-start gap-4">
            <span className="text-muted-foreground">Total Debits:</span>
            <span className="text-primary font-bold">${totalDebits.toLocaleString()}</span>
          </p>
          <p className="flex justify-between md:justify-start gap-4">
            <span className="text-muted-foreground">Total Credits:</span>
            <span className="text-primary font-bold">${totalCredits.toLocaleString()}</span>
          </p>
        </div>

        <div className="mt-3 md:mt-0 flex items-center space-x-2">
          {balanced ? (
            <div className="flex items-center gap-1 text-emerald-500 uppercase font-black tracking-wider text-[10px]">
              <CheckCircle className="w-4 h-4" /> Balanced Journal
            </div>
          ) : (
            <div className="flex items-center gap-1 text-rose-500 uppercase font-black tracking-wider text-[10px]">
              <AlertCircle className="w-4 h-4" /> Out of Balance (${Math.abs(diff).toLocaleString()})
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!balanced || !description.trim()}>Post Journal Entry</Button>
      </div>
    </form>
  );
};

// --- BANK RECONCILIATION MATCHER ---
interface StmtItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
}

interface BankReconciliationViewProps {
  unreconciledItems: StmtItem[];
  onReconcile: (id: string) => void;
}

export const BankReconciliationView: React.FC<BankReconciliationViewProps> = ({ unreconciledItems, onReconcile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-foreground">
      
      {/* Left side: statement items */}
      <Card className="p-5 border bg-card space-y-4">
        <h3 className="font-extrabold text-sm uppercase text-muted-foreground border-b pb-2 tracking-wider">
          Statement Lines
        </h3>
        <div className="divide-y space-y-3 max-h-96 overflow-y-auto">
          {unreconciledItems.map((item) => (
            <div key={item.id} className="pt-3 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold">{item.description}</p>
                <p className="text-[10px] text-muted-foreground font-semibold">{item.date} • {item.type}</p>
              </div>
              <div className="text-right flex items-center space-x-3">
                <span className={clsx('font-black', item.amount > 0 ? 'text-emerald-500' : 'text-rose-500')}>
                  {item.amount > 0 ? '+' : ''}${item.amount.toLocaleString()}
                </span>
                <Button size="sm" variant="outline" onClick={() => onReconcile(item.id)} className="h-7 text-[10px] font-bold">
                  Match
                </Button>
              </div>
            </div>
          ))}
          {unreconciledItems.length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground">All statements reconciled!</div>
          )}
        </div>
      </Card>

      {/* Right side: system ledger items match logs */}
      <Card className="p-5 border bg-card space-y-4">
        <h3 className="font-extrabold text-sm uppercase text-muted-foreground border-b pb-2 tracking-wider">
          Matched System Reconcile Audit Logs
        </h3>
        <div className="space-y-3 text-xs font-semibold">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex justify-between">
            <span>Cleared Ledger Balance:</span>
            <span>$45,000.00</span>
          </div>
          <div className="p-3.5 bg-secondary/30 border text-foreground rounded-xl flex justify-between">
            <span>Difference:</span>
            <span>$0.00 (Perfect Match)</span>
          </div>
        </div>
      </Card>

    </div>
  );
};
