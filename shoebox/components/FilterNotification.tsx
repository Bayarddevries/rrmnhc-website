
import React from 'react';
import { CloseIcon } from './Icons';
import { FilterState } from '../types';

interface FilterNotificationProps {
  activeFilter: FilterState;
  onClear: () => void;
  onEditStories: () => void;
}

const FilterNotification: React.FC<FilterNotificationProps> = ({ activeFilter, onClear, onEditStories }) => {
  const displayText = () => {
    if (activeFilter.type === 'story') {
        return "Story Active";
    }
    if (activeFilter.type === 'text') {
        return `Search: "${activeFilter.value}"`;
    }
    let text = activeFilter.value;
    if (activeFilter.type === 'family') {
        text = `Family: ${text}`;
        if (activeFilter.subValue) {
            text += ` (${activeFilter.subValue})`;
        }
    }
    return text;
  }

  return (
    <div 
      className="absolute top-0 left-1/2 -translate-x-1/2 z-[10000] mt-4 bg-white/90 backdrop-blur-md rounded-lg shadow-lg flex items-center gap-4 px-4 py-2"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <p className="text-sm font-semibold text-gray-600">
        Filtering by: <span className="font-bold text-red-800">{displayText()}</span>
      </p>
      
      {activeFilter.type === 'story' && (
          <button 
            onClick={onEditStories}
            className="text-xs font-bold text-red-700 hover:bg-red-100 px-2 py-1 rounded transition-colors border border-red-200"
            title="Edit this story"
          >
            Edit Story
          </button>
      )}

      <button 
        onClick={onClear} 
        className="text-gray-500 hover:text-red-700 hover:bg-red-100 rounded-full p-2 transition-colors"
        title="Clear filter"
      >
        <CloseIcon className="h-7 w-7" />
      </button>
    </div>
  );
};

export default FilterNotification;
