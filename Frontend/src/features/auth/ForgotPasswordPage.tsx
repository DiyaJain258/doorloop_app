import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotPasswordFormInputs = zod.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordPageProps {
  navigate: (path: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigate }) => {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    // Simulate reset link email
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccess(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Forgot Password</h1>
        <p className="text-sm text-slate-400 mt-1">
          We will send you a reset link if your email exists
        </p>
      </div>

      {success ? (
        <div className="space-y-4 text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-sm font-semibold">
            We have sent a password reset link to your email address. Please check your inbox.
          </div>
          <Button
            onClick={() => navigate('/reset-password')}
            className="w-full font-bold bg-primary text-white hover:bg-primary/90"
          >
            Go to Reset Password Screen (Mock)
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className="pl-10 bg-slate-950/40 border-slate-700/80 text-white placeholder:text-slate-500 focus-visible:ring-primary focus-visible:ring-offset-slate-900"
              />
            </div>
            {errors.email && (
              <p className="text-rose-400 text-xs font-semibold mt-1">
                {errors.email.message}
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
            Send Reset Link
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
export default ForgotPasswordPage;
