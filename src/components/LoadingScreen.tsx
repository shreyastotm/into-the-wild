import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center z-50">
      <div className="text-center">
        <img 
          src="/itw_logo.jpg" 
          alt="Into the Wild" 
          className="h-32 md:h-40 w-auto mx-auto mb-6 animate-pulse-scale"
        />
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
