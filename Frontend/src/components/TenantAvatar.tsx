import React from 'react';
import { clsx } from 'clsx';

interface TenantAvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TenantAvatar: React.FC<TenantAvatarProps> = ({
  name,
  imageUrl,
  size = 'md',
  className,
}) => {
  const getInitials = (n: string) => {
    const parts = n.split(' ');
    const first = parts[0]?.charAt(0) || '';
    const last = parts[1]?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  const getBgColor = (n: string) => {
    let hash = 0;
    for (let i = 0; i < n.length; i++) {
      hash = n.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 60%, 45%)`;
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-16 h-16 text-lg font-bold',
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={clsx(
          'rounded-full object-cover border border-border shadow-sm shrink-0',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      style={{ backgroundColor: getBgColor(name) }}
      className={clsx(
        'rounded-full flex items-center justify-center text-white font-extrabold shadow-sm shrink-0 uppercase',
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
};
export default TenantAvatar;
