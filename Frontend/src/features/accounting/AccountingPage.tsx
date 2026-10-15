import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import api from '../../api';
import { Transaction } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { Plus, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

const txSchema = zod.object({
  type: zod.enum(['Income', 'Expense']),
  category: zod.string().min(1, 'Category is required'),
  amount: zod.number().min(1, 'Amount must be positive'),
  propertyName: zod.string().min(1, 'Property is required'),
  description: zod.string().min(1, 'Description is required'),
  reference: zod.string().optional(),
});

type TxFormValues = zod.infer<typeof txSchema>;

export const AccountingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { t } = useTranslation();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.accounting.getAll(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.property.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (newTx: TxFormValues) => api.accounting.create(newTx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setIsFormOpen(false);
      reset();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TxFormValues>({
    resolver: zodResolver(txSchema),
    defaultValues: { type: 'Income' },
  });

  const onSubmit = (values: TxFormValues) => {
    createMutation.mutate(values);
  };

  const filteredTx = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === '' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const columns: ColumnDef<Transaction>[] = [
    { accessorKey: 'date', header: t('accounting.columns.date'), id: 'date' },
    { accessorKey: 'propertyName', header: t('accounting.columns.property'), id: 'property' },
    { accessorKey: 'category', header: t('accounting.columns.category'), id: 'category' },
    { accessorKey: 'description', header: t('accounting.columns.description'), id: 'description' },
    {
      accessorKey: 'type',
      header: t('accounting.columns.type'),
      id: 'type',
      cell: ({ row }) => (
        <span
          className={
            row.original.type === 'Income'
              ? 'text-emerald-500 font-bold'
              : 'text-rose-500 font-bold'
          }
        >
          {row.original.type === 'Income' ? t('accounting.types.income') : t('accounting.types.expense')}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: t('accounting.columns.amount'),
      id: 'amount',
      cell: ({ row }) => (
        <span
          className={
            row.original.type === 'Income'
              ? 'text-emerald-500 font-bold'
              : 'text-rose-500 font-bold'
          }
        >
          {row.original.type === 'Income' ? '+' : '-'}${row.original.amount.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('accounting.title')}
        description={t('accounting.desc')}
        breadcrumbs={[
          { label: t('ai.breadcrumbs.home'), href: '/' },
          { label: t('nav.accounting') },
        ]}
        action={{
          label: t('accounting.recordTransaction'),
          onClick: () => setIsFormOpen(true),
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('accounting.searchPlaceholder')}
        filters={[
          {
            key: 'type',
            value: typeFilter,
            placeholder: t('accounting.typePlaceholder'),
            options: [
              { label: t('accounting.types.income'), value: 'Income' },
              { label: t('accounting.types.expense'), value: 'Expense' },
            ],
          },
        ]}
        onFilterChange={(_, val) => setTypeFilter(val)}
        onReset={() => {
          setSearchQuery('');
          setTypeFilter('');
        }}
      />

      <DataTable
        columns={columns}
        data={filteredTx}
        loading={isLoading}
        emptyStateMessage={t('accounting.emptyState')}
      />

      <FormDialog open={isFormOpen} onOpenChange={setIsFormOpen} title={t('accounting.form.title')}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t('accounting.form.type')}</label>
              <Select {...register('type')}>
                <option value="Income">{t('accounting.types.income')} (+)</option>
                <option value="Expense">{t('accounting.types.expense')} (-)</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t('accounting.form.amount')}</label>
              <Input
                type="number"
                placeholder={t('accounting.form.amountPlaceholder')}
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-rose-500 text-xs">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t('accounting.form.category')}</label>
              <Input placeholder={t('accounting.form.categoryPlaceholder')} {...register('category')} />
              {errors.category && <p className="text-rose-500 text-xs">{errors.category.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t('accounting.form.property')}</label>
              <Select {...register('propertyName')}>
                <option value="">{t('accounting.form.propertyPlaceholder')}</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </Select>
              {errors.propertyName && <p className="text-rose-500 text-xs">{errors.propertyName.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t('accounting.form.description')}</label>
            <Input placeholder={t('accounting.form.descriptionPlaceholder')} {...register('description')} />
            {errors.description && <p className="text-rose-500 text-xs">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>
              {t('accounting.form.cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('accounting.form.save')}
            </Button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
};
export default AccountingPage;
