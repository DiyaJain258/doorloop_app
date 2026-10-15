import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

interface ApplicationStepperProps {
  steps: string[];
  currentStep: number;
}

export const ApplicationStepper: React.FC<ApplicationStepperProps> = ({ steps, currentStep }) => {
  return (
    <nav className="w-full py-4 text-foreground">
      <ul className="flex items-center justify-between space-x-4">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <div
                  className={clsx(
                    'flex-1 h-0.5 transition-all duration-300',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
              <li className="flex items-center space-x-2">
                <span
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ring-4 ring-card',
                    isCompleted
                      ? 'bg-primary text-white'
                      : isActive
                      ? 'bg-primary/10 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground border-2 border-border'
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </span>
                <span
                  className={clsx(
                    'hidden md:inline text-xs font-bold transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {step}
                </span>
              </li>
            </React.Fragment>
          );
        })}
      </ul>
    </nav>
  );
};
export default ApplicationStepper;
