import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Printer, Download } from 'lucide-react';

export const FinancialReportsPage: React.FC = () => {
  // Queries
  const { data: report, isLoading } = useQuery({
    queryKey: ['financial-reports-pnl'],
    queryFn: () => api.financialReports.getPnL(),
  });

  if (isLoading || !report) {
    return <LoadingSkeleton type="card" />;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Financial Reports"
        description="Verify Trial Balances, Balance Sheets, Profit & Loss summaries, and property profitability statistics."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Accounting', href: '/accounting' },
          { label: 'Reports' },
        ]}
      />

      {/* QUICK EXPORT BAR */}
      <div className="flex justify-end space-x-2 border-b pb-3">
        <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1 text-xs">
          <Printer className="w-4 h-4" /> Print PDF Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profit and Loss breakdown */}
        <Card className="md:col-span-2 p-6 border bg-card space-y-6">
          <div className="border-b pb-4 text-center">
            <h3 className="text-lg font-black uppercase tracking-wider">Profit & Loss Statement</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Period Ending: July 2026</p>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            
            <div className="space-y-2">
              <h4 className="font-extrabold uppercase text-muted-foreground text-[10px]">Operating Revenues</h4>
              <div className="divide-y border rounded-xl overflow-hidden bg-secondary/10">
                {report.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-3.5">
                    <span>{item.category}</span>
                    <span className="text-emerald-500 font-extrabold">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between border-t pt-4 text-sm font-black uppercase text-muted-foreground">
              <span>Gross Income:</span>
              <span className="text-emerald-500">${report.totalIncome.toLocaleString()}</span>
            </div>

            <div className="flex justify-between border-t pt-2 text-sm font-black uppercase text-muted-foreground">
              <span>Operating Expenditures:</span>
              <span className="text-rose-500">-${report.totalExpenses.toLocaleString()}</span>
            </div>

            <div className="flex justify-between border-t border-dashed pt-4 text-base font-black uppercase">
              <span>Net Profit payout:</span>
              <span className="text-emerald-500 text-lg">${report.netProfit.toLocaleString()}</span>
            </div>

          </div>
        </Card>

        {/* Summary side widget */}
        <Card className="md:col-span-1 p-6 border bg-card flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm uppercase border-b pb-2 tracking-wider">Quick Metrics</h3>
            <div className="space-y-2 text-xs font-semibold">
              <div className="p-3 bg-secondary/15 rounded-xl border border-border/40 flex justify-between">
                <span className="text-muted-foreground">Operating Ratio:</span>
                <span>28.3%</span>
              </div>
              <div className="p-3 bg-secondary/15 rounded-xl border border-border/40 flex justify-between">
                <span className="text-muted-foreground">EBITDA:</span>
                <span>${report.netProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
export default FinancialReportsPage;
