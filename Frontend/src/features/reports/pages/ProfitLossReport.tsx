import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../services/reportApi';
import { ReportLayout } from '../components/ReportLayout';
import { ReportFilters } from '../components/ReportFilters';
import { ExportActions } from '../components/ExportActions';
import { useReportFilters } from '../hooks/useReportFilters';
import { useReportExport } from '../hooks/useReportExport';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export const ProfitLossReport: React.FC = () => {
  const { filters, setFilterVal, resetFilters } = useReportFilters();
  const { isExporting, handleExport } = useReportExport();

  // Query P&L data
  const { data, isLoading } = useQuery({
    queryKey: ['report-profit-loss', filters],
    queryFn: () => reportApi.getProfitLoss(filters),
  });

  const pl = data?.data || { income: [], expenses: [], summary: { totalIncome: 0, totalExpenses: 0, netProfit: 0 } };

  if (isLoading) {
    return (
      <ReportLayout title="Profit & Loss Statement" description="Revenues and expenses summary.">
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Calculating statement...</p>
        </div>
      </ReportLayout>
    );
  }

  return (
    <ReportLayout
      title="Profit & Loss Statement"
      description="Attributed general ledger statement showing operating profits and overhead expenses."
    >
      <ExportActions
        onExport={(fileType) =>
          handleExport({
            reportType: 'PROFIT_LOSS',
            filters,
            data: [...pl.income, ...pl.expenses],
            totalRecords: pl.income.length + pl.expenses.length,
            fileType,
          })
        }
        isExporting={isExporting}
      />

      <ReportFilters filters={filters} onChange={setFilterVal} onReset={resetFilters} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="p-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">Total Income</span>
            <h3 className="text-2xl font-black text-green-900 dark:text-green-300 mt-1">
              ${pl.summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl text-green-700 dark:text-green-300">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Expenses Card */}
        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">Total Expenses</span>
            <h3 className="text-2xl font-black text-red-900 dark:text-red-300 mt-1">
              ${pl.summary.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl text-red-700 dark:text-red-300">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Net Profit Card */}
        <div className={`p-6 border rounded-2xl flex items-center justify-between ${
          pl.summary.netProfit >= 0
            ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300'
            : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300'
        }`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-wide">Net Profit</span>
            <h3 className="text-2xl font-black mt-1">
              ${pl.summary.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Ledger Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Income Category List */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2">
            Revenues
          </h4>
          {pl.income.length === 0 ? (
            <p className="text-xs text-slate-400">No revenue records found.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              {pl.income.map((item, idx) => (
                <div key={idx} className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">{item.name}</span>
                  <span className="font-bold text-green-600">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense Category List */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2">
            Operating Expenses
          </h4>
          {pl.expenses.length === 0 ? (
            <p className="text-xs text-slate-400">No expense records found.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              {pl.expenses.map((item, idx) => (
                <div key={idx} className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">{item.name}</span>
                  <span className="font-bold text-red-500">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ReportLayout>
  );
};
export default ProfitLossReport;
