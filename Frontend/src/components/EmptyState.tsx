import React from 'react';
import { Button } from './ui/Button';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-2xl bg-card/25 text-center text-foreground max-w-md mx-auto my-6 animate-fade-in">
      <div className="p-4 bg-secondary/60 text-muted-foreground rounded-2xl mb-4">
        {icon || <Inbox className="w-8 h-8 text-primary animate-pulse-slow" />}
      </div>
      <h3 className="font-extrabold text-base tracking-tight">{title}</h3>
      <p className="text-xs text-muted-foreground font-semibold mt-1 mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="font-bold">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
