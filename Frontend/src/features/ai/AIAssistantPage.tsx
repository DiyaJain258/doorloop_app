import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { AIChatWindow } from './components/AIChatWindow';
import { useTranslation } from 'react-i18next';

export const AIAssistantPage: React.FC = () => {
  const { t } = useTranslation();

  const suggested = [
    t('ai.suggested.overdueRent'),
    t('ai.suggested.leasesExpire'),
    t('ai.suggested.vacantUnits'),
    t('ai.suggested.maintenanceReqs'),
    t('ai.suggested.rentRoll'),
    t('ai.suggested.unpaidInvoices'),
    t('ai.suggested.ownerStatements'),
    t('ai.suggested.financialReport'),
    t('ai.suggested.latePayment')
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('ai.title')}
        description={t('ai.description')}
        breadcrumbs={[{ label: t('ai.breadcrumbs.home'), href: '/' }, { label: t('ai.breadcrumbs.aiCenter') }, { label: t('ai.breadcrumbs.assistant') }]}
      />

      <AIChatWindow moduleName="General" suggestedQuestions={suggested} />
    </div>
  );
};
export default AIAssistantPage;
