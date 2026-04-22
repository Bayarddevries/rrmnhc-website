
import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon } from './Icons';

interface UploadScreenProps {
  onUpload: (files: FileList) => void;
  isProcessing?: boolean;
  progress?: { current: number, total: number };
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onUpload, isProcessing, progress }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onUpload(event.target.files);
    }
  };

  const handleUploadClick = () => {
    if (isProcessing) return;
    fileInputRef.current?.click();
  };
  
  const handleDragEvents = useCallback((e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (isProcessing) return;
    setIsDragging(isEntering);
  }, [isProcessing]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isProcessing) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  }, [onUpload, isProcessing]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 w-full">
      <h1 className="text-5xl font-heading tracking-wider text-white mb-4 text-center" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
        Red River Métis Shoebox
      </h1>

      <div
        onClick={handleUploadClick}
        onDragEnter={e => handleDragEvents(e, true)}
        onDragLeave={e => handleDragEvents(e, false)}
        onDragOver={e => handleDragEvents(e, true)}
        onDrop={handleDrop}
        className={`w-full max-w-2xl mt-12 border-4 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ${isProcessing ? 'border-red-400 bg-white/5 cursor-wait' : isDragging ? 'border-red-500 bg-white/20 scale-105 cursor-pointer' : 'border-white/50 bg-white/10 hover:border-red-400 hover:bg-white/15 cursor-pointer'}`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-2xl font-semibold text-white">Processing Photos...</p>
            {progress && progress.total > 0 && (
              <div className="mt-4 w-64 bg-white/20 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-red-500 h-full transition-all duration-300" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
                <p className="mt-2 text-sm text-gray-300">{progress.current} of {progress.total} photos</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <UploadIcon />
            <p className="mt-4 text-2xl font-semibold text-white">Tap or Drag Photos &amp; Stories Here</p>
            <p className="mt-1 text-gray-300">
                Upload images, audio, and text files. The app will help you link them.
            </p>
          </>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*,.heic,.heif,text/plain,audio/*,application/json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default UploadScreen;