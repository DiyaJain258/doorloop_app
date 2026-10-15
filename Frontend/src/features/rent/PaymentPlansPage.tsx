import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PaymentPlan } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { ApplicationStepper } from '../../components/ApplicationStepper';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/StatusBadge';
import { CurrencyInput } from '../../components/Phase4Components';
import { Plus, Eye, Calendar, DollarSign, Clock, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const PaymentPlansPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);

  // Form selections
  const [tenantId, setTenantId] = useState('');
  const [originalBalance, setOriginalBalance] = useState(1200);
  const [installments, setInstallments] = useState(6);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Queries
  const { data: plans = [], isLoading } = useQuery({ queryKey: ['payment-plans-list'], queryFn: () => api.paymentPlans.getAll() });
  const { data: tenants = [] } = useQuery({ queryKey: ['tenants'], queryFn: () => api.tenant.getAll() });

  const createMutation = useMutation({
    mutationFn: () => {
      const ten = tenants.find((t) => t.id === tenantId);
      return api.paymentPlans.create({
        tenantId,
        tenantName: ten ? `${ten.firstName} ${ten.lastName}` : 'Tenant',
        originalBalance,
        installments,
        nextDueDate: startDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-plans-list'] });
      setIsWizardOpen(false);
      setWizardStep(0);
      setTenantId('');
    },
  });

  const filteredPlans = plans.filter((plan) =>
    plan.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<PaymentPlan>[] = [
    { accessorKey: 'id', header: 'Plan ID', id: 'id', cell: ({ row }) => <span className="font-bold">{row.original.id}</span> },
    { accessorKey: 'tenantName', header: 'Tenant', id: 'tenant' },
    {
      accessorKey: 'originalBalance',
      header: 'Total Balance',
      id: 'originalBalance',
      cell: ({ row }) => <span>${row.original.originalBalance.toLocaleString()}</span>,
    },
    {
      accessorKey: 'remainingBalance',
      header: 'Remaining Balance',
      id: 'remainingBalance',
      cell: ({ row }) => <span className="font-extrabold text-rose-500">${row.original.remainingBalance.toLocaleString()}</span>,
    },
    { accessorKey: 'installments', header: 'Installments', id: 'installments', cell: ({ row }) => <span>{row.original.installments} Months</span> },
    { accessorKey: 'nextDueDate', header: 'Next Due Date', id: 'nextDueDate' },
    {
      accessorKey: 'status',
      header: 'Status',
      id: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  const steps = ['Select Resident', 'Stipulate Balance', 'Define Installments', 'Final Review'];

  const handleNext = () => {
    if (wizardStep === 0 && !tenantId) return;
    setWizardStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setWizardStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div>
      <PageHeader
        title="Payment Plans (Installments)"
        description="Verify outstanding resident debt installments, payment plans scheduling, and default rates."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Rent Collection', href: '/rent' },
          { label: 'Payment Plans' },
        ]}
        action={{
          label: 'Create Payment Plan',
          onClick: () => setIsWizardOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search plans by resident name..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredPlans} loading={isLoading} />

      {/* MULTI STEP WIZARD DIALOG */}
      <FormDialog open={isWizardOpen} onOpenChange={setIsWizardOpen} title="Initiate Payment Plan Wizard">
        <div className="space-y-6 pt-2">
          <ApplicationStepper steps={steps} currentStep={wizardStep} />

          {/* Step 1: Resident */}
          {wizardStep === 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Resident / Tenant</label>
              <Select value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
                <option value="">Select Resident...</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                ))}
              </Select>
            </div>
          )}

          {/* Step 2: Balance */}
          {wizardStep === 1 && (
            <CurrencyInput
              label="Outstanding Plan Balance ($)"
              value={originalBalance}
              onChange={(e) => setOriginalBalance(Number(e.target.value))}
            />
          )}

          {/* Step 3: Installments */}
          {wizardStep === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Installments (Months)</label>
                <Input type="number" value={installments} onChange={(e) => setInstallments(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">First Due Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {wizardStep === 3 && (
            <div className="bg-secondary/20 p-4 border rounded-xl space-y-3 text-xs font-semibold">
              <h4 className="font-extrabold uppercase">Plan Agreement Summary</h4>
              <p><strong>Resident:</strong> {tenants.find(t => t.id === tenantId)?.firstName} {tenants.find(t => t.id === tenantId)?.lastName}</p>
              <p><strong>Original Balance:</strong> ${originalBalance.toLocaleString()}</p>
              <p><strong>Stipulated Installment:</strong> ${(originalBalance / installments).toFixed(2)} / month for {installments} Months</p>
              <p><strong>First Due Date:</strong> {startDate}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="ghost" onClick={handlePrev} disabled={wizardStep === 0} className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            {wizardStep < steps.length - 1 ? (
              <Button onClick={handleNext} className="flex items-center gap-1">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Activate Plan
              </Button>
            )}
          </div>
        </div>
      </FormDialog>
    </div>
  );
};
export default PaymentPlansPage;
