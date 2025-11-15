import React from 'react';

interface AnimatedBackgroundProps {
  variant?: 'dots' | 'waves' | 'grid' | 'particles';
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  variant = 'dots', 
  className = '' 
}) => {
  const renderDots = () => (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );

  const renderWaves = () => (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <svg
        className="absolute bottom-0 left-0 w-full h-32 text-white/5"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
          fill="currentColor"
          className="animate-pulse"
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-full h-32 text-white/3"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{ animationDelay: '1s' }}
      >
        <path
          d="M0,80 C300,20 900,100 1200,40 L1200,120 L0,120 Z"
          fill="currentColor"
          className="animate-pulse"
        />
      </svg>
    </div>
  );

  const renderGrid = () => (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="grid grid-cols-12 grid-rows-8 h-full w-full gap-1 p-4 opacity-5">
        {Array.from({ length: 96 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded animate-pulse"
            style={{
              animationDelay: `${i * 50}ms`,
              animationDuration: `${2 + Math.random()}s`
            }}
          />
        ))}
      </div>
    </div>
  );

  const renderParticles = () => (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(90deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          75% { transform: translateY(-10px) rotate(270deg); }
        }
      `}</style>
    </div>
  );

  const renderBackground = () => {
    switch (variant) {
      case 'waves': return renderWaves();
      case 'grid': return renderGrid();
      case 'particles': return renderParticles();
      default: return renderDots();
    }
  };

  return renderBackground();
};

export default AnimatedBackground;