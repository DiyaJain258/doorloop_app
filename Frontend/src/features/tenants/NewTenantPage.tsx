import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { FileUploader } from '../../components/FileUploader';
import { Loader2, ArrowLeft, Plus, Trash2, ChevronDown } from 'lucide-react';
import { mapBackendErrors } from '../../utils/errorMapping';

const optionalNumberRegister = {
  setValueAs: (v: any) => (v === '' || v === null || v === undefined || isNaN(Number(v)) ? undefined : Number(v)),
};

const tenantFormSchema = zod.object({
  firstName: zod.string().min(1, 'First Name is required'),
  lastName: zod.string().min(1, 'Last Name is required'),
  preferredName: zod.string().optional(),
  dob: zod.string().min(1, 'Date of Birth is required'),
  gender: zod.enum(['Male', 'Female', 'Other']),
  nationality: zod.string().min(1, 'Nationality is required'),
  
  email: zod.string().email('Invalid email address'),
  phone: zod.string().min(1, 'Mobile Phone is required'),
  altPhone: zod.string().optional(),
  
  idType: zod.enum(['SSN', 'Driver License', 'Passport', 'State ID']).optional(),
  idNumber: zod.string().optional(),
  
  emergencyName: zod.string().optional(),
  emergencyRelationship: zod.string().optional(),
  emergencyPhone: zod.string().optional(),
  
  employer: zod.string().optional(),
  position: zod.string().optional(),
  monthlyIncome: zod.number().min(0, 'Monthly Income cannot be negative').optional(),
  employmentStatus: zod.enum(['Full-Time', 'Part-Time', 'Self-Employed', 'Unemployed', 'Retired']).optional(),
  
  currentAddress: zod.string().optional(),
  previousAddress: zod.string().optional(),
  
  pets: zod.array(zod.object({
    name: zod.string().min(1, 'Pet Name is required'),
    type: zod.string().min(1, 'Type is required'),
    breed: zod.string().optional(),
  })).optional(),
  
  vehicles: zod.array(zod.object({
    make: zod.string().min(1, 'Make is required'),
    model: zod.string().min(1, 'Model is required'),
    plate: zod.string().min(1, 'License Plate is required'),
  })).optional(),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});

type TenantFormInputs = zod.infer<typeof tenantFormSchema>;

export const NewTenantPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);

  const createMutation = useMutation({
    mutationFn: (values: any) => {
      return api.tenant.create(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setSuccess(true);
      setTimeout(() => navigate({ to: '/tenants' }), 2000);
    },
    onError: (err: any) => {
      mapBackendErrors(err, setError);
    }
  });

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TenantFormInputs>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      gender: 'Male',
      idType: 'Driver License',
      employmentStatus: 'Full-Time',
      monthlyIncome: undefined,
      pets: [],
      vehicles: [],
    },
  });

  const { fields: petFields, append: appendPet, remove: removePet } = useFieldArray({
    control,
    name: 'pets',
  });

  const { fields: vehicleFields, append: appendVehicle, remove: removeVehicle } = useFieldArray({
    control,
    name: 'vehicles',
  });

  const onSubmit = (values: TenantFormInputs) => {
    createMutation.mutate({
      ...values,
      role: 'Tenant',
      image: imageFile || undefined,
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Add Tenant"
        description="Register a new tenant application account details."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tenants', href: '/tenants' },
          { label: 'Add Tenant' },
        ]}
      />

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-semibold mb-6">
          Tenant created successfully! Redirecting back to directory...
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-card border border-border p-6 rounded-2xl shadow-sm text-foreground">
        
        {/* PERSONAL INFO */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-foreground uppercase border-b pb-2">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">First Name</label>
              <Input placeholder="John" {...register('firstName')} />
              {errors.firstName && <p className="text-rose-500 text-xs">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Last Name</label>
              <Input placeholder="Doe" {...register('lastName')} />
              {errors.lastName && <p className="text-rose-500 text-xs">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Preferred Name</label>
              <Input placeholder="Johnny" {...register('preferredName')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Date of Birth</label>
              <Input type="date" {...register('dob')} />
              {errors.dob && <p className="text-rose-500 text-xs">{errors.dob.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Gender</label>
              <Select {...register('gender')}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Nationality</label>
              <Input placeholder="American" {...register('nationality')} />
              {errors.nationality && <p className="text-rose-500 text-xs">{errors.nationality.message}</p>}
            </div>
          </div>
        </div>

        {/* CONTACT INFO */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-foreground uppercase border-b pb-2">Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
              <Input type="email" placeholder="john.doe@gmail.com" {...register('email')} />
              {errors.email && <p className="text-rose-500 text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Mobile Phone</label>
              <Input type="tel" placeholder="(512) 555-0199" {...register('phone')} />
              {errors.phone && <p className="text-rose-500 text-xs">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Alternate Phone</label>
              <Input type="tel" placeholder="(512) 555-4321" {...register('altPhone')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Password</label>
              <Input type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-rose-500 text-xs">{errors.password.message}</p>}
            </div>
          </div>
        </div>

        {/* ADDITIONAL DETAILS DROPDOWN TOGGLE */}
        <div className="pt-2 border-t">
          <button
            type="button"
            onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
            className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/60 border border-border rounded-xl transition-all text-left cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground uppercase tracking-wide">
                  Additional Details (Optional)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Government IDs, Emergency Contacts, Employment, Address, Pets, Vehicles & Documents
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <span>{showAdditionalDetails ? 'Hide Details' : 'Show Details'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdditionalDetails ? 'rotate-180' : ''}`} />
            </div>
          </button>
        </div>

        {showAdditionalDetails && (
          <div className="space-y-8 animate-fade-in pt-2">
            {/* GOVERNMENT IDS */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-foreground uppercase border-b pb-2">Government IDs (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">ID Type</label>
                  <Select {...register('idType')}>
                    <option value="SSN">SSN</option>
                    <option value="Driver License">Driver License</option>
                    <option value="Passport">Passport</option>
                    <option value="State ID">State ID</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">ID Number</label>
                  <Input placeholder="A1234567" {...register('idNumber')} />
                  {errors.idNumber && <p className="text-rose-500 text-xs">{errors.idNumber.message}</p>}
                </div>
              </div>
            </div>

            {/* EMERGENCY CONTACT */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-foreground uppercase border-b pb-2">Emergency Contact (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Contact Name</label>
                  <Input placeholder="Mary Doe" {...register('emergencyName')} />
                  {errors.emergencyName && <p className="text-rose-500 text-xs">{errors.emergencyName.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Relationship</label>
                  <Input placeholder="Spouse / Parent" {...register('emergencyRelationship')} />
                  {errors.emergencyRelationship && <p className="text-rose-500 text-xs">{errors.emergencyRelationship.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Emergency Phone</label>
                  <Input type="tel" placeholder="(512) 555-9876" {...register('emergencyPhone')} />
                  {errors.emergencyPhone && <p className="text-rose-500 text-xs">{errors.emergencyPhone.message}</p>}
                </div>
              </div>
            </div>

            {/* EMPLOYMENT */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-foreground uppercase border-b pb-2">Employment Parameters (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Employer Name</label>
                  <Input placeholder="Google Inc." {...register('employer')} />
                  {errors.employer && <p className="text-rose-500 text-xs">{errors.employer.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Position</label>
                  <Input placeholder="Staff Engineer" {...register('position')} />
                  {errors.position && <p className="text-rose-500 text-xs">{errors.position.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Monthly Income ($)</label>
                  <Input type="number" placeholder="e.g. 3500" {...register('monthlyIncome', optionalNumberRegister)} />
                  {errors.monthlyIncome && <p className="text-rose-500 text-xs">{errors.monthlyIncome.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Status</label>
                  <Select {...register('employmentStatus')}>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Retired">Retired</option>
                    <option value="Unemployed">Unemployed</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* ADDRESSES */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-foreground uppercase border-b pb-2">Address History (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Current Address</label>
                  <Input placeholder="789 Pine Rd, Austin, TX" {...register('currentAddress')} />
                  {errors.currentAddress && <p className="text-rose-500 text-xs">{errors.currentAddress.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Previous Address (Optional)</label>
                  <Input placeholder="456 Elm St, Dallas, TX" {...register('previousAddress')} />
                </div>
              </div>
            </div>

            {/* PETS */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm text-foreground uppercase">Pets Registry</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => appendPet({ name: '', type: '' })} className="text-xs font-bold">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Pet
                </Button>
              </div>
              {petFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-secondary/20 p-3 rounded-lg">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Pet Name</label>
                    <Input placeholder="Max" {...register(`pets.${index}.name`)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Type</label>
                    <Input placeholder="Dog / Cat" {...register(`pets.${index}.type`)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Breed</label>
                    <Input placeholder="Golden Retriever" {...register(`pets.${index}.breed`)} />
                  </div>
                  <Button type="button" variant="ghost" className="text-rose-500 hover:bg-rose-500/10 h-10 flex items-center justify-center" onClick={() => removePet(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* VEHICLES */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm text-foreground uppercase">Vehicles Registry</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => appendVehicle({ make: '', model: '', plate: '' })} className="text-xs font-bold">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Vehicle
                </Button>
              </div>
              {vehicleFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-secondary/20 p-3 rounded-lg">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Make</label>
                    <Input placeholder="Toyota" {...register(`vehicles.${index}.make`)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Model</label>
                    <Input placeholder="RAV4" {...register(`vehicles.${index}.model`)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">License Plate</label>
                    <Input placeholder="TX-123XYZ" {...register(`vehicles.${index}.plate`)} />
                  </div>
                  <Button type="button" variant="ghost" className="text-rose-500 hover:bg-rose-500/10 h-10 flex items-center justify-center" onClick={() => removeVehicle(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* MEDIA */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-foreground uppercase border-b pb-2">Media & Attachments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Tenant Photo <span className="text-muted-foreground font-normal">(Optional - Max 1MB)</span></label>
                  <FileUploader
                    accept="image/*"
                    maxSizeMB={1}
                    onFileSelect={(file) => setImageFile(file)}
                  />
                </div>
              </div>
            </div>

            {/* DOCUMENTS */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-foreground uppercase border-b pb-2">Supporting Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Government ID Scan</label>
                  <FileUploader />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Proof of Income</label>
                  <FileUploader />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER BUTTONS */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button type="button" variant="ghost" onClick={() => navigate({ to: '/tenants' })} className="flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save Tenant
          </Button>
        </div>

      </form>
    </div>
  );
};
export default NewTenantPage;
