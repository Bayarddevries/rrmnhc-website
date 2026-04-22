import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';

interface PhotoCycleControlsProps {
  onCycle: (direction: 'next' | 'prev') => void;
}

const PhotoCycleControls: React.FC<PhotoCycleControlsProps> = ({ onCycle }) => {
  return (
    <>
      <button
        onClick={() => onCycle('prev')}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-[10001] bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-2 text-white transition-colors"
        aria-label="Previous photo"
      >
        <ArrowLeftIcon />
      </button>
      <button
        onClick={() => onCycle('next')}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-[10001] bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-2 text-white transition-colors"
        aria-label="Next photo"
      >
        <ArrowRightIcon />
      </button>
    </>
  );
};

export default PhotoCycleControls;
