import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api';
import { PageHeader } from '../../../components/PageHeader';
import { FilterBuilder } from '../components/FilterBuilder';
import { AnalyticsCard } from '../components/AnalyticsCard';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Building2, Landmark, Percent, Key, Wrench, ShieldAlert } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const ExecutiveDashboard: React.FC = () => {
  const [filters, setFilters] = useState({
    propertyId: 'all',
    dateRange: 'all',
    status: 'all',
    searchQuery: '',
  });

  const { data: kpis = [], isLoading: loadingKpi } = useQuery({
    queryKey: ['exec-kpis', filters],
    queryFn: () => api.analytics.getExecutiveKpis(),
  });

  const { data: revData, isLoading: loadingRev } = useQuery({
    queryKey: ['exec-rev'],
    queryFn: () => api.charts.getRevenuePerformance(),
  });

  const { data: occData, isLoading: loadingOcc } = useQuery({
    queryKey: ['exec-occ'],
    queryFn: () => api.charts.getOccupancyAnalytics(),
  });

  const { data: finData, isLoading: loadingFin } = useQuery({
    queryKey: ['exec-fin'],
    queryFn: () => api.charts.getFinancialPerformance(),
  });

  const { data: maintData, isLoading: loadingMaint } = useQuery({
    queryKey: ['exec-maint'],
    queryFn: () => api.charts.getMaintenancePerformance(),
  });

  const { data: leaseData, isLoading: loadingLease } = useQuery({
    queryKey: ['exec-lease'],
    queryFn: () => api.charts.getLeasingPerformance(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Dashboard"
        description="Comprehensive high-level performance metrics, financials, and portfolio occupancy analysis."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports' }, { label: 'Executive' }]}
      />

      <FilterBuilder onFilterChange={setFilters} />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <AnalyticsCard
            key={kpi.id}
            title={kpi.label}
            value={kpi.formatted}
            change={kpi.change}
            trend={kpi.trend as 'up' | 'down' | 'flat'}
            loading={loadingKpi}
          />
        ))}
      </div>

      {/* Executive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Revenue Performance */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-base mb-4 text-foreground">Revenue Performance & Forecast</h3>
          <div className="h-[280px]">
            {loadingRev ? (
              <div className="h-full flex items-center justify-center">Loading Chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revData?.monthlyGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" name="Monthly Growth" dataKey="value" stroke="#6366f1" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Occupancy Trend */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-base mb-4 text-foreground">Occupancy vs Vacancy Trend</h3>
          <div className="h-[280px]">
            {loadingOcc ? (
              <div className="h-full flex items-center justify-center">Loading Chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occData?.occupancyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" name="Occupancy %" dataKey="value" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Income vs Expenses */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-base mb-4 text-foreground">Income vs Expenses</h3>
          <div className="h-[280px]">
            {loadingFin ? (
              <div className="h-full flex items-center justify-center">Loading Chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finData?.incomeVsExpenses || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Bar name="Income" dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar name="Expenses" dataKey="secondary" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Maintenance Cost by Category */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-base mb-4 text-foreground">Maintenance Cost Trend</h3>
          <div className="h-[280px]">
            {loadingMaint ? (
              <div className="h-full flex items-center justify-center">Loading Chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintData?.maintenanceCost || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Bar name="Cost ($)" dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Leasing Conversion Funnel */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="font-bold text-base mb-4 text-foreground">Leasing Applications Trend</h3>
          <div className="h-[280px]">
            {loadingLease ? (
              <div className="h-full flex items-center justify-center">Loading Chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leaseData?.applications || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" name="New Applications" dataKey="value" stroke="#8b5cf6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ExecutiveDashboard;
