import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';

const resetPasswordSchema = zod
  .object({
    password: zod.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: zod.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormInputs = zod.infer<typeof resetPasswordSchema>;

interface ResetPasswordPageProps {
  navigate: (path: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ navigate }) => {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    // Simulate API reset call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccess(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
        <p className="text-sm text-slate-400 mt-1">Enter your new account password</p>
      </div>

      {success ? (
        <div className="space-y-4 text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-sm font-semibold">
            Password has been successfully reset! You can now log in with your new credentials.
          </div>
          <Button
            onClick={() => navigate('/login')}
            className="w-full font-bold bg-primary text-white hover:bg-primary/90"
          >
            Go to Login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="pl-10 bg-slate-950/40 border-slate-700/80 text-white placeholder:text-slate-500 focus-visible:ring-primary focus-visible:ring-offset-slate-900"
              />
            </div>
            {errors.password && (
              <p className="text-rose-400 text-xs font-semibold mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="pl-10 bg-slate-950/40 border-slate-700/80 text-white placeholder:text-slate-500 focus-visible:ring-primary focus-visible:ring-offset-slate-900"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-rose-400 text-xs font-semibold mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full flex items-center justify-center h-10 font-bold bg-primary text-white hover:bg-primary/90 mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Reset Password
          </Button>
        </form>
      )}

      <div className="text-center">
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center text-xs text-slate-400 font-bold hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Login
        </button>
      </div>
    </div>
  );
};
export default ResetPasswordPage;
