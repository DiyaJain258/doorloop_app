import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api';
import { PageHeader } from '../../../components/PageHeader';
import { AdminCard } from '../components/AdminCard';
import { Card } from '../../../components/ui/Card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Users, Building, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

const MOCK_GROWTH_DATA = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 650 },
  { name: 'Mar', value: 980 },
  { name: 'Apr', value: 1250 },
  { name: 'May', value: 1600 },
  { name: 'Jun', value: 2400 },
];

export const AdminDashboard: React.FC = () => {
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: () => api.users.getAll(),
  });

  const { data: companies = [], isLoading: loadingComps } = useQuery({
    queryKey: ['admin-companies-stats'],
    queryFn: () => api.companies.getAll(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Monitor system audits, resource allocations, multi-company catalogs, and security protocols."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }, { label: 'Dashboard' }]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <AdminCard title="Total Users" value={users.length} loading={loadingUsers} icon={<Users className="w-5 h-5" />} />
        <AdminCard title="Active Companies" value={companies.length} loading={loadingComps} icon={<Building className="w-5 h-5" />} />
        <AdminCard title="Security Incidents" value="0" icon={<ShieldAlert className="w-5 h-5" />} />
        <AdminCard title="System Performance" value="99.9%" icon={<Cpu className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-card border border-border p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-sm text-foreground mb-4 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" /> User Growth Trend
          </h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_GROWTH_DATA}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                <YAxis fontSize={10} stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fill="url(#growthGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Pane: System Alerts & Notifications */}
        <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm h-fit">
          <h3 className="font-bold text-sm text-foreground border-b border-border pb-2">
            System Alerts
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-bold">
              All integration pipelines online and running.
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-700 rounded-xl text-xs font-bold">
              Database backups completed successfully (5 hours ago).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
