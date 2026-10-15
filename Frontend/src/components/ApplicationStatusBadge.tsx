import React from 'react';
import { StatusBadge } from './StatusBadge';

interface ApplicationStatusBadgeProps {
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Background Check' | 'Approved' | 'Rejected' | 'Lease Created' | string;
  className?: string;
}

export const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({ status, className }) => {
  return <StatusBadge status={status} className={className} />;
};
export default ApplicationStatusBadge;
