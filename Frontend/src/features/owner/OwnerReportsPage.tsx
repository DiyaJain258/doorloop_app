import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Printer } from 'lucide-react';

export const OwnerReportsPage: React.FC = () => {
  const { t } = useTranslation();
  // Queries
  const { data: reports = null, isLoading } = useQuery({ queryKey: ['owner-reports-summary'], queryFn: () => api.ownerReports.getAll() });

  if (isLoading || !reports) {
    return <LoadingSkeleton type="card" />;
  }

  const reportsList = [
    { title: t('owner.reports.incomeSummary.title'), desc: t('owner.reports.incomeSummary.desc') },
    { title: t('owner.reports.expenseSummary.title'), desc: t('owner.reports.expenseSummary.desc') },
    { title: t('owner.reports.propertyPerformance.title'), desc: t('owner.reports.propertyPerformance.desc') },
    { title: t('owner.reports.distributionReport.title'), desc: t('owner.reports.distributionReport.desc') },
  ];

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title={t('owner.reports.title')}
        description={t('owner.reports.desc')}
        breadcrumbs={[
          { label: t('header.home'), href: '/owner' },
          { label: t('owner.nav.reports') },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Reports Directory */}
        <Card className="p-6 border bg-card space-y-4">
          <h3 className="font-extrabold text-sm uppercase border-b pb-2 tracking-wider">{t('owner.reports.availableReports')}</h3>
          <div className="divide-y space-y-3 text-xs font-semibold">
            {reportsList.map((r, idx) => (
              <div key={idx} className="pt-3 flex justify-between items-center">
                <div>
                  <p className="font-bold">{r.title}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{r.desc}</p>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => window.print()} title={t('owner.reports.printReport')}>
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick summary sheet */}
        <Card className="p-6 border bg-card space-y-4">
          <h3 className="font-extrabold text-sm uppercase border-b pb-2 tracking-wider">{t('owner.reports.annualSummary')}</h3>
          <div className="space-y-3.5 text-xs font-semibold">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">{t('owner.reports.operatingIncome')}</span>
              <span className="text-emerald-500 font-bold">${(reports.revenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2 text-rose-500">
              <span>{t('owner.reports.operatingExpenses')}</span>
              <span>-${(reports.expenses || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">{t('owner.reports.portfolioOccupancy')}</span>
              <span>{reports.occupancy || 95}%</span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-black uppercase">
              <span>{t('owner.reports.totalPayouts')}</span>
              <span className="text-emerald-500">${(reports.distribution || 0).toLocaleString()}</span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
export default OwnerReportsPage;
