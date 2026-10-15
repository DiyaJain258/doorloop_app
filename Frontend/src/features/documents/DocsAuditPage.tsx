import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/FilterBar';
import { AuditTimeline } from '../../components/DocumentComponents';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

export const DocsAuditPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: audit = [], isLoading } = useQuery({ queryKey: ['docs-audit'], queryFn: () => api.documentAudit.getAll() });

  const filtered = audit.filter(a =>
    a.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <LoadingSkeleton type="card" />;

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Document Audit Log Timeline"
        description="Track every document operation — uploads, downloads, signature dispatches, and permission changes."
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: 'Audit Log' }]}
      />
      <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search by document, user, or action..." onReset={() => setSearchQuery('')} />
      <Card className="p-6 border bg-card">
        <h3 className="font-extrabold text-xs uppercase tracking-wider border-b pb-3 mb-4 text-muted-foreground">
          Showing {filtered.length.toLocaleString()} audit events
        </h3>
        <AuditTimeline entries={filtered.slice(0, 50).map(a => ({
          id: a.id,
          action: a.action,
          performedBy: a.performedBy,
          documentName: a.documentName,
          timestamp: a.timestamp,
        }))} />
      </Card>
    </div>
  );
};
export default DocsAuditPage;
