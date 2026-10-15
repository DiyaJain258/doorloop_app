import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Printer, Download } from 'lucide-react';

export const MaintenanceReportsPage: React.FC = () => {
  // Queries
  const { data: workOrders = [], isLoading } = useQuery({ queryKey: ['work-orders-list'], queryFn: () => api.workOrders.getAll() });

  if (isLoading) {
    return <LoadingSkeleton type="card" />;
  }

  // Calculate costs by category mock/calculation
  const reportData = [
    { category: 'Plumbing', Cost: 12500, CompletionTime: 2.1 },
    { category: 'Electrical', Cost: 18400, CompletionTime: 3.4 },
    { category: 'HVAC', Cost: 34500, CompletionTime: 4.8 },
    { category: 'Landscaping', Cost: 8000, CompletionTime: 1.5 },
    { category: 'Roofing', Cost: 42000, CompletionTime: 5.6 },
  ];

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Maintenance Reports & Audits"
        description="Verify service ticket categories, vendor invoice sums, and preventive schedules compliance."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Maintenance', href: '/maintenance' },
          { label: 'Reports' },
        ]}
      />

      {/* QUICK ACTIONS */}
      <div className="flex justify-end space-x-2 border-b pb-3">
        <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold">
          <Printer className="w-4 h-4" /> Print Reports
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cost by Category */}
        <Card className="p-6 border bg-card">
          <h3 className="font-extrabold text-sm uppercase mb-4 tracking-wider">Costs by Trade Specialty Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--foreground), 0.05)" />
                <XAxis dataKey="category" stroke="currentColor" fontSize={11} opacity={0.6} />
                <YAxis stroke="currentColor" fontSize={11} opacity={0.6} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Completion Time by Category */}
        <Card className="p-6 border bg-card">
          <h3 className="font-extrabold text-sm uppercase mb-4 tracking-wider">Average Completion Time (Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--foreground), 0.05)" />
                <XAxis dataKey="category" stroke="currentColor" fontSize={11} opacity={0.6} />
                <YAxis stroke="currentColor" fontSize={11} opacity={0.6} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
                <Line type="monotone" dataKey="CompletionTime" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
};
export default MaintenanceReportsPage;
