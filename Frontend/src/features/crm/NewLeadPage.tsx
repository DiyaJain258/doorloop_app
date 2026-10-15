import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Loader2, ArrowLeft } from 'lucide-react';

const leadFormSchema = zod.object({
  firstName: zod.string().min(1, 'First Name is required'),
  lastName: zod.string().min(1, 'Last Name is required'),
  email: zod.string().email('Invalid email address'),
  phone: zod.string().min(1, 'Phone is required'),
  propertyOfInterestId: zod.string().min(1, 'Property Preference is required'),
  budget: zod.number().min(1, 'Budget must be positive'),
  moveInDate: zod.string().min(1, 'Expected Move-In Date is required'),
  source: zod.enum(['Zillow', 'Apartments.com', 'Website', 'Referral', 'Walk-in', 'Craigslist', 'Other']),
  priority: zod.enum(['Low', 'Medium', 'High', 'Urgent']),
  assignedAgent: zod.string().min(1, 'Assigned Agent is required'),
  notes: zod.string().optional(),
});

type LeadFormInputs = zod.infer<typeof leadFormSchema>;

export const NewLeadPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.property.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (values: LeadFormInputs) => {
      const propObj = properties.find((p) => p.id === values.propertyOfInterestId);
      return api.leasing.createLead({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        source: values.source,
        budget: values.budget,
        moveInDate: values.moveInDate,
        priority: values.priority,
        assignedAgent: values.assignedAgent,
        notes: values.notes,
        property: propObj ? propObj.name : 'Unknown Property',
        status: 'New',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSuccess(true);
      setTimeout(() => navigate({ to: '/leasing/leads' }), 2000);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormInputs>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      source: 'Zillow',
      priority: 'Medium',
      budget: 1600,
      assignedAgent: 'Agent Smith',
      moveInDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (values: LeadFormInputs) => {
    createMutation.mutate(values);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Add Lead"
        description="Register a new prospect lead card into the CRM database."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'CRM', href: '/crm' },
          { label: 'Leads', href: '/leads' },
          { label: 'Add Lead' },
        ]}
      />

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-semibold mb-6">
          Lead registered successfully! Redirecting back...
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card border border-border p-6 rounded-2xl shadow-sm text-foreground">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">First Name</label>
            <Input placeholder="Alice" {...register('firstName')} />
            {errors.firstName && <p className="text-rose-500 text-xs">{errors.firstName.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Last Name</label>
            <Input placeholder="Smith" {...register('lastName')} />
            {errors.lastName && <p className="text-rose-500 text-xs">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
            <Input type="email" placeholder="alice.smith@gmail.com" {...register('email')} />
            {errors.email && <p className="text-rose-500 text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number</label>
            <Input placeholder="(512) 555-0155" {...register('phone')} />
            {errors.phone && <p className="text-rose-500 text-xs">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Interested Property</label>
            <Select {...register('propertyOfInterestId')}>
              <option value="">Select Property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            {errors.propertyOfInterestId && <p className="text-rose-500 text-xs">{errors.propertyOfInterestId.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Monthly Budget ($)</label>
            <Input type="number" {...register('budget', { valueAsNumber: true })} />
            {errors.budget && <p className="text-rose-500 text-xs">{errors.budget.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Move-In Date</label>
            <Input type="date" {...register('moveInDate')} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Acquisition Source</label>
            <Select {...register('source')}>
              <option value="Zillow">Zillow</option>
              <option value="Apartments.com">Apartments.com</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Craigslist">Craigslist</option>
              <option value="Other">Other</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Priority</label>
            <Select {...register('priority')}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Assigned Agent</label>
          <Input {...register('assignedAgent')} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Internal Notes</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 text-foreground"
            placeholder="Lead preferences, follow-up times..."
            {...register('notes')}
          />
        </div>

        <div className="flex justify-between items-center pt-6 border-t">
          <Button type="button" variant="ghost" onClick={() => navigate({ to: '/leasing/leads' })} className="flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save Lead Card
          </Button>
        </div>
      </form>
    </div>
  );
};
export default NewLeadPage;
