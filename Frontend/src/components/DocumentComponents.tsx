import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { clsx } from 'clsx';
import { FileText, FileImage, File, FileSpreadsheet, Shield, Download, Eye, Archive } from 'lucide-react';

// --- FILE TYPE ICON ---
export const FileTypeIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const base = 'w-5 h-5';
  const cls = clsx(base, className);
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <FileImage className={clsx(cls, 'text-pink-500')} />;
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className={clsx(cls, 'text-emerald-500')} />;
  if (['pdf'].includes(ext || '')) return <FileText className={clsx(cls, 'text-rose-500')} />;
  return <File className={clsx(cls, 'text-indigo-500')} />;
};

// --- SIGNATURE STATUS BADGE ---
const sigColors: Record<string, string> = {
  Draft: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  Sent: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Viewed: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  Signed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Declined: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  Expired: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};
export const SignatureStatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={clsx('text-[9px] font-black uppercase px-2 py-0.5 rounded border', sigColors[status] || sigColors.Draft)}>
    {status}
  </span>
);

// --- DOCUMENT CARD (Grid View) ---
interface DocumentCardProps {
  id: string;
  name: string;
  category: string;
  size: string;
  status: string;
  updatedAt: string;
  owner: string;
  onDownload?: () => void;
  onPreview?: () => void;
  onArchive?: () => void;
}
export const DocumentCard: React.FC<DocumentCardProps> = ({ name, category, size, status, updatedAt, owner, onDownload, onPreview, onArchive }) => (
  <Card className="p-4 border bg-card space-y-3 text-xs font-semibold hover:border-primary/40 transition group">
    <div className="flex items-start gap-3">
      <div className="p-2.5 rounded-xl bg-secondary/30 shrink-0">
        <FileTypeIcon name={name} className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate" title={name}>{name}</p>
        <p className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">{category} • {size}</p>
      </div>
    </div>
    <div className="flex justify-between items-center border-t pt-2">
      <div>
        <p className="text-[9px] text-muted-foreground">{owner}</p>
        <p className="text-[9px] text-muted-foreground">{updatedAt}</p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
        {onPreview && <Button variant="ghost" size="icon" onClick={onPreview} title="Preview"><Eye className="w-3.5 h-3.5" /></Button>}
        {onDownload && <Button variant="ghost" size="icon" onClick={onDownload} title="Download"><Download className="w-3.5 h-3.5" /></Button>}
        {onArchive && <Button variant="ghost" size="icon" onClick={onArchive} title="Archive"><Archive className="w-3.5 h-3.5" /></Button>}
      </div>
    </div>
  </Card>
);

// --- FOLDER TREE NODE ---
interface FolderNode {
  id: string;
  name: string;
  documentCount: number;
  children?: FolderNode[];
}
export const FolderTree: React.FC<{ folders: FolderNode[]; onSelect?: (id: string) => void; selectedId?: string }> = ({ folders, onSelect, selectedId }) => (
  <div className="space-y-1 text-xs font-semibold">
    {folders.map((folder) => (
      <button
        key={folder.id}
        onClick={() => onSelect?.(folder.id)}
        className={clsx(
          'w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg border transition',
          selectedId === folder.id
            ? 'bg-primary/10 border-primary text-primary'
            : 'bg-secondary/15 border-border/30 hover:bg-secondary/35'
        )}
      >
        <FileText className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 truncate">{folder.name}</span>
        <span className="text-[9px] text-muted-foreground font-bold">{folder.documentCount}</span>
      </button>
    ))}
  </div>
);

// --- STORAGE USAGE CARD ---
export const StorageUsageCard: React.FC<{ used: string; total?: string; percentage?: number }> = ({
  used, total = '100 GB', percentage = 43
}) => (
  <Card className="p-5 border bg-card space-y-3">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase">Storage Used</p>
        <p className="text-xl font-black text-foreground mt-0.5">{used}</p>
      </div>
      <Shield className="w-8 h-8 text-primary/40" />
    </div>
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
        <span>{used} used</span><span>{total} total</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  </Card>
);

// --- AUDIT TIMELINE ---
interface AuditEntry { id: string; action: string; performedBy: string; documentName: string; timestamp: string; }
export const AuditTimeline: React.FC<{ entries: AuditEntry[] }> = ({ entries }) => (
  <div className="space-y-3 text-xs font-semibold">
    {entries.map((e) => (
      <div key={e.id} className="flex gap-3 items-start border-b pb-3 border-dashed border-border/40">
        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
        <div className="flex-1">
          <p className="font-bold">{e.action} — <span className="font-normal text-muted-foreground">{e.documentName}</span></p>
          <p className="text-[9px] text-muted-foreground mt-0.5">{e.timestamp} • By {e.performedBy}</p>
        </div>
      </div>
    ))}
  </div>
);

// --- SIGNATURE TIMELINE ---
interface SigStep { label: string; done: boolean; active: boolean; }
export const SignatureTimeline: React.FC<{ steps: SigStep[] }> = ({ steps }) => (
  <div className="flex items-center gap-1 text-xs font-bold">
    {steps.map((step, idx) => (
      <React.Fragment key={idx}>
        <div className={clsx(
          'px-3 py-1.5 rounded-full border text-[9px] uppercase font-black transition',
          step.done && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
          step.active && !step.done && 'bg-primary/10 border-primary/30 text-primary',
          !step.done && !step.active && 'bg-secondary/10 border-border/30 text-muted-foreground'
        )}>
          {step.label}
        </div>
        {idx < steps.length - 1 && <div className="flex-1 h-px bg-border/40" />}
      </React.Fragment>
    ))}
  </div>
);
