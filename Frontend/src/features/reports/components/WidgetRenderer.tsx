import React from 'react';
import { Card } from '../../../components/ui/Card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { DashboardWidget } from '../../../types';
import { Calendar as CalendarIcon, MapPin, BarChart3, AlertCircle } from 'lucide-react';

interface WidgetRendererProps {
  widget: DashboardWidget;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  // Generate some deterministic dummy data based on widget title or datasource
  const getMockData = () => {
    if (widget.type === 'PieChart') {
      return [
        { name: 'Category A', value: 400 },
        { name: 'Category B', value: 300 },
        { name: 'Category C', value: 200 },
        { name: 'Category D', value: 100 },
      ];
    }
    return [
      { name: 'Jan', value: 4000, secondary: 2400 },
      { name: 'Feb', value: 3000, secondary: 1398 },
      { name: 'Mar', value: 2000, secondary: 9800 },
      { name: 'Apr', value: 2780, secondary: 3908 },
      { name: 'May', value: 1890, secondary: 4800 },
      { name: 'Jun', value: 2390, secondary: 3800 },
    ];
  };

  const data = getMockData();

  const renderContent = () => {
    switch (widget.type) {
      case 'MetricCard':
        return (
          <div className="flex flex-col justify-center h-full py-4">
            <span className="text-sm font-medium text-muted-foreground uppercase">{widget.title}</span>
            <span className="text-3xl font-extrabold text-foreground mt-2">$24,500</span>
            <span className="text-xs text-emerald-500 font-bold mt-1">+12.3% vs last month</span>
          </div>
        );

      case 'LineChart':
        return (
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'BarChart':
        return (
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'PieChart':
        return (
          <div className="w-full h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'Table':
        return (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-semibold">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium text-foreground">
                <tr>
                  <td className="py-2">Rent Collected</td>
                  <td className="py-2 text-right text-emerald-600">$18,400</td>
                </tr>
                <tr>
                  <td className="py-2">Vendor Repairs</td>
                  <td className="py-2 text-right text-rose-600">-$2,100</td>
                </tr>
                <tr>
                  <td className="py-2">Marketing Ads</td>
                  <td className="py-2 text-right text-rose-600">-$850</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'Funnel':
        return (
          <div className="flex flex-col space-y-2 py-2">
            {[
              { label: 'Leads', val: 100, color: 'bg-indigo-500' },
              { label: 'Applications', val: 65, color: 'bg-purple-500' },
              { label: 'Signed Leases', val: 32, color: 'bg-emerald-500' },
            ].map((f) => (
              <div key={f.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>{f.label}</span>
                  <span>{f.val}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full ${f.color}`} style={{ width: `${f.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'Calendar':
        return (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground space-y-2">
            <CalendarIcon className="w-8 h-8 text-primary" />
            <span className="text-xs font-semibold">Calendar Widget Placeholder</span>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <span className="text-xs font-semibold">Unknown widget configuration</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      {widget.type !== 'MetricCard' && (
        <div className="border-b border-border pb-2 mb-3">
          <h4 className="font-bold text-sm tracking-tight text-foreground">{widget.title}</h4>
        </div>
      )}
      <div className="flex-1 flex items-center justify-center w-full">
        {renderContent()}
      </div>
    </div>
  );
};
export default WidgetRenderer;
