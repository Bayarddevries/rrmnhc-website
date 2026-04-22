import React from 'react';
import { CloseIcon } from './Icons';

interface WelcomeMessageProps {
  onClose: () => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed bottom-0 right-0 z-[9998] p-4 sm:p-6"
      style={{ animation: 'fadeIn 0.5s ease-in-out 1s forwards', opacity: 0 }}
    >
      <div 
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-red-700"
      >
        <div className="bg-red-700 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-heading tracking-wider uppercase">Share Your Story</h2>
          <button 
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close message"
            >
              <CloseIcon />
          </button>
        </div>

        <div className="p-6 text-gray-800">
            <p className="font-bold text-red-800 text-lg">Help Us Preserve Métis History!</p>
            <p className="text-base mt-2">
              We’re inviting all Red River Métis citizens to contribute personal or family photographs that reflect their Métis history.
            </p>
            <p className="text-sm text-gray-600 mt-4">
                Your contribution will help build a living archive that reflects the diversity, strength, and spirit of the Red River Métis community.
            </p>
            <div className="mt-6 text-center bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm font-semibold text-red-900 uppercase tracking-wider">Contact Us</p>
              <p className="font-bold text-red-800 text-lg mt-1 break-all">
                metisshoebox@mmf.mb.ca
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;