import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { PageHeader } from '../../components/PageHeader';
import {
  FileSpreadsheet,
  Percent,
  AlertTriangle,
  TrendingUp,
  Wrench,
  CreditCard,
  ArrowRight,
  Shield,
  Clock
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { t } = useTranslation();

  const reportsList = [
    {
      title: 'Rent Roll Report',
      desc: 'Detailed breakdown of active rents, security deposits, and unit vacancy status across properties.',
      path: '/reports/properties',
      icon: FileSpreadsheet,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50',
    },
    {
      title: 'Occupancy Report',
      desc: 'Understand units performance, vacancies, and visual occupancy ratios across all buildings.',
      path: '/reports/leasing',
      icon: Percent,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50',
    },
    {
      title: 'Delinquency Report',
      desc: 'Identifies overdue balances, late days, outstanding values, and tenant contacts info.',
      path: '/reports/tenants',
      icon: AlertTriangle,
      color: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50',
    },
    {
      title: 'Profit & Loss Statement',
      desc: 'Attributed general ledger financial statement detailing rental income, expenses, and net profit.',
      path: '/reports/financial',
      icon: TrendingUp,
      color: 'text-green-500 bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50',
    },
    {
      title: 'Maintenance Log Report',
      desc: 'Track maintenance requests, assigned vendors, technicians, completion rates, and actual costs.',
      path: '/reports/maintenance',
      icon: Wrench,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/50',
    },
    {
      title: 'Payment History Report',
      desc: 'Audit completed transactions, reference check numbers, payment methods, and statuses.',
      path: '/reports/saved',
      icon: CreditCard,
      color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900/50',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pmReports.title')}
        description="Run, audit, and export multi-tenant property reports."
        breadcrumbs={[
          { label: t('header.home'), href: '/' },
          { label: t('pmReports.title') },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportsList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.path as any}
              className="flex flex-col justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group text-left"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-6 group-hover:translate-x-1 transition-transform">
                Generate Report
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Export History audit section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Shield className="w-5 h-5 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Reporting Export & Audit Center</h4>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Large datasets exceeding local export limits are compiled in the background to ensure fast dashboard rendering. All export jobs are isolated by company access logs and stored securely for audit references.
        </p>
        <div className="flex gap-4">
          <Link
            to="/reports/exports"
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
          >
            <Clock className="w-4 h-4" /> View Export History Logs
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ReportsPage;
