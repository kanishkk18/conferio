'use client';

import { useState, useEffect } from 'react';

export default function ClickCard() {
  const [time, setTime] = useState<Date | null>(() =>
    typeof window !== 'undefined' ? new Date() : null
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div className="w-full max-w-md h-48 bg-gray-100/50 rounded-3xl animate-pulse" />
    );
  }

  // Calculate clock hand degrees
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hourDegrees = (((hours % 12) + minutes / 60) / 12) * 360;

  // Format time (4pm style)
  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase().replace(' ', '');

  // Format date (Wed, 17th July style)
  const dayName = time.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = time.getDate();
  const monthName = time.toLocaleDateString('en-US', { month: 'long' });
  
  const getOrdinalSuffix = (n: number) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const formattedDate = `${dayName}, ${dayNum}${getOrdinalSuffix(dayNum)} ${monthName}`;

  return (
    <div className="relative w-full max-w-md">
      {/* Card Container */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] border border-white/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out cursor-pointer group">
        
        <div className="flex items-center justify-between">
          {/* Analog Clock */}
          <div className="relative size-32">
            {/* Clock Face */}
            <div className="absolute inset-0 rounded-full bg-gray-50/80 border border-gray-100 shadow-inner">
              {/* Clock Markers */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-1.5 bg-gray-300 rounded-full origin-bottom"
                  style={{
                    left: '50%',
                    top: '8px',
                    transform: `translateX(-50%) rotate(${i * 30}deg)`,
                    transformOrigin: '50% 56px',
                  }}
                />
              ))}
              
              {/* Hour Markers (3, 6, 9, 12) */}
              {[0, 3, 6, 9].map((hour) => (
                <div
                  key={hour}
                  className="absolute w-1 h-2.5 bg-gray-400 rounded-full origin-bottom"
                  style={{
                    left: '50%',
                    top: '6px',
                    transform: `translateX(-50%) rotate(${hour * 30}deg)`,
                    transformOrigin: '50% 58px',
                  }}
                />
              ))}

              {/* Center Dot */}
              <div className="absolute top-1/2 left-1/2 size-2 bg-gray-800 rounded-full -translate-x-1/2 -translate-y-1/2 z-20 shadow-sm" />
              
              {/* Hour Hand */}
              <div
                className="absolute top-1/2 left-1/2 w-1 h-8 bg-gray-800 rounded-full origin-bottom -translate-x-1/2 -translate-y-full shadow-sm z-10"
                style={{ transform: `translateX(-50%) translateY(-100%) rotate(${hourDegrees}deg)` }}
              />
              
              {/* Minute Hand */}
              <div
                className="absolute top-1/2 left-1/2 w-0.5 h-11 bg-gray-600 rounded-full origin-bottom -translate-x-1/2 -translate-y-full shadow-sm z-10"
                style={{ transform: `translateX(-50%) translateY(-100%) rotate(${minuteDegrees}deg)` }}
              />
              
              {/* Second Hand (Subtle) */}
              <div
                className="absolute top-1/2 left-1/2 w-px h-12 bg-gray-400/60 rounded-full origin-bottom -translate-x-1/2 -translate-y-full z-10"
                style={{ transform: `translateX(-50%) translateY(-100%) rotate(${secondDegrees}deg)` }}
              />
            </div>
          </div>

          {/* Digital Time & Date */}
          <div className="flex flex-col items-start gap-y-1 ml-6">
            <div className="text-3xl font-semibold text-gray-800 tracking-tight">
              {formattedTime}
            </div>
            <div className="text-sm font-medium text-gray-500">
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* Optional: Timezone Indicator */}
      <div className="mt-3 text-center">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')}
        </span>
      </div>
    </div>
  );
}
