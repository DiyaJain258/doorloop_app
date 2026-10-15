import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { DocumentUploader } from '../../components/DocumentUploader';
import { CommunicationPanel } from '../../components/CommunicationPanel';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { ColumnDef } from '@tanstack/react-table';
import { 
  ArrowLeft, Calendar, DollarSign, Key, Landmark, 
  Printer, Download, ShieldCheck, AlertTriangle, Loader2 
} from 'lucide-react';

export const LeaseDetailsPage: React.FC = () => {
  const { id } = useParams({ from: '/leases/$id' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState('');

  // Queries
  const { data: lease, isLoading } = useQuery({
    queryKey: ['lease', id],
    queryFn: async () => {
      const all = await api.leasing.getLeases();
      return all.find((l) => l.id === id);
    },
  });

  const { data: allPayments = [] } = useQuery({ queryKey: ['payments'], queryFn: () => api.rent.getAll() });
  const { data: allDocs = [] } = useQuery({ queryKey: ['documents'], queryFn: () => api.document.getAll() });

  const payments = allPayments.filter((p) => p.unitId === lease?.unitId);
  const docs = allDocs.filter((d) => d.propertyId === lease?.propertyId).map((d) => ({
    id: d.id,
    name: d.name,
    size: '220 KB',
    uploadedAt: d.uploadedAt || '2026-07-02',
    uploadedBy: 'Manager',
  }));

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      api.document.create({
        name: file.name,
        type: 'Lease',
        propertyId: lease?.propertyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  if (isLoading || !lease) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleRenew = () => {
    setMsg('Lease renewal checklist triggered. Sent renewal notification to resident.');
    setTimeout(() => setMsg(''), 4000);
  };

  const payColumns: ColumnDef<any>[] = [
    { 
      accessorKey: 'dueDate', 
      header: 'Due Date', 
      id: 'dueDate',
      cell: ({ row }) => <span>{row.original.dueDate ? row.original.dueDate.split('T')[0] : 'N/A'}</span>
    },
    { accessorKey: 'amount', header: 'Amount', id: 'amount', cell: ({ row }) => <span>${row.original.amount.toLocaleString()}</span> },
    { accessorKey: 'status', header: 'Status', id: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/leasing/leases' })}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-sm font-semibold text-muted-foreground">Back to Leases</span>
      </div>

      {msg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-semibold mb-6 animate-fade-in">
          {msg}
        </div>
      )}

      {/* HEADER BLOCK */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 pb-6 border-b">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Lease Contract</h1>
            <StatusBadge status={lease.status} />
          </div>
          <p className="text-sm text-muted-foreground font-semibold flex items-center gap-1">
            <Key className="w-4 h-4 text-primary" />
            Resident: {lease.tenantName} • Unit {lease.unitNumber} ({lease.propertyName})
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1">
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button size="sm" onClick={handleRenew} className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Renew Lease
          </Button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 flex items-center space-x-3 border-border">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Rent Amount</p>
            <p className="text-xl font-extrabold">${lease.rentAmount.toLocaleString()}/mo</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3 border-border">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Security Deposit</p>
            <p className="text-xl font-extrabold">${lease.depositAmount.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3 border-border">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Start Date</p>
            <p className="text-sm font-extrabold">{lease.startDate ? lease.startDate.split('T')[0] : 'N/A'}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3 border-border">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Expiration Date</p>
            <p className="text-sm font-extrabold">{lease.endDate ? lease.endDate.split('T')[0] : 'N/A'}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3 border-border">
          <div className="p-3 bg-secondary/80 text-muted-foreground rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Contract Term</p>
            <p className="text-sm font-extrabold">12 Months</p>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial Ledger</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communication">CRM Dialog</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="p-5 space-y-4 border-border">
            <h3 className="font-bold text-base border-b pb-2 uppercase tracking-wide">Lease Contract Metadata</h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <p className="text-muted-foreground">Property Asset</p>
                <p className="text-foreground mt-0.5">{lease.propertyName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Unit Number</p>
                <p className="text-foreground mt-0.5">Unit {lease.unitNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Resident Account</p>
                <p className="text-foreground mt-0.5">{lease.tenantName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status Badge</p>
                <p className="text-foreground mt-0.5">{lease.status}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* FINANCIAL */}
        <TabsContent value="financial" className="space-y-4">
          <DataTable columns={payColumns} data={payments} />
        </TabsContent>

        {/* DOCUMENTS */}
        <TabsContent value="documents">
          <DocumentUploader
            documents={docs}
            onUpload={(file) => uploadMutation.mutate(file)}
            title="Attached Contracts & Riders"
          />
        </TabsContent>

        {/* CRM DIALOG */}
        <TabsContent value="communication">
          <CommunicationPanel
            entityName={lease.tenantName}
            initialLogs={[
              { id: '1', type: 'Email', message: 'Lease contract pdf copy dispatched via email.', recipientOrAuthor: 'To: Resident', timestamp: '5 days ago' },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default LeaseDetailsPage;
