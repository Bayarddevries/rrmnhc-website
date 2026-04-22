
import React, { useState, useMemo } from 'react';
import type { SlideshowConfig } from '../App';

interface SlideshowSetupProps {
  tags: string[];
  config: SlideshowConfig;
  onConfigChange: (newConfig: SlideshowConfig) => void;
  onStart: () => void;
  onCancel: () => void;
}

const STYLES = [
  { id: 'fade', name: 'Classic Fade', description: 'Simple, elegant cross-fade between photos.' },
  { id: 'kenburns', name: 'Ken Burns', description: 'Slowly pans and zooms across each image.' },
  { id: 'polaroid', name: 'Polaroid Drop', description: 'Photos drop into view with their captions.' },
  { id: 'scrapbook', name: 'Scrapbook', description: 'Photos are arranged on a page that fades.' },
  { id: 'filmstrip', name: 'Filmstrip', description: 'Images scroll by horizontally like a film reel.' },
];

const MUSIC_TRACKS = [
    { id: 'none', name: 'None' },
    { id: 'piano', name: 'Peaceful Piano' },
    { id: 'acoustic', name: 'Ambient Acoustic' },
];

const ORDER_OPTIONS = [
    { id: 'random', name: 'Random' },
    { id: 'newest', name: 'Newest First' },
    { id: 'oldest', name: 'Oldest First' },
];

const SlideshowSetup: React.FC<SlideshowSetupProps> = ({ tags, config, onConfigChange, onStart, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleTag = (tag: string) => {
    const newIncluded = new Set(config.includedTags);
    if (newIncluded.has(tag)) {
      newIncluded.delete(tag);
    } else {
      newIncluded.add(tag);
    }
    onConfigChange({ ...config, includedTags: newIncluded });
  };
  
  const filteredTags = useMemo(() => {
    if (!searchTerm) return tags;
    return tags.filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tags, searchTerm]);

  const handleSelectAll = () => onConfigChange({ ...config, includedTags: new Set(tags) });
  const handleClearSelection = () => onConfigChange({ ...config, includedTags: new Set() });

  const OptionGroup: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-lg font-bold mb-2 text-gray-700">{title}</h4>
        {children}
    </div>
  );
  
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[9995] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col text-gray-800">
        <div className="p-6 border-b">
          <h2 className="text-3xl font-heading text-red-800 tracking-wider">Slideshow Options</h2>
          <p className="text-gray-600 mt-1">Customize your photo viewing experience.</p>
        </div>

        <div className="flex-grow flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
          {/* Left Column: Options */}
          <div className="w-full md:w-3/5 flex flex-col gap-4 overflow-y-auto pr-2">
            <OptionGroup title="Visual Style">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {STYLES.map(style => (
                        <div key={style.id} onClick={() => onConfigChange({ ...config, style: style.id })}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${ config.style === style.id ? 'border-red-600 bg-red-50 shadow-md' : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'}`}>
                        <h5 className="font-bold text-md text-red-900">{style.name}</h5>
                        <p className="text-xs text-gray-600">{style.description}</p>
                        </div>
                    ))}
                </div>
            </OptionGroup>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <OptionGroup title="Photo Order">
                    <div className="space-y-2">
                        {ORDER_OPTIONS.map(opt => (
                            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="order" value={opt.id} checked={config.order === opt.id} onChange={() => onConfigChange({ ...config, order: opt.id as any })} className="form-radio h-4 w-4 text-red-600"/>
                                <span className="text-sm font-medium">{opt.name}</span>
                            </label>
                        ))}
                    </div>
                </OptionGroup>
                <OptionGroup title="Background Music">
                    <div className="space-y-2">
                        {MUSIC_TRACKS.map(track => (
                            <label key={track.id} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="music" value={track.id} checked={config.music === track.id} onChange={() => onConfigChange({ ...config, music: track.id })} className="form-radio h-4 w-4 text-red-600"/>
                                <span className="text-sm font-medium">{track.name}</span>
                            </label>
                        ))}
                    </div>
                </OptionGroup>
            </div>
            
            <OptionGroup title="Timing">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="speed-slider" className="text-sm font-medium text-gray-700">Slide Duration</label>
                        <span className="text-sm font-bold text-red-800">{config.speed / 1000}s</span>
                    </div>
                    <input 
                        id="speed-slider"
                        type="range" 
                        min="2000" 
                        max="20000" 
                        step="500" 
                        value={config.speed} 
                        onChange={(e) => onConfigChange({...config, speed: Number(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Fast (2s)</span>
                        <span>Slow (20s)</span>
                    </div>
                </div>
            </OptionGroup>

             <OptionGroup title="Display Options">
                 <label htmlFor="captions-toggle" className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                        <input id="captions-toggle" type="checkbox" className="sr-only" checked={config.showCaptions} onChange={() => onConfigChange({...config, showCaptions: !config.showCaptions})} />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${config.showCaptions ? 'bg-red-600' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.showCaptions ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-sm font-medium">Show Photo Captions</span>
                </label>
            </OptionGroup>
          </div>
          
          {/* Right Column: Tag Filtering */}
          <div className="w-full md:w-2/5 flex flex-col border-l pl-6">
            <h3 className="text-xl font-bold mb-2">Filter Photos by Tag</h3>
            <p className="text-xs text-gray-500 mb-3">
                Select tags to include in the slideshow. If no tags are selected, <strong>all photos</strong> will be shown.
            </p>
            <input type="text" placeholder="Search tags..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-2" />
            <div className="flex gap-2 mb-2">
                <button onClick={handleSelectAll} className="flex-1 text-xs bg-gray-200 hover:bg-gray-300 p-1 rounded">Select All</button>
                <button onClick={handleClearSelection} className="flex-1 text-xs bg-gray-200 hover:bg-gray-300 p-1 rounded">Clear Selection</button>
            </div>
            <div className="flex-grow border rounded-md p-2 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {filteredTags.map(tag => (
                  <button key={tag} onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 border ${
                        config.includedTags.has(tag) 
                        ? 'bg-red-600 text-white border-red-700 shadow-sm' 
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                    }`}>
                    {tag.startsWith('Name: ') ? tag.substring(6) : tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-4 bg-gray-50">
          <button onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onStart} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            Start Slideshow
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideshowSetup;
