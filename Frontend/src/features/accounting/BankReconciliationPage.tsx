import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { BankReconciliationView } from '../../components/AccountingComponents';

interface StmtItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
}

export const BankReconciliationPage: React.FC = () => {
  // Queries
  const { data: reconData, isLoading } = useQuery({
    queryKey: ['recon-data'],
    queryFn: () => api.bankReconciliation.getAll(),
  });

  const [unreconciled, setUnreconciled] = useState<StmtItem[]>([]);

  React.useEffect(() => {
    if (reconData?.unreconciledItems) {
      setUnreconciled(reconData.unreconciledItems);
    }
  }, [reconData]);

  if (isLoading || !reconData) {
    return <LoadingSkeleton type="card" />;
  }

  const handleMatch = (id: string) => {
    setUnreconciled((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Reconciliation Matcher"
        description="Verify Chase and BoA monthly statements matching lines against general ledger transactions."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Accounting', href: '/accounting' },
          { label: 'Bank Reconciliation' },
        ]}
      />
      <BankReconciliationView
        unreconciledItems={unreconciled}
        onReconcile={handleMatch}
      />
    </div>
  );
};
export default BankReconciliationPage;
