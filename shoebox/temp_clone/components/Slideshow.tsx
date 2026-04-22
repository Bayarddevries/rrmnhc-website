
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Photo } from '../types';
import type { SlideshowConfig } from '../App';
import { CloseIcon } from './Icons';

interface SlideshowProps {
  photos: Photo[];
  config: SlideshowConfig;
  onExit: () => void;
}

const FADE_DURATION = 1500;

const KenBurnsSlide: React.FC<{ photo: Photo | null, speed: number }> = ({ photo, speed }) => {
    const animationClass = useMemo(() => {
        const classes = ['kenburns-tl', 'kenburns-tr', 'kenburns-bl', 'kenburns-br'];
        return classes[Math.floor(Math.random() * classes.length)];
    }, [photo]);

    if (!photo) return null;

    return (
        <div 
            className={`absolute inset-0 bg-cover bg-center ${animationClass}`}
            style={{ 
                backgroundImage: `url(${photo.src})`,
                animationDuration: `${speed * 1.5}ms`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDirection: 'alternate',
            }}
        />
    );
};

const Slideshow: React.FC<SlideshowProps> = ({ photos, config, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [key, setKey] = useState(Date.now());
  const [speed, setSpeed] = useState(config.speed || 7000); // Local state for dynamic speed adjustment
  const [showCaptions, setShowCaptions] = useState(config.showCaptions); // Local state for caption toggle
  const audioRef = useRef<HTMLAudioElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const photoCount = useMemo(() => {
    if (config.style === 'scrapbook') {
        return Math.ceil(photos.length / 4);
    }
    return photos.length;
  }, [photos, config.style]);

  useEffect(() => {
    if (photoCount <= 1) return;
    
    const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % photoCount);
        setKey(Date.now());
    }, speed);

    return () => clearInterval(timer);
  }, [photoCount, speed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (config.music !== 'none') {
        audio.src = `/music/${config.music}.mp3`;
        audio.play().catch(e => console.error("Audio play failed", e));
      } else {
        audio.pause();
      }
    }
  }, [config.music]);

  // Auto-hide controls logic
  const handleUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
    }, 3000); // Hide after 3 seconds of inactivity
  };

  useEffect(() => {
    handleUserActivity(); // Initial show
    return () => {
        if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const currentPhoto = photos[currentIndex];
  const prevPhoto = photos[(currentIndex - 1 + photos.length) % photos.length];

  const renderSlide = () => {
    if (photos.length === 0) return <div className="w-full h-full flex items-center justify-center text-white text-2xl">No photos to display.</div>;

    switch (config.style) {
      case 'kenburns':
        return <KenBurnsSlide photo={currentPhoto} speed={speed} />;
      
      case 'polaroid':
        const rotation = useMemo(() => Math.random() * 8 - 4, [currentPhoto]);
        return (
            <div key={key} className="w-full h-full flex items-center justify-center">
                 <div className="p-4 pb-16 bg-white shadow-xl relative" style={{ animation: `polaroid-drop 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`, '--rotation': `${rotation}deg` as any }}>
                    <img src={currentPhoto.src} alt={currentPhoto.alt} className="w-auto h-auto max-w-[60vw] max-h-[60vh] object-contain bg-gray-200" />
                    {showCaptions && currentPhoto.title && (
                        <div className="absolute bottom-4 left-4 right-4 h-12 flex items-center justify-center overflow-hidden">
                            <p className={`${currentPhoto.fontClass} text-gray-700 leading-tight text-center text-2xl max-w-full truncate`}>
                                {currentPhoto.title}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    
    case 'scrapbook':
        const photosPerPage = 4;
        const pageIndex = currentIndex;
        const pagePhotos = photos.slice(pageIndex * photosPerPage, (pageIndex + 1) * photosPerPage);
        return (
            <div key={key} className="w-full h-full flex items-center justify-center bg-gray-800" style={{ animation: `fadeIn ${FADE_DURATION}ms`}}>
                <div className="relative w-[80vw] h-[80vh]">
                {pagePhotos.map((p, i) => {
                    const styles = [
                        { transform: 'translate(5%, 10%) rotate(-8deg) scale(0.9)', zIndex: 1},
                        { transform: 'translate(45%, 5%) rotate(5deg)', zIndex: 2},
                        { transform: 'translate(15%, 40%) rotate(3deg) scale(1.1)', zIndex: 3},
                        { transform: 'translate(50%, 55%) rotate(-5deg)', zIndex: 1},
                    ];
                    return (
                        <div key={p.id} className="absolute p-3 pb-12 bg-white shadow-xl" style={styles[i % 4]}>
                           <img src={p.src} alt={p.alt} className="w-auto h-auto max-w-[25vw] max-h-[25vh] object-contain bg-gray-200" />
                           {showCaptions && p.title && (
                            <div className="absolute bottom-2 left-2 right-2 h-8 overflow-hidden flex items-center justify-center">
                                <p className={`${p.fontClass} text-gray-700 text-center text-lg truncate px-2`}>{p.title}</p>
                            </div>
                           )}
                        </div>
                    );
                })}
                </div>
            </div>
        );
    case 'filmstrip':
        const filmstripPhotos = [...photos, ...photos.slice(0, Math.ceil(window.innerWidth / 300))];
        const scrollDuration = Math.max(photos.length * (speed / 1000), 20); // Adjust scroll speed relative to duration setting
        return (
            <div className="w-full h-full flex items-center overflow-hidden bg-gray-900">
                <div key={key} className="flex-shrink-0 flex" style={{ animation: `filmstrip-scroll ${scrollDuration}s linear infinite` }}>
                    {filmstripPhotos.map((photo, index) => (
                        <div key={`${photo.id}-${index}`} className="p-4 flex-shrink-0 flex flex-col items-center justify-center">
                            <div className="p-2 bg-white shadow-lg">
                               <img src={photo.src} alt={photo.alt} className="h-[60vh] w-auto object-contain bg-gray-200" />
                            </div>
                            {showCaptions && photo.title && <p className="text-white mt-2 text-center text-lg w-72 truncate">{photo.title}</p>}
                        </div>
                    ))}
                </div>
            </div>
        );

      case 'fade':
      default:
        return (
            <div key={key}>
                <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${prevPhoto?.src})`, animation: `fadeIn ${FADE_DURATION}ms reverse forwards` }} />
                <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${currentPhoto.src})`, animation: `fadeIn ${FADE_DURATION}ms forwards` }} />
            </div>
        );
    }
  };

  return (
    <div 
      className={`absolute inset-0 bg-black z-[10000] overflow-hidden ${showControls ? 'cursor-default' : 'cursor-none'}`}
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
      onTouchStart={handleUserActivity}
    >
      {config.music !== 'none' && <audio ref={audioRef} loop />}
      
      {renderSlide()}

      {/* Main Slideshow Caption Overlay - Now displays TITLE instead of Caption field */}
      {showCaptions && currentPhoto?.title && !['polaroid', 'scrapbook', 'filmstrip'].includes(config.style) && (
        <div key={currentPhoto.id} className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 text-center" style={{ animation: `fadeIn ${FADE_DURATION}ms` }}>
            <p className="text-white text-xl font-semibold drop-shadow-md">{currentPhoto.title}</p>
        </div>
      )}

      {/* Control Overlay */}
      <div 
        className={`absolute top-4 right-4 flex flex-col items-end gap-2 transition-opacity duration-500 ease-in-out z-50 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()} 
      >
        <button
            onClick={onExit}
            className="bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-2 text-white transition-colors shadow-sm"
            aria-label="Exit slideshow"
        >
            <CloseIcon className="h-8 w-8" />
        </button>

        <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 shadow-lg mt-2 flex flex-col gap-1 w-48">
             <label className="text-xs text-white/80 font-bold uppercase tracking-wider flex justify-between">
                 <span>Speed</span>
                 <span>{speed/1000}s</span>
             </label>
             <input 
                type="range" 
                min="2000" 
                max="20000" 
                step="500" 
                value={speed} 
                onChange={(e) => {
                    setSpeed(Number(e.target.value));
                    handleUserActivity(); 
                }}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
            />
            
            <label className="flex items-center justify-between cursor-pointer mt-2 pt-2 border-t border-white/10">
                 <span className="text-xs text-white/80 font-bold uppercase tracking-wider">Captions</span>
                 <div className="relative">
                     <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={showCaptions} 
                        onChange={(e) => {
                             setShowCaptions(e.target.checked);
                             handleUserActivity();
                        }} 
                     />
                     <div className={`block w-8 h-4 rounded-full transition-colors ${showCaptions ? 'bg-white' : 'bg-white/30'}`}></div>
                     <div className={`absolute left-1 top-1 bg-gray-900 w-2 h-2 rounded-full transition-transform ${showCaptions ? 'translate-x-4' : ''}`}></div>
                 </div>
            </label>
        </div>
      </div>
    </div>
  );
};

export default Slideshow;
