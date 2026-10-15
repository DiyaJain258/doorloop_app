import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'details';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'card' }) => {
  if (type === 'table') {
    return (
      <div className="space-y-4 animate-pulse w-full">
        <div className="flex justify-between items-center pb-2">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-8 bg-muted rounded w-24" />
        </div>
        <div className="h-10 bg-muted/60 rounded-xl w-full" />
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="h-12 bg-muted/40 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  if (type === 'details') {
    return (
      <div className="space-y-6 animate-pulse w-full">
        <div className="h-16 bg-muted rounded-xl w-full" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 space-y-4">
            <div className="h-44 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
          </div>
          <div className="col-span-2 space-y-4">
            <div className="h-96 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse w-full">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="border border-border p-6 bg-card rounded-2xl space-y-4">
          <div className="flex justify-between">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-8 w-8 bg-muted rounded-lg" />
          </div>
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-full" />
        </div>
      ))}
    </div>
  );
};
export default LoadingSkeleton;
