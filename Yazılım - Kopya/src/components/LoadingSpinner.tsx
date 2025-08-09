import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-red-600 dark:border-t-red-400`}></div>
        
        {/* Inner pulse */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-red-600/20 dark:bg-red-400/20 animate-ping`}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 