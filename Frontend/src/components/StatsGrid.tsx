import React from 'react';

interface StatsGridProps {
  children: React.ReactNode;
  cols?: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ children, cols = 4 }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-4 mb-6`}>
      {children}
    </div>
  );
};
export default StatsGrid;
