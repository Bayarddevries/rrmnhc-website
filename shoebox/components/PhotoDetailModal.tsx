
import React from 'react';
import type { Photo, Story } from '../types';
import { CloseIcon, FileIconAudio, LocationIcon } from './Icons';

interface PhotoDetailModalProps {
  photo: Photo;
  stories: Story[];
  onClose: () => void;
  onUpdatePhoto: (id: string, updates: Partial<Photo>) => void;
}

const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({ photo, stories, onClose, onUpdatePhoto }) => {
  const [isEditingLocation, setIsEditingLocation] = React.useState(false);
  const [tempLocation, setTempLocation] = React.useState(photo.location || '');
  
  const sortedKeywords = photo.keywords ? [...photo.keywords].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())) : [];

  const handleSaveLocation = () => {
    onUpdatePhoto(photo.id, { 
      location: tempLocation,
      lat: undefined, // Clear coordinates to re-trigger geocoding
      lng: undefined
    });
    setIsEditingLocation(false);
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000] p-4 sm:p-8"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-in-out' }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
      >
        {/* Left Side: Image Display */}
        <div className="w-full md:w-1/2 lg:w-3/5 bg-black flex items-center justify-center relative p-4 group">
            <img 
              src={photo.src} 
              alt={photo.alt} 
              className="max-h-full max-w-full object-contain"
            />
            <button 
                onClick={onClose}
                className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors md:hidden"
            >
                <CloseIcon />
            </button>
        </div>

        {/* Right Side: Metadata & Stories */}
        <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 z-10 hidden md:block">
                <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition-colors"
                >
                    <CloseIcon className="h-8 w-8" />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar">
                
                {/* Header Info */}
                <div className="mb-6 pr-10">
                    <h2 className={`text-3xl md:text-4xl font-heading font-bold text-gray-900 leading-tight mb-2 ${photo.fontClass}`}>
                        {photo.title || "Untitled Photo"}
                    </h2>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 font-medium uppercase tracking-wide">
                        {photo.lastModified && (
                            <span>{new Date(photo.lastModified).toLocaleDateString()}</span>
                        )}
                        {photo.location || isEditingLocation ? (
                            <div className="flex items-center gap-1">
                                <LocationIcon className="h-4 w-4 text-red-600" />
                                {isEditingLocation ? (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            value={tempLocation} 
                                            onChange={e => setTempLocation(e.target.value)}
                                            className="bg-gray-100 border border-gray-300 rounded px-2 py-0.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 w-48 normal-case"
                                            placeholder="City, Province, Country"
                                            autoFocus
                                            onKeyDown={e => e.key === 'Enter' && handleSaveLocation()}
                                        />
                                        <button onClick={handleSaveLocation} className="text-emerald-600 hover:text-emerald-700 font-bold">Save</button>
                                        <button onClick={() => setIsEditingLocation(false)} className="text-gray-400 hover:text-gray-600">Cancel</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 group/loc">
                                        <span>{photo.location}</span>
                                        <button 
                                            onClick={() => {
                                                setTempLocation(photo.location || '');
                                                setIsEditingLocation(true);
                                            }}
                                            className="opacity-0 group-hover/loc:opacity-100 text-[10px] text-red-600 hover:underline transition-opacity"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsEditingLocation(true)}
                                className="text-red-600 hover:underline font-bold flex items-center gap-1"
                            >
                                <LocationIcon className="h-4 w-4" />
                                <span>+ Add Location</span>
                            </button>
                        )}
                        {photo.lat && photo.lng && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs opacity-60">GPS: {photo.lat.toFixed(4)}, {photo.lng.toFixed(4)}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Caption - Prominent */}
                {photo.caption && (
                    <div className="mb-8">
                        <div className="pl-4 border-l-4 border-red-600">
                            <p className="text-gray-800 text-lg italic leading-relaxed">
                                {photo.caption}
                            </p>
                        </div>
                    </div>
                )}

                {/* Divider */}
                <hr className="border-gray-200 mb-6" />

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 gap-6 text-sm mb-6">
                    {/* People */}
                    {photo.people && (
                        <div>
                            <h4 className="font-bold text-gray-400 uppercase text-xs tracking-wider mb-1">People</h4>
                            <p className="text-gray-800 font-medium">{photo.people}</p>
                        </div>
                    )}
                    
                    {/* Tags */}
                    {sortedKeywords.length > 0 && (
                        <div>
                            <h4 className="font-bold text-gray-400 uppercase text-xs tracking-wider mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {sortedKeywords.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Copyright */}
                    {photo.copyright && (
                        <div>
                            <h4 className="font-bold text-gray-400 uppercase text-xs tracking-wider mb-1">Copyright / Rights</h4>
                            <p className="text-gray-700">{photo.copyright}</p>
                        </div>
                    )}
                </div>

                {/* Technical EXIF Data (Collapsible/Small) */}
                {photo.exifData && Object.values(photo.exifData).some(v => v) && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-bold text-gray-400 uppercase text-xs tracking-wider mb-3">Image Details</h4>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                            {Object.entries(photo.exifData).map(([key, value]) => (
                                value ? (
                                    <div key={key}>
                                        <span className="text-gray-500 block">{key}</span>
                                        <span className="text-gray-900 font-medium">{value}</span>
                                    </div>
                                ) : null
                            ))}
                        </div>
                    </div>
                )}

                {/* Linked Stories Section */}
                {stories.length > 0 && (
                    <div className="mt-2">
                        <h3 className="font-heading text-xl font-bold text-red-800 mb-3 border-b border-red-100 pb-2">
                            Linked Stories
                        </h3>
                        <div className="space-y-4">
                            {stories.map(story => (
                                <div key={story.id} className="bg-red-50 rounded-lg p-4 border border-red-100">
                                    <div className="flex items-start justify-between">
                                        <h4 className="font-bold text-red-900 mb-1">{story.title}</h4>
                                        {story.audioSrc && <FileIconAudio className="h-5 w-5 text-red-400" />}
                                    </div>
                                    <p className="text-gray-800 text-sm line-clamp-3 mb-2">{story.text}</p>
                                    {story.audioSrc && (
                                        <audio controls src={story.audioSrc} className="w-full h-8 mt-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetailModal;
