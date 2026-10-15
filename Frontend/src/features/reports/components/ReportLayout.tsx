import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../components/PageHeader';
import { ChevronLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface ReportLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const ReportLayout: React.FC<ReportLayoutProps> = ({ title, description, children }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/reports" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <PageHeader
          title={title}
          description={description}
          breadcrumbs={[
            { label: t('header.home'), href: '/' },
            { label: t('pmReports.title'), href: '/reports' },
            { label: title },
          ]}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        {children}
      </div>
    </div>
  );
};
export default ReportLayout;
