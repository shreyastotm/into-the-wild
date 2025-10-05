import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  action, 
  className = "" 
}) => {
  return (
    <div className={`text-center py-16 px-4 ${className}`}>
      <div className="inline-block relative mb-6">
        <img 
          src="/itw_logo.jpg" 
          alt="" 
          className="h-32 w-auto opacity-15 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent"></div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
