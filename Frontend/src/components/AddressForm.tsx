import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from './ui/Input';

interface AddressFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export const AddressForm: React.FC<AddressFormProps> = ({ register, errors }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-sm text-foreground uppercase border-b pb-2">Address Coordinates</h3>
      
      <div className="space-y-1">
        <label className="text-xs font-bold text-muted-foreground uppercase">Street Address</label>
        <Input placeholder="124 Oakridge Blvd" {...register('streetAddress')} />
        {errors.streetAddress && <p className="text-rose-500 text-xs">{errors.streetAddress.message as string}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">City</label>
          <Input placeholder="Austin" {...register('city')} />
          {errors.city && <p className="text-rose-500 text-xs">{errors.city.message as string}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">State</label>
          <Input placeholder="TX" {...register('state')} />
          {errors.state && <p className="text-rose-500 text-xs">{errors.state.message as string}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Country</label>
          <Input placeholder="USA" {...register('country')} />
          {errors.country && <p className="text-rose-500 text-xs">{errors.country.message as string}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">ZIP Code</label>
          <Input placeholder="78701" {...register('zip')} />
          {errors.zip && <p className="text-rose-500 text-xs">{errors.zip.message as string}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-amber-500 uppercase flex items-center gap-1">
          NYC BIN (Building Identification Number) <span className="text-[10px] text-muted-foreground font-normal">(Optional - For NYC DOB Violations API Sync)</span>
        </label>
        <Input placeholder="e.g. 1000000" {...register('nycBin')} />
      </div>
    </div>
  );
};
export default AddressForm;
