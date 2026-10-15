import React from 'react';
import { Card } from './ui/Card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface FinancialSummaryCardProps {
  income: number;
  expenses: number;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({ income, expenses }) => {
  const net = income - expenses;
  const isProfit = net >= 0;

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="font-bold text-lg tracking-tight mb-4">Financial Summary</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Total Income</p>
          <div className="flex items-center text-emerald-500 font-extrabold text-xl">
            <DollarSign className="w-5 h-5" />
            {income.toLocaleString()}
          </div>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-1 font-semibold">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> Active rents
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Total Expenses</p>
          <div className="flex items-center text-rose-500 font-extrabold text-xl">
            <DollarSign className="w-5 h-5" />
            {expenses.toLocaleString()}
          </div>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-1 font-semibold">
            <TrendingDown className="w-3 h-3 text-rose-500" /> Invoices & bills
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Net Revenue</p>
          <div className={`flex items-center font-extrabold text-xl ${isProfit ? 'text-primary' : 'text-rose-500'}`}>
            <DollarSign className="w-5 h-5" />
            {net.toLocaleString()}
          </div>
          <span className={`text-[10px] flex items-center gap-0.5 mt-1 font-bold ${isProfit ? 'text-primary' : 'text-rose-500'}`}>
            {isProfit ? 'Operating Margin' : 'Loss'}
          </span>
        </div>
      </div>
    </Card>
  );
};
export default FinancialSummaryCard;
