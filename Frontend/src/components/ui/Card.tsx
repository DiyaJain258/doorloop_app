import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, ...props }) => {
  return (
    <div
      className={clsx(
        'rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200',
        className
      )}
      {...props}
    />
  );
};
export default Card;
