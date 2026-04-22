import React from 'react';

interface ShoeboxCoverProps {
  onUnpack: () => void;
  isLifting: boolean;
  onEnterSlideshowSetup: () => void;
}

const ShoeboxCover: React.FC<ShoeboxCoverProps> = ({ onUnpack, isLifting, onEnterSlideshowSetup }) => {
  
  const description = "The Red River Métis Shoebox is building a community archive. We’re looking for personal or family photographs that reflect your connection to Red River Métis identity, culture, and community.";

  return (
    <div 
      className={`absolute inset-0 z-[9990] flex items-center justify-center transition-all duration-700 ease-in-out p-4 ${isLifting ? 'opacity-0 -translate-y-full' : 'opacity-100'}`}
      style={{
        animation: 'fadeIn 1s ease-in-out'
      }}
    >
      <div className="w-full max-w-3xl text-center bg-white/90 backdrop-blur-md p-10 rounded-xl shadow-2xl border border-white/20">
        <h1 className="text-5xl font-heading tracking-wider text-red-800 mb-4">Red River Métis Shoebox</h1>
        <h2 className="text-3xl text-gray-800 mt-2 font-heading tracking-wider">Help Us Preserve Métis History</h2>
        <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
          {description}
        </p>
        <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
          Whether it’s recent or older, formal or casual, what matters is that it holds meaning for you. If it tells part of your story, it belongs in the Shoebox.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onUnpack}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105 duration-300 uppercase tracking-wider"
          >
            Unpack The Shoebox
          </button>
          <button
            onClick={onEnterSlideshowSetup}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105 duration-300 uppercase tracking-wider"
          >
            Photo Slideshow Mode
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          To learn more, contact Bayard DeVries at <strong className="font-semibold text-gray-700">Bayard.devries@mmf.mb.ca</strong>
        </p>
      </div>
    </div>
  );
};

export default ShoeboxCover;