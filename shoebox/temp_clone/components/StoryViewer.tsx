import React from 'react';
import type { Story } from '../types';
import { CloseIcon } from './Icons';

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ story, onClose }) => {
  return (
    <div 
      className="absolute bottom-0 left-0 right-0 z-[9999] bg-white/90 backdrop-blur-md shadow-lg border-t-4 border-red-700"
      style={{ animation: 'fadeIn 0.5s ease-out' }}
    >
      <div className="max-w-4xl mx-auto p-4 flex gap-6 items-start">
        <div className="flex-grow">
          <h3 className="font-heading text-2xl font-bold text-red-800 tracking-wide">{story.title}</h3>
          <div className="mt-2 text-gray-800 text-sm max-h-24 overflow-y-auto pr-2">
            {story.text}
          </div>
        </div>
        <div className="flex-shrink-0 w-64">
          {story.audioSrc && (
            <audio controls src={story.audioSrc} className="w-full" />
          )}
        </div>
        <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-red-700 hover:bg-red-100 rounded-full p-2 transition-colors flex-shrink-0"
            title="Close story"
            aria-label="Close story"
        >
            <CloseIcon className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
};

export default StoryViewer;
