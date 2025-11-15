import React, { useState, useEffect, useRef } from 'react';

interface StatItem {
  number: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

interface StatsCounterProps {
  stats: StatItem[];
}

const StatsCounter: React.FC<StatsCounterProps> = ({ stats }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const animateCounters = () => {
    const targetValues = stats.map(stat => {
      const numericValue = parseInt(stat.number.replace(/[^\d]/g, ''));
      return isNaN(numericValue) ? 0 : numericValue;
    });

    setAnimatedValues(new Array(stats.length).fill(0));

    targetValues.forEach((target, index) => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(current + increment, target);
        
        setAnimatedValues(prev => {
          const newValues = [...prev];
          newValues[index] = Math.floor(current);
          return newValues;
        });

        if (step >= steps || current >= target) {
          clearInterval(timer);
          setAnimatedValues(prev => {
            const newValues = [...prev];
            newValues[index] = target;
            return newValues;
          });
        }
      }, duration / steps);
    });
  };

  const formatDisplayValue = (originalValue: string, animatedValue: number) => {
    if (originalValue.includes('%')) {
      return `${animatedValue}%`;
    }
    if (originalValue.includes('+')) {
      return `${animatedValue.toLocaleString()}+`;
    }
    if (originalValue.includes('hrs')) {
      return `${animatedValue}hrs`;
    }
    return animatedValue.toLocaleString();
  };

  return (
    <div ref={sectionRef} className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const displayValue = isVisible 
          ? formatDisplayValue(stat.number, animatedValues[index] || 0)
          : '0';

        return (
          <div 
            key={index} 
            className="text-center animate-fade-in-up group" 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {IconComponent && (
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 ${stat.color || 'bg-white/20'}`}>
                <IconComponent className="h-8 w-8 text-white" />
              </div>
            )}
            <div 
              className={`text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300 ${
                isVisible ? 'counter-animation' : ''
              }`}
            >
              {displayValue}
            </div>
            <div className="text-green-100 group-hover:text-white transition-colors duration-300">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCounter;