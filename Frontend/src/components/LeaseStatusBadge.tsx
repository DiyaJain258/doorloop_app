import React from 'react';
import { StatusBadge } from './StatusBadge';

interface LeaseStatusBadgeProps {
  status: 'Active' | 'Pending' | 'Expired' | 'Terminated' | string;
  className?: string;
}

export const LeaseStatusBadge: React.FC<LeaseStatusBadgeProps> = ({ status, className }) => {
  return <StatusBadge status={status} className={className} />;
};
export default LeaseStatusBadge;
