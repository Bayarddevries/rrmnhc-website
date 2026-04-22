import React from 'react';

interface SubFilterProps {
  firstNames: string[];
  onSubTagSelect: (subTag: string | null) => void;
  activeSubTag: string | null;
}

const SubFilter: React.FC<SubFilterProps> = ({ firstNames, onSubTagSelect, activeSubTag }) => {
  if (firstNames.length === 0) return null;

  return (
    <div 
      className="absolute top-[70px] left-1/2 -translate-x-1/2 z-[9999] bg-black/50 backdrop-blur-sm rounded-lg shadow-lg flex items-center gap-2 px-3 py-2 overflow-x-auto max-w-[90vw]"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <button 
          onClick={() => onSubTagSelect(null)}
          className={`px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors duration-200 whitespace-nowrap ${
            activeSubTag === null 
              ? 'bg-white text-red-800' 
              : 'bg-white/20 text-white hover:bg-white/40'
          }`}
        >
          All
        </button>
      {firstNames.sort().map(name => (
        <button 
          key={name}
          onClick={() => onSubTagSelect(name)}
          className={`px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors duration-200 whitespace-nowrap ${
            activeSubTag === name 
              ? 'bg-white text-red-800' 
              : 'bg-white/20 text-white hover:bg-white/40'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default SubFilter;
