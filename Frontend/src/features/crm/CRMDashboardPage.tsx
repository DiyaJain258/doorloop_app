import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { 
  Users, Calendar, Clock, Percent, ArrowUpRight, 
  MapPin, Send, HelpCircle, Activity 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const CRMDashboardPage: React.FC = () => {
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['crm-metrics'],
    queryFn: () => api.crm.getMetrics(),
  });

  const { data: charts, isLoading: loadingCharts } = useQuery({
    queryKey: ['crm-charts'],
    queryFn: () => api.crm.getChartData(),
  });

  if (loadingMetrics || loadingCharts || !metrics || !charts) {
    return <LoadingSkeleton type="card" />;
  }

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="CRM & Pipeline Dashboard"
        description="Verify visitor conversion channels, tour appointments scheduling, and average response times."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'CRM' },
        ]}
      />

      {/* METRIC CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-5 border border-border bg-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">New Leads</p>
              <p className="text-2xl font-extrabold mt-1">{metrics.newLeads}</p>
            </div>
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-4">
            <ArrowUpRight className="w-3.5 h-3.5" /> +12% this week
          </span>
        </Card>

        <Card className="p-5 border border-border bg-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Tours Today</p>
              <p className="text-2xl font-extrabold mt-1">{metrics.toursToday}</p>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold mt-4">
            Next scheduled at 2:00 PM
          </span>
        </Card>

        <Card className="p-5 border border-border bg-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Pending screening</p>
              <p className="text-2xl font-extrabold mt-1">{metrics.pendingApplications}</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-4">
            <ArrowUpRight className="w-3.5 h-3.5" /> +4 files ready
          </span>
        </Card>

        <Card className="p-5 border border-border bg-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Lead Conversion</p>
              <p className="text-2xl font-extrabold mt-1">{metrics.conversionRate}%</p>
            </div>
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold mt-4">
            Target benchmark: 20%
          </span>
        </Card>

        <Card className="p-5 border border-border bg-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Avg Response Time</p>
              <p className="text-2xl font-extrabold mt-1">{metrics.avgResponseTime}h</p>
            </div>
            <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-emerald-500 font-bold mt-4">
            -1.2h improvement
          </span>
        </Card>
      </div>

      {/* GRAPH GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Funnel Pipeline */}
        <Card className="lg:col-span-2 p-6 border-border bg-card">
          <h3 className="font-bold text-sm uppercase mb-4 tracking-wide">CRM Pipeline Stage Counts</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.pipelineFunnel}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--foreground), 0.05)" />
                <XAxis dataKey="stage" stroke="currentColor" fontSize={11} opacity={0.6} />
                <YAxis stroke="currentColor" fontSize={11} opacity={0.6} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                  {charts.pipelineFunnel.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Lead Sources */}
        <Card className="lg:col-span-1 p-6 border-border bg-card flex flex-col justify-between">
          <h3 className="font-bold text-sm uppercase mb-4 tracking-wide">Acquisition Channels</h3>
          <div className="h-60 relative flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.leadSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.leadSources.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-muted-foreground pt-4 border-t border-border/40">
            {charts.leadSources.map((source: any, index: number) => (
              <div key={source.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate">{source.name} ({source.value}%)</span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
};
export default CRMDashboardPage;
