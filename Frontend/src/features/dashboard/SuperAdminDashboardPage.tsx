import React from 'react';
import { StatsCard } from '../../components/StatsCard';
import { ChartCard } from '../../components/ChartCard';
import { PageHeader } from '../../components/PageHeader';
import { 
  Building2, Users, CreditCard, BarChart3, Shield, Settings, Bot, RefreshCw, TrendingUp, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart as ReBarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { useTranslation } from 'react-i18next';
import api from '../../api';

export const SuperAdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = React.useState<any>(null);

  const fetchStats = React.useCallback(async () => {
    try {
      const data = await api.superadmin.getStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const metrics = {
    activeCompanies: stats?.activeCompanies || stats?.totalCompanies || 0,
    activeUsers: stats?.totalUsers || 0,
    monthlyRecurringRevenue: stats?.totalArr || 0,
    activeSubscriptions: stats?.activeSubscriptions || stats?.activeCompanies || 0,
    storageUsage: stats?.storageUsed || "0 GB",
  };

  const revenueData = [
    { name: 'Prev', revenue: Math.round((metrics.monthlyRecurringRevenue || 1000) * 0.8) },
    { name: 'Current', revenue: metrics.monthlyRecurringRevenue || 0 },
  ];

  const growthData = [
    { name: 'Active DB State', companies: metrics.activeCompanies, users: metrics.activeUsers },
  ];

  const planDistribution = [
    { name: t('superAdmin.basicPlan'), value: Math.max(1, metrics.activeCompanies) },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('superAdmin.title')}
        description={t('superAdmin.desc')}
        breadcrumbs={[
          { label: t('superAdmin.platformHome'), href: '/' },
          { label: t('superAdmin.saasDashboard') }
        ]}
        action={{
          label: t('superAdmin.syncMetrics'),
          onClick: () => {},
          icon: <RefreshCw className="w-4 h-4" />,
          variant: 'outline'
        }}
      />

      {/* --- SaaS STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('superAdmin.activeCompanies')}
          value={metrics.activeCompanies}
          icon={<Building2 className="w-5 h-5" />}
          trend="up"
          trendLabel="+12 new"
          description={t('superAdmin.thisMonth')}
        />
        <StatsCard
          title={t('superAdmin.activeUsers')}
          value={metrics.activeUsers.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          trend="up"
          trendLabel="+142 new"
          description={t('superAdmin.weeklySignups')}
        />
        <StatsCard
          title={t('superAdmin.mrrRevenue')}
          value={`$${metrics.monthlyRecurringRevenue.toLocaleString()}`}
          icon={<CreditCard className="w-5 h-5" />}
          trend="up"
          trendLabel="+8.4%"
          description={t('superAdmin.mmGrowth')}
        />
        <StatsCard
          title={t('superAdmin.activeSubscriptions')}
          value={metrics.activeSubscriptions}
          icon={<BarChart3 className="w-5 h-5" />}
          trend="up"
          trendLabel="98.5%"
          description={t('superAdmin.retentionRate')}
        />
      </div>

      {/* --- SaaS CHARTS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title={t('superAdmin.mrrGrowthTitle')}>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis dataKey="name" stroke="currentColor" className="text-[10px] text-muted-foreground" />
                  <YAxis stroke="currentColor" className="text-[10px] text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))', 
                      borderRadius: '8px', 
                      fontSize: '12px' 
                    }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#mrrGradient)" name="Monthly Revenue ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <ChartCard title={t('superAdmin.planDistributionTitle')}>
          <div className="h-80 w-full flex flex-col justify-between">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))', 
                      borderRadius: '8px', 
                      fontSize: '12px' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 pb-2">
              {planDistribution.map((plan, index) => (
                <div key={plan.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-xs font-semibold text-muted-foreground">{plan.name} ({plan.value})</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* --- PLATFORM USERS AND GROWTH CHART --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <ChartCard title={t('superAdmin.userGrowthTitle')}>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis dataKey="name" stroke="currentColor" className="text-[10px] text-muted-foreground" />
                  <YAxis yAxisId="left" stroke="#3b82f6" className="text-[10px]" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" className="text-[10px]" />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))', 
                      borderRadius: '8px', 
                      fontSize: '12px' 
                    }} 
                  />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Bar yAxisId="left" dataKey="companies" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t('superAdmin.activeCompaniesLegend')} />
                <Bar yAxisId="right" dataKey="users" fill="#10b981" radius={[4, 4, 0, 0]} name={t('superAdmin.totalRegisteredUsers')} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  </div>
  );
};
