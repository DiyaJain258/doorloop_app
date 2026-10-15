import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const BudgetsPage: React.FC = () => {
  // Queries
  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets-list'],
    queryFn: () => api.budgets.getAll(),
  });

  if (isLoading) {
    return <LoadingSkeleton type="card" />;
  }

  // Chart data
  const chartData = budgets.map((b) => ({
    name: b.category,
    Budget: b.amount,
    Actual: b.actualAmount,
  }));

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Operating Budgets"
        description="Verify property business operating maintenance budgets against actual expenditures."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Accounting', href: '/accounting' },
          { label: 'Budgets' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Budget vs Actual Chart */}
        <Card className="lg:col-span-2 p-6 border bg-card">
          <h3 className="font-extrabold text-sm uppercase mb-4 tracking-wider">Budget vs Actual Expenditures</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--foreground), 0.05)" />
                <XAxis dataKey="name" stroke="currentColor" fontSize={11} opacity={0.6} />
                <YAxis stroke="currentColor" fontSize={11} opacity={0.6} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
                <Legend />
                <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Variance stats */}
        <Card className="lg:col-span-1 p-6 border bg-card space-y-4">
          <h3 className="font-extrabold text-sm uppercase border-b pb-2 tracking-wider">Variance Calculations</h3>
          {budgets.map((b) => {
            const variance = b.amount - b.actualAmount;
            return (
              <div key={b.id} className="text-xs font-semibold space-y-1 bg-secondary/15 p-3.5 rounded-xl border border-border/40">
                <p className="font-bold text-sm">{b.propertyName}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{b.category}</p>
                <div className="flex justify-between mt-2 pt-2 border-t border-dashed">
                  <span className="text-muted-foreground">Variance:</span>
                  <span className={variance >= 0 ? 'text-emerald-500 font-extrabold' : 'text-rose-500 font-extrabold'}>
                    {variance >= 0 ? '+' : ''}${variance.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </Card>

      </div>
    </div>
  );
};
export default BudgetsPage;
