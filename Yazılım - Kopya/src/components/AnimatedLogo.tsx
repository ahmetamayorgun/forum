import React from 'react';

interface AnimatedLogoProps {
  text?: string;
  className?: string;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ text = "Forum", className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
          {text}
        </div>
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg blur opacity-25 animate-pulse"></div>
      </div>
    </div>
  );
};

export default AnimatedLogo; 