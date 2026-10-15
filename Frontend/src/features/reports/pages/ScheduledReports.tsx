import React from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { DataTable } from '../../../components/DataTable';
import { Button } from '../../../components/ui/Button';
import { Mail, Calendar, Pause, Play, Edit } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const ScheduledReports: React.FC = () => {
  const mockSchedules = [
    { id: 'sched-1', reportName: 'Monthly P&L Audit', frequency: 'Monthly', recipients: ['owner@investments.com'], format: 'PDF', nextRun: '2026-08-01', status: 'Active' },
    { id: 'sched-2', reportName: 'Weekly Outstanding Balances', frequency: 'Weekly', recipients: ['manager@property.com'], format: 'CSV', nextRun: '2026-07-26', status: 'Active' },
  ];

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'reportName', header: 'Scheduled Report', id: 'reportName' },
    { accessorKey: 'frequency', header: 'Frequency', id: 'frequency' },
    {
      accessorKey: 'recipients',
      header: 'Recipients',
      id: 'recipients',
      cell: ({ getValue }) => (getValue() as string[]).join(', '),
    },
    { accessorKey: 'format', header: 'Format', id: 'format' },
    { accessorKey: 'nextRun', header: 'Next Run', id: 'nextRun' },
    { accessorKey: 'status', header: 'Status', id: 'status' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="text-xs font-semibold flex items-center gap-1">
            <Pause className="w-3.5 h-3.5" /> Pause
          </Button>
          <Button variant="outline" size="sm" className="text-xs font-semibold flex items-center gap-1">
            <Edit className="w-3.5 h-3.5" /> Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduled Reports"
        description="Schedule reports for automated delivery to owners, accountants, or management emails."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports' }, { label: 'Scheduled' }]}
      />

      <div className="flex justify-end mb-4">
        <Button onClick={() => alert('New Schedule Dialog')} className="bg-primary text-primary-foreground font-semibold flex items-center gap-1">
          <Calendar className="w-4 h-4" /> Create Schedule
        </Button>
      </div>

      <DataTable columns={columns} data={mockSchedules} />
    </div>
  );
};
export default ScheduledReports;
