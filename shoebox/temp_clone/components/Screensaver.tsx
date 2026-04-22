import React, { useState, useEffect } from 'react';
import type { Photo } from '../types';

interface ScreensaverProps {
  photos: Photo[];
  onWakeUp: () => void;
}

const Screensaver: React.FC<ScreensaverProps> = ({ photos, onWakeUp }) => {
  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    const interval = setInterval(() => {
      setVisibleIndex(prev => (prev + 1) % photos.length);
    }, 5000); // Change photo every 5 seconds
    return () => clearInterval(interval);
  }, [photos.length]);

  if (photos.length === 0) {
    onWakeUp();
    return null;
  }

  return (
    <div 
      className="absolute inset-0 bg-black z-[10000] cursor-pointer"
      onClick={onWakeUp}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onWakeUp()}
      aria-label="Exit screensaver"
    >
      {/* Photo display area with cross-fade effect */}
      <div className="absolute inset-0 overflow-hidden">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${photo.src})`,
              opacity: index === visibleIndex ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out', // Optimized crossfade transition
              transform: 'scale(1.05)', // Gentle scale to fill screen without animation
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white p-8 text-center">
        <h2 
          className="text-3xl md:text-5xl font-heading tracking-wider drop-shadow-lg"
          style={{ animation: 'fadeIn 1.5s ease-in-out' }}
        >
          Red River Métis Shoebox
        </h2>
        <p 
          className="mt-8 text-2xl md:text-3xl font-light drop-shadow-lg"
          style={{ animation: 'pulse-text 2.5s infinite ease-in-out'}}
        >
          Touch anywhere to continue
        </p>
      </div>
    </div>
  );
};

export default Screensaver;