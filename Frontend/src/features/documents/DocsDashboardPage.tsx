import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { FileText, Clock, Share2, Archive, AlertTriangle, Upload, FolderPlus, PenLine } from 'lucide-react';

export const DocsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['docs-dashboard-metrics'],
    queryFn: () => api.documents.getMetrics(),
  });

  if (isLoading || !metrics) return <LoadingSkeleton type="card" />;

  const stats = [
    { label: 'Total Documents', value: metrics.totalDocuments.toLocaleString(), icon: <FileText className="w-5 h-5 text-indigo-500" />, sub: `${metrics.recentUploads} uploaded this week` },
    { label: 'Pending Signatures', value: metrics.pendingSignatures.toLocaleString(), icon: <PenLine className="w-5 h-5 text-amber-500" />, sub: 'Awaiting recipient action' },
    { label: 'Expiring Soon', value: metrics.expiringDocuments.toLocaleString(), icon: <AlertTriangle className="w-5 h-5 text-rose-500" />, sub: 'Within next 30 days' },
    { label: 'Shared Documents', value: metrics.sharedDocuments.toLocaleString(), icon: <Share2 className="w-5 h-5 text-emerald-500" />, sub: 'Active share links' },
    { label: 'Archived', value: metrics.archivedDocuments.toLocaleString(), icon: <Archive className="w-5 h-5 text-slate-500" />, sub: 'Archived documents' },
    { label: 'Recent Downloads', value: metrics.recentDownloads.toLocaleString(), icon: <Clock className="w-5 h-5 text-purple-500" />, sub: 'Downloads this week' },
  ];

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Document Management Dashboard"
        description="Overview of signature requests, expiring documents, recently shared files, and active templates."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Documents' }]}
      />



      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5 border bg-card flex items-start gap-4">
            <div className="p-3 rounded-xl bg-secondary/20 shrink-0">{stat.icon}</div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</p>
              <p className="text-2xl font-black mt-0.5 text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold mt-1">{stat.sub}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default DocsDashboardPage;
