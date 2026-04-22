
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import exifr from 'exifr';
import { Photo, Story, FilterState } from './types';
import UploadScreen from './components/UploadScreen';
import PhotoItem from './components/PhotoItem';
import PhotoDetailModal from './components/PhotoDetailModal';
import { ResetIcon, ShuffleIcon, DownloadIcon } from './components/Icons';
import WelcomeMessage from './components/WelcomeMessage';
import ShoeboxCover from './components/ShoeboxCover';
import Screensaver from './components/Screensaver';
import FilterNotification from './components/FilterNotification';
import SubFilter from './components/SubFilter';
import PhotoCycleControls from './components/PhotoCycleControls';
import LeftSidebar from './components/LeftSidebar';
import StoryViewer from './components/StoryViewer';
import StoryLinker from './components/StoryLinker';
import SlideshowSetup from './components/SlideshowSetup';
import Slideshow from './components/Slideshow';
import MapView from './components/MapView';
import { MapIcon, GridIcon } from './components/Icons';

const FONT_CLASSES = ['font-gochi-hand', 'font-patrick-hand', 'font-kalam', 'font-indie-flower'];
const IDLE_TIMEOUT = 120000; // 2 minutes
const MAX_IMAGE_DIMENSION = 1600; // Resize images to max 1600px width/height to save memory
const IMAGE_QUALITY = 0.8; // JPEG quality

// Utility to resize image before creating object URL
const compressImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > MAX_IMAGE_DIMENSION) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        }
      } else {
        if (height > MAX_IMAGE_DIMENSION) {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Compression failed'));
      }, 'image/jpeg', IMAGE_QUALITY);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
};

export interface SlideshowConfig {
  includedTags: Set<string>;
  style: string;
  showCaptions: boolean;
  order: 'random' | 'newest' | 'oldest';
  music: string;
  speed: number;
}

const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [appState, setAppState] = useState<'upload' | 'ready' | 'unpacked' | 'slideshowSetup' | 'slideshow'>('upload');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isWelcomeDismissed, setIsWelcomeDismissed] = useState(false);
  const [isCoverLifting, setIsCoverLifting] = useState(false);
  const createdUrlsRef = useRef<Set<string>>(new Set());
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<number | null>(null);

  const [familyNames, setFamilyNames] = useState<Map<string, Set<string>>>(new Map());
  const [keywordTags, setKeywordTags] = useState<Set<string>>(new Set());
  
  const [activeFilter, setActiveFilter] = useState<FilterState | null>(null);
  const [focusedPhotoId, setFocusedPhotoId] = useState<string | null>(null);

  const [geocodingCache, setGeocodingCache] = useState<Map<string, { lat: number, lng: number }>>(new Map());

  const [showStoryLinker, setShowStoryLinker] = useState(false);
  const [filesForLinker, setFilesForLinker] = useState<File[]>([]);
  const [initialManifestForLinker, setInitialManifestForLinker] = useState<any[]>([]);
  const [allUploadedFiles, setAllUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  
  const [slideshowConfig, setSlideshowConfig] = useState<SlideshowConfig>({
    includedTags: new Set(),
    style: 'fade',
    showCaptions: true,
    order: 'random',
    music: 'none',
    speed: 5000,
  });
  const [slideshowPhotos, setSlideshowPhotos] = useState<Photo[]>([]);
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(0);

  useEffect(() => {
    if (appState === 'unpacked') {
      const BATCH_SIZE = 20;
      const interval = setInterval(() => {
        setVisiblePhotoCount(prev => {
          if (prev >= photos.length) {
            clearInterval(interval);
            return prev;
          }
          return Math.min(prev + BATCH_SIZE, photos.length);
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setVisiblePhotoCount(0);
    }
  }, [appState, photos.length]);

  useEffect(() => {
    const geocodePhotos = async () => {
      // Find photos that need geocoding. 
      // We skip if we've already tried this exact location string and it failed (0,0)
      const photosToGeocode = photos.filter(p => {
        if (p.lat || !p.location) return false;
        const cached = geocodingCache.get(p.location);
        return !cached || (cached.lat !== 0 && cached.lng !== 0);
      });

      if (photosToGeocode.length === 0) return;

      // Only geocode one at a time to respect Nominatim rate limits
      const photo = photosToGeocode[0];
      const location = photo.location!;

      // Refine query: Append Canada if country is missing and it's a likely Canadian location
      let query = location;
      const lowerLoc = location.toLowerCase();
      if (!lowerLoc.includes('canada') && !lowerLoc.includes('usa') && !lowerLoc.includes('united states')) {
        query += ', Canada';
      }

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
          headers: {
            'User-Agent': 'RedRiverMetisShoebox/1.0 (Bayarddevries@gmail.com)'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();
        
        // Fallback: If full query fails, try just the city and province
        if ((!data || data.length === 0) && location.includes(',')) {
          const parts = location.split(',');
          if (parts.length > 1) {
            const fallbackQuery = parts.slice(-2).join(',') + ', Canada';
            const fallbackResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&limit=1`, {
              headers: {
                'User-Agent': 'RedRiverMetisShoebox/1.0 (Bayarddevries@gmail.com)'
              }
            });
            if (fallbackResponse.ok) {
              data = await fallbackResponse.json();
            }
          }
        }
        
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          
          setGeocodingCache(prev => {
            const next = new Map(prev);
            next.set(location, { lat, lng });
            return next;
          });

          setPhotos(prev => prev.map(p => 
            p.location === location ? { ...p, lat, lng } : p
          ));
        } else {
          // Mark as failed so we don't try again
          setGeocodingCache(prev => {
            const next = new Map(prev);
            next.set(location, { lat: 0, lng: 0 }); // 0,0 as sentinel for failed
            return next;
          });
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    };

    const timer = setTimeout(geocodePhotos, 500); // Wait 500ms between attempts
    return () => clearTimeout(timer);
  }, [photos, geocodingCache]);

  useEffect(() => {
    return () => {
      createdUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      if (photos.length > 0 && appState === 'unpacked' && !activeFilter?.value) {
        setIsIdle(true);
      }
    }, IDLE_TIMEOUT);
  }, [photos.length, appState, activeFilter]);

  useEffect(() => {
    if (appState === 'unpacked') {
      const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll'];
      
      const handleActivity = () => {
        resetIdleTimer();
      };
      
      // Throttle the event listeners slightly for performance
      let lastCall = 0;
      const throttledHandleActivity = () => {
        const now = Date.now();
        if (now - lastCall > 1000) {
            lastCall = now;
            handleActivity();
        }
      };
  
      resetIdleTimer();
      events.forEach(event => window.addEventListener(event, throttledHandleActivity, { passive: true }));
  
      return () => {
        if (idleTimerRef.current) {
          clearTimeout(idleTimerRef.current);
        }
        events.forEach(event => window.removeEventListener(event, throttledHandleActivity));
      };
    } else {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    }
  }, [appState, resetIdleTimer]);

  const handleWakeUp = () => {
    setIsIdle(false);
    resetIdleTimer();
  };

  const processFiles = useCallback(async (filesToProcess: File[], storyManifest?: any[]) => {
    const filesArray = Array.from(filesToProcess);
    const existingPhotoAlts = new Set(photos.map(p => p.alt));
    const imageFiles = filesArray.filter(f => f.type.startsWith('image/') && !existingPhotoAlts.has(f.name));
    const storyManifestFile = filesArray.find(f => f.name.toLowerCase() === 'stories.json');
    const textFiles = new Map(filesArray.filter(f => f.type === 'text/plain').map(f => [f.name, f]));
    const audioFiles = new Map(filesArray.filter(f => f.type.startsWith('audio/')).map(f => [f.name, f]));

    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: imageFiles.length });

    let photosForProcessing = [...photos];
    let storiesForProcessing = [...stories];

    if (photos.length > 0) {
        const allUploadedFileNames = new Set(filesArray.map(f => f.name));
        const storyIdsToDelete = new Set<string>();

        stories.forEach(story => {
            const hasSourceFiles = story.textFile || story.audioFile;
            const textFileRemoved = story.textFile && !allUploadedFileNames.has(story.textFile);
            const audioFileRemoved = story.audioFile && !allUploadedFileNames.has(story.audioFile);

            if (hasSourceFiles && (textFileRemoved || audioFileRemoved)) {
                storyIdsToDelete.add(story.id);
            }
        });
        
        if (storyIdsToDelete.size > 0) {
            storiesForProcessing = stories.filter(s => !storyIdsToDelete.has(s.id));
            photosForProcessing = photos.map(p => {
                if (!p.storyIds) return p;
                const newStoryIds = p.storyIds.filter(id => !storyIdsToDelete.has(id));
                return newStoryIds.length < p.storyIds.length ? { ...p, storyIds: newStoryIds } : p;
            });
        }
    }
    
    const startingIndex = photosForProcessing.length;
    const BATCH_SIZE = 5;
    const allValidNewPhotos: Photo[] = [];

    for (let i = 0; i < imageFiles.length; i += BATCH_SIZE) {
        const batch = imageFiles.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (file, indexInBatch): Promise<Photo | null> => {
            const globalIndex = i + indexInBatch;
            let metadata = { 
                title: '', 
                caption: '', 
                people: '', 
                location: '', 
                copyright: '',
                keywords: [] as string[],
                exifData: {} as Record<string, any>
            };
            let photoDate = file.lastModified;
            let lat: number | undefined;
            let lng: number | undefined;

            try {
                // STRATEGY: Parse ALL metadata blocks independently.
                const parsedMeta = await exifr.parse(file, {
                    tiff: true,
                    xmp: true,
                    iptc: true,
                    ifd0: true, 
                    gps: true,
                    mergeOutput: false,
                    reviveValues: true
                } as any);
                
                // Helper to repair UTF-8 misread as Latin-1 (Mojibake)
                const repairText = (str: string): string => {
                    if (!str) return '';
                    let fixed = str
                        .replace(/Ã©/g, 'é')
                        .replace(/Ã¨/g, 'è')
                        .replace(/Ã /g, 'à')
                        .replace(/Ã¢/g, 'â')
                        .replace(/Ã§/g, 'ç')
                        .replace(/Ãª/g, 'ê')
                        .replace(/Ã«/g, 'ë')
                        .replace(/Ã®/g, 'î')
                        .replace(/Ã¯/g, 'ï')
                        .replace(/Ã´/g, 'ô')
                        .replace(/Ã»/g, 'û')
                        .replace(/Ã¹/g, 'ù')
                        .replace(/Ã€/g, 'À')
                        .replace(/Ã‰/g, 'É')
                        .replace(/Ãˆ/g, 'È')
                        .replace(/Ã‡/g, 'Ç')
                        .replace(/Ã\xa0/g, 'à') // à (UTF-8: C3 A0) read as Ã + nbsp
                        .replace(/Å½/g, 'é') // Double Mojibake case: é -> Ž -> Å½
                        .replace(/Å“/g, 'œ')
                        .replace(/â‚¬/g, '€')
                        .replace(/â€™/g, "'")
                        .replace(/â€œ/g, '"')
                        .replace(/â€\?/g, '"')
                        .replace(/â€“/g, '–')
                        .replace(/â€”/g, '—');
                    
                    // Specific common misreads
                    fixed = fixed.replace(/M©tis/g, 'Métis');
                    fixed = fixed.replace(/CÅ½cile/g, 'Cécile');
                    
                    return fixed;
                };

                // Helper to extract text from strings, arrays, XMP Lang Alt objects
                const extractText = (val: any): string => {
                    if (val === undefined || val === null) return '';
                    
                    let result = '';
                    
                    if (val instanceof Uint8Array) {
                        try {
                            result = new TextDecoder().decode(val).replace(/\0/g, '').trim();
                        } catch (e) {
                            result = '';
                        }
                    }
                    else if (typeof val === 'string') result = val.trim().replace(/\0/g, '');
                    else if (Array.isArray(val)) {
                        const valid = val.map(v => extractText(v)).filter(Boolean);
                        result = valid.join(', ');
                    }
                    else if (typeof val === 'object') {
                        if (val.value) result = String(val.value).trim();
                        else if (val['x-default']) result = String(val['x-default']).trim();
                        else {
                            const langs = ['en', 'en-US', 'en-CA', 'fr', 'fr-CA'];
                            let found = '';
                            for (const lang of langs) {
                                if (val[lang]) { found = String(val[lang]).trim(); break; }
                            }
                            if (!found) {
                                 const values = Object.values(val);
                                 if (values.length > 0) found = extractText(values[0]);
                            }
                            result = found;
                        }
                    }
                    else result = String(val).trim();
                    
                    return repairText(result);
                };

                // --- TITLE EXTRACTION ---
                // EXPLICITLY EXCLUDING ImageDescription from Title candidates to avoid long AI summaries appearing as titles
                const titleCandidates = [
                    parsedMeta.xmp?.['dc:title'],          
                    parsedMeta.xmp?.title,                 
                    parsedMeta.xmp?.Title,                 
                    parsedMeta.iptc?.Headline,             
                    parsedMeta.xmp?.Headline,              
                    parsedMeta.ifd0?.XPTitle,              
                    parsedMeta.iptc?.ObjectName,           
                    parsedMeta.iptc?.Title,                
                ];

                let title = '';
                for (const candidate of titleCandidates) {
                    const text = extractText(candidate);
                    if (text && text.toLowerCase() !== 'default') {
                        title = text;
                        break;
                    }
                }

                metadata.title = title;

                // Fallback: Nice filename if no title found at all
                if (!metadata.title) {
                    let niceName = file.name.substring(0, file.name.lastIndexOf('.')); 
                    niceName = niceName.replace(/[-_]/g, ' '); 
                    if (!/^(IMG|DSC|PXL|MVI|VID)_\d+$/i.test(niceName)) {
                        metadata.title = niceName;
                    } else {
                        metadata.title = file.name; 
                    }
                }

                // --- CAPTION EXTRACTION ---
                let caption = '';
                
                const captionCandidates = [
                     parsedMeta.xmp?.['dc:description'],
                     parsedMeta.xmp?.description,
                     parsedMeta.xmp?.Description,
                     parsedMeta.xmp?.Label,
                     parsedMeta.iptc?.['Caption-Abstract'],
                     parsedMeta.iptc?.Caption,
                     parsedMeta.ifd0?.ImageDescription,
                     parsedMeta.tiff?.ImageDescription, // ImageDescription belongs in Caption, not Title
                     parsedMeta.exif?.ImageDescription,
                     parsedMeta.ifd0?.XPComment,
                     parsedMeta.exif?.UserComment
                ];

                for (const candidate of captionCandidates) {
                    const text = extractText(candidate);
                    // Ensure caption isn't just the title duplicated
                    if (text && text !== metadata.title) {
                        caption = text;
                        break;
                    }
                }

                metadata.caption = caption;

                // --- COPYRIGHT EXTRACTION ---
                let copyright = '';
                const copyrightCandidates = [
                    parsedMeta.xmp?.['dc:rights'],
                    parsedMeta.xmp?.rights,
                    parsedMeta.iptc?.CopyrightNotice,
                    parsedMeta.exif?.Copyright,
                    parsedMeta.tiff?.Copyright
                ];
                for (const candidate of copyrightCandidates) {
                     const text = extractText(candidate);
                     if (text) {
                         copyright = text;
                         break;
                     }
                }
                metadata.copyright = copyright;

                // --- KEYWORD EXTRACTION (UNRESTRICTED) ---
                const keywordSet = new Set<string>();

                const addKeywords = (source: any) => {
                    if (!source) return;
                    
                    if (typeof source === 'string') {
                        repairText(source).replace(/\0/g, '')
                              .split(/[;,|>]/) 
                              .map(k => k.trim())
                              .filter(k => k.length > 0 && k !== 'undefined' && k !== 'null')
                              .forEach(k => keywordSet.add(k));
                    } 
                    else if (Array.isArray(source)) {
                        source.forEach(item => addKeywords(item));
                    } 
                    else if (source instanceof Set) {
                        source.forEach(item => addKeywords(item));
                    }
                    else if (typeof source === 'object') {
                        if (source.Bag) addKeywords(source.Bag);
                        else if (source.Seq) addKeywords(source.Seq);
                        else if (source.li) addKeywords(source.li);
                        else if (source.value) addKeywords(source.value);
                        else {
                            Object.values(source).forEach(val => addKeywords(val));
                        }
                    }
                };

                addKeywords(parsedMeta.xmp?.subject);               
                addKeywords(parsedMeta.xmp?.['dc:subject']);        
                addKeywords(parsedMeta.xmp?.keywords);              
                addKeywords(parsedMeta.iptc?.keywords);             
                addKeywords(parsedMeta.iptc?.Keywords);             
                addKeywords(parsedMeta.ifd0?.XPKeywords);           
                addKeywords(parsedMeta.xmp?.hierarchicalSubject);   
                addKeywords(parsedMeta.xmp?.['lr:hierarchicalSubject']); 
                addKeywords(parsedMeta.xmp?.LastKeywordXMP);        
                addKeywords(parsedMeta.xmp?.CatalogSets);           

                keywordSet.delete(file.name);
                
                // --- LOCATION ---
                const city = extractText(parsedMeta.iptc?.City || parsedMeta.xmp?.City || parsedMeta.xmp?.['photoshop:City']);
                const state = extractText(parsedMeta.iptc?.['Province-State'] || parsedMeta.xmp?.State || parsedMeta.xmp?.['photoshop:State']);
                const country = extractText(parsedMeta.iptc?.['Country-Primary-Location-Name'] || parsedMeta.xmp?.Country || parsedMeta.xmp?.['photoshop:Country']);
                const subLocation = extractText(parsedMeta.iptc?.['Sub-location'] || parsedMeta.xmp?.['Iptc4xmpCore:Location'] || parsedMeta.iptc?.LocationName);
                
                const locParts = [subLocation, city, state, country].filter(Boolean);
                metadata.location = locParts.join(', ');
                
                if (metadata.location) {
                    metadata.location.split(',').forEach(part => keywordSet.add(part.trim()));
                }
                
                metadata.keywords = Array.from(keywordSet);

                // --- GPS EXTRACTION ---
                if (parsedMeta.gps) {
                    lat = parsedMeta.gps.latitude;
                    lng = parsedMeta.gps.longitude;
                } else if (parsedMeta.ifd0?.GPSLatitude && parsedMeta.ifd0?.GPSLongitude) {
                    // Some older EXIF might be here
                    lat = parsedMeta.ifd0.GPSLatitude;
                    lng = parsedMeta.ifd0.GPSLongitude;
                }

                // --- PEOPLE --- 
                const peopleSource = parsedMeta.iptc?.PersonInImage || parsedMeta.xmp?.PersonInImage;
                if (peopleSource) {
                     const peopleList = Array.isArray(peopleSource) ? peopleSource : [peopleSource];
                     metadata.people = peopleList.map(p => extractText(p)).join(', ');
                }

                // --- TECHNICAL EXIF ---
                const flatExif = { ...parsedMeta.tiff, ...parsedMeta.exif, ...parsedMeta.ifd0 };
                
                metadata.exifData = {
                    'Camera Make': extractText(flatExif.Make),
                    'Camera Model': extractText(flatExif.Model),
                    'Lens': extractText(flatExif.LensModel),
                    'ISO': flatExif.ISO,
                    'Aperture': flatExif.FNumber ? `f/${flatExif.FNumber}` : undefined,
                    'Shutter Speed': flatExif.ExposureTime ? (flatExif.ExposureTime < 1 ? `1/${Math.round(1/flatExif.ExposureTime)}` : `${flatExif.ExposureTime}s`) : undefined,
                    'Dimensions': (flatExif.PixelXDimension && flatExif.PixelYDimension) ? `${flatExif.PixelXDimension} x ${flatExif.PixelYDimension}` : undefined
                };
                
                // Date
                if (parsedMeta.exif?.DateTimeOriginal instanceof Date) photoDate = parsedMeta.exif.DateTimeOriginal.getTime();
                else if (parsedMeta.xmp?.CreateDate instanceof Date) photoDate = parsedMeta.xmp.CreateDate.getTime();
                else if (parsedMeta.tiff?.DateTime instanceof Date) photoDate = parsedMeta.tiff.DateTime.getTime();

            } catch (error) { 
                console.warn(`Could not parse metadata for ${file.name}:`, error); 
            }
            
            try {
                // COMPRESS IMAGE
                const compressedBlob = await compressImage(file);
                const src = URL.createObjectURL(compressedBlob);
                createdUrlsRef.current.add(src);
                const rotation = Math.random() * 50 - 25;
                const scale = 0.9 + Math.random() * 0.2;
                
                const x = window.innerWidth * 0.1 + Math.random() * (window.innerWidth * 0.7);
                const y = window.innerHeight * 0.1 + Math.random() * (window.innerHeight * 0.6);

                return {
                    id: `photo_${Date.now()}_${globalIndex}_${Math.random().toString(36).substr(2, 9)}`, src, alt: file.name, ...metadata,
                    lat, lng,
                    position: { x, y },
                    rotation, initialRotation: rotation, zIndex: startingIndex + globalIndex, isPinned: false, scale, initialScale: scale, lastModified: photoDate,
                    animationDelay: (startingIndex + globalIndex) * 75, animationDuration: 800 + Math.random() * 500,
                    fontClass: FONT_CLASSES[Math.floor(Math.random() * FONT_CLASSES.length)],
                };
            } catch(e) { console.error("Error creating object URL for file", file.name, e); return null; }
        });
        
        const batchResults = await Promise.all(batchPromises);
        const validBatchPhotos = batchResults.filter((p): p is Photo => p !== null);
        allValidNewPhotos.push(...validBatchPhotos);
        
        // Update state incrementally
        setPhotos([...photosForProcessing, ...allValidNewPhotos]);
        setProcessingProgress({ current: Math.min(i + BATCH_SIZE, imageFiles.length), total: imageFiles.length });
        
        // Transition to ready state as soon as we have at least one photo
        if (appState === 'upload' && allValidNewPhotos.length > 0) {
            setAppState('ready');
        }
    }

    const storyPromise = storyManifest ? Promise.resolve(storyManifest) : (storyManifestFile ? storyManifestFile.text().then(JSON.parse) : Promise.resolve([]));
    const storyManifestData = await storyPromise;

    const newStoriesWithTempData = await Promise.all(storyManifestData.map(async (storyData: any) => {
      const textFile = textFiles.get(storyData.text_file);
      const text = textFile ? await textFile.text() : '';
      
      const audioFile = audioFiles.get(storyData.audio_file);
      let audioSrc = '';
      if (audioFile) {
        audioSrc = URL.createObjectURL(audioFile);
        createdUrlsRef.current.add(audioSrc);
      }

      return {
        id: storyData.id,
        title: storyData.title,
        text,
        audioSrc,
        textFile: storyData.text_file || undefined,
        audioFile: storyData.audio_file || undefined,
        _photo_files: storyData.photo_files || []
      };
    }));

    if (newStoriesWithTempData.length > 0) {
        const photoMapByAlt = new Map([...photosForProcessing, ...allValidNewPhotos].map(p => [p.alt, p.id]));
  
        const finalNewStories: Story[] = newStoriesWithTempData.map(story => {
          const photoIds = story._photo_files
              .map((name: string) => photoMapByAlt.get(name))
              .filter((id: string | undefined): id is string => id !== undefined);
          const { _photo_files, ...rest } = story;
          return { ...rest, photoIds };
        });
  
        const updatedPhotosWithStories = [...photosForProcessing, ...allValidNewPhotos].map(photo => {
          const linkedStoryIds = finalNewStories
            .filter(s => s.photoIds.includes(photo.id))
            .map(s => s.id);
          if (linkedStoryIds.length > 0) {
            return { ...photo, storyIds: [...(photo.storyIds || []), ...linkedStoryIds] };
          }
          return photo;
        });
        
        const finalPhotos = updatedPhotosWithStories;
        setPhotos(finalPhotos);
        setStories([...storiesForProcessing, ...finalNewStories]);

        // Update tags and family names
        const newFamilyNames = new Map<string, Set<string>>();
        const newKeywordTags = new Set<string>();
        finalPhotos.forEach(p => {
          if (p.people) {
              p.people.split(',').map(name => name.trim()).filter(Boolean).forEach(name => {
                const parts = name.split(' ').filter(Boolean);
                if (parts.length > 1) {
                  const lastName = parts.pop()!;
                  const firstName = parts.join(' ');
                  if (!newFamilyNames.has(lastName)) newFamilyNames.set(lastName, new Set());
                  newFamilyNames.get(lastName)!.add(firstName);
                }
              });
          }
          if (p.keywords) p.keywords.forEach(kw => newKeywordTags.add(kw.trim()));
        });
        setFamilyNames(newFamilyNames);
        setKeywordTags(newKeywordTags);
    } else {
        setStories(storiesForProcessing);
        
        // Update tags and family names for photos without new stories
        const finalPhotos = [...photosForProcessing, ...allValidNewPhotos];
        const newFamilyNames = new Map<string, Set<string>>();
        const newKeywordTags = new Set<string>();
        finalPhotos.forEach(p => {
          if (p.people) {
              p.people.split(',').map(name => name.trim()).filter(Boolean).forEach(name => {
                const parts = name.split(' ').filter(Boolean);
                if (parts.length > 1) {
                  const lastName = parts.pop()!;
                  const firstName = parts.join(' ');
                  if (!newFamilyNames.has(lastName)) newFamilyNames.set(lastName, new Set());
                  newFamilyNames.get(lastName)!.add(firstName);
                }
              });
          }
          if (p.keywords) p.keywords.forEach(kw => newKeywordTags.add(kw.trim()));
        });
        setFamilyNames(newFamilyNames);
        setKeywordTags(newKeywordTags);
    }
    
    setIsProcessing(false);
    setProcessingProgress({ current: 0, total: 0 });
  }, [photos, stories, appState]);
  
  const getBaseName = (filename: string): string => {
    let name = filename.substring(0, filename.lastIndexOf('.')).toLowerCase();
    name = name.replace(/_story|_audio|_text/g, ''); 
    name = name.replace(/[-_]/g, ' '); 
    name = name.replace(/ \d+$/g, ''); 
    return name.trim();
  };
  
  const handleFileUpload = (uploadedFiles: FileList) => {
    const files = Array.from(uploadedFiles);
    setAllUploadedFiles(prev => [...prev, ...files]);
    const hasStoryManifest = files.some(f => f.name.toLowerCase() === 'stories.json');
    
    if (hasStoryManifest) {
      processFiles(files);
      return;
    }

    const filesByBaseName = new Map<string, { images: File[], texts: File[], audios: File[] }>();
    for (const file of files) {
      const baseName = getBaseName(file.name);
      if (!filesByBaseName.has(baseName)) {
        filesByBaseName.set(baseName, { images: [], texts: [], audios: [] });
      }
      const group = filesByBaseName.get(baseName)!;
      if (file.type.startsWith('image/')) group.images.push(file);
      else if (file.type === 'text/plain') group.texts.push(file);
      else if (file.type.startsWith('audio/')) group.audios.push(file);
    }

    const autoManifest: any[] = [];
    const linkedStoryFiles = new Set<File>();

    for (const [baseName, group] of filesByBaseName.entries()) {
      const isStory = group.texts.length > 0 || group.audios.length > 0;
      if (isStory && group.images.length > 0) {
        const title = baseName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        autoManifest.push({
          id: `story_autolink_${Date.now()}_${autoManifest.length}_${Math.random().toString(36).substr(2, 9)}`,
          title: title || 'Untitled Story',
          text_file: group.texts[0]?.name || null,
          audio_file: group.audios[0]?.name || null,
          photo_files: group.images.map(f => f.name),
        });

        group.texts.forEach(f => linkedStoryFiles.add(f));
        group.audios.forEach(f => linkedStoryFiles.add(f));
      }
    }

    const allStoryFiles = files.filter(f => f.type === 'text/plain' || f.type.startsWith('audio/'));
    const unlinkedStoryFiles = allStoryFiles.filter(f => !linkedStoryFiles.has(f));

    if (unlinkedStoryFiles.length > 0) {
      const unlinkedManifest: any[] = [];
      const unlinkedGroups = new Map<string, { texts: File[], audios: File[] }>();
      
      for(const file of unlinkedStoryFiles) {
          const baseName = getBaseName(file.name);
          if (!unlinkedGroups.has(baseName)) {
              unlinkedGroups.set(baseName, { texts: [], audios: [] });
          }
          const group = unlinkedGroups.get(baseName)!;
          if (file.type === 'text/plain') group.texts.push(file);
          else if (file.type.startsWith('audio/')) group.audios.push(file);
      }
      
      for (const [baseName, group] of unlinkedGroups.entries()) {
          const title = baseName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          unlinkedManifest.push({
              id: `story_unlinked_${baseName.replace(/\s/g, '_')}_${unlinkedManifest.length}_${Math.random().toString(36).substr(2, 9)}`,
              title: title || 'Untitled Story',
              text_file: group.texts[0]?.name || null,
              audio_file: group.audios[0]?.name || null,
              photo_files: [],
          });
      }
      
      const finalManifest = [...autoManifest, ...unlinkedManifest];
      setFilesForLinker([...allUploadedFiles, ...files]);
      setInitialManifestForLinker(finalManifest);
      setShowStoryLinker(true);
    } else {
      processFiles(files, autoManifest);
    }
  };

  const handleLinkerComplete = async (manifest: any[], originalFiles: File[]) => {
    setShowStoryLinker(false);
    
    if (appState === 'unpacked') {
        const textFiles = new Map(originalFiles.filter(f => f.type === 'text/plain').map(f => [f.name, f]));
        const audioFiles = new Map(originalFiles.filter(f => f.type.startsWith('audio/')).map(f => [f.name, f]));
        
        const newStories: Story[] = await Promise.all(manifest.map(async (storyData: any) => {
          const textFile = textFiles.get(storyData.text_file);
          const text = textFile ? await textFile.text() : '';
          
          const audioFile = audioFiles.get(storyData.audio_file);
          let audioSrc = '';
          if (audioFile) {
            audioSrc = URL.createObjectURL(audioFile);
            createdUrlsRef.current.add(audioSrc);
          }

          const photoMapByAlt = new Map(photos.map(p => [p.alt, p.id]));
          const photoIds = (storyData.photo_files || [])
              .map((name: string) => photoMapByAlt.get(name))
              .filter((id: any): id is string => id !== undefined);

          return {
            id: storyData.id,
            title: storyData.title,
            text,
            audioSrc,
            textFile: storyData.text_file || undefined,
            audioFile: storyData.audio_file || undefined,
            photoIds
          };
        }));

        setStories(newStories);
        
        // Update photos
        setPhotos(prev => prev.map(photo => {
          const linkedStoryIds = newStories
            .filter(s => s.photoIds.includes(photo.id))
            .map(s => s.id);
          return { ...photo, storyIds: linkedStoryIds };
        }));
    } else {
        processFiles(originalFiles, manifest);
    }

    setFilesForLinker([]);
    setInitialManifestForLinker([]);
  };
  
  const handleLinkerCancel = () => {
    setShowStoryLinker(false);
    setFilesForLinker([]);
    setInitialManifestForLinker([]);
  };

  const handleEditStories = useCallback(() => {
    const manifest = stories.map(s => ({
        id: s.id,
        title: s.title,
        text_file: s.textFile || null,
        audio_file: s.audioFile || null,
        photo_files: photos.filter(p => p.storyIds?.includes(s.id)).map(p => p.alt)
    }));
    setFilesForLinker(allUploadedFiles);
    setInitialManifestForLinker(manifest);
    setShowStoryLinker(true);
  }, [stories, photos, allUploadedFiles]);

  const handleExportStories = useCallback(() => {
    if (stories.length === 0) {
        alert("There are no stories to export.");
        return;
    }

    const photoIdToAltMap = new Map(photos.map(p => [p.id, p.alt]));

    const manifestData = stories.map(story => ({
        id: story.id,
        title: story.title,
        text_file: story.textFile || null,
        audio_file: story.audioFile || null,
        photo_files: story.photoIds.map(id => photoIdToAltMap.get(id)).filter((name): name is string => !!name)
    }));

    const jsonString = JSON.stringify(manifestData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stories.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [stories, photos]);

  const updatePhoto = useCallback((id: string, updates: Partial<Photo>) => {
    setPhotos(currentPhotos => currentPhotos.map(p => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setPhotos(currentPhotos => {
        const maxZ = currentPhotos.length > 0 ? Math.max(...currentPhotos.map(p => p.zIndex)) : 0;
        return currentPhotos.map(p => p.id === id ? { ...p, zIndex: maxZ + 1 } : p);
    });
  }, []);
  
  const handleUnpack = () => {
    setIsCoverLifting(true);
    setTimeout(() => { setAppState('unpacked'); }, 800);
  };

  const handleReset = () => {
    setAppState('ready');
    setIsCoverLifting(false);
    setIsWelcomeDismissed(false);
    handleClearFilter();
  };

  const handleShuffle = () => {
    handleClearFilter();
    setPhotos(currentPhotos => {
      const zIndices = Array.from(Array(currentPhotos.length).keys());
      for (let i = zIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [zIndices[i], zIndices[j]] = [zIndices[j], zIndices[i]];
      }
      return currentPhotos.map((photo, index) => ({
        ...photo,
        position: { x: window.innerWidth * 0.1 + Math.random() * (window.innerWidth * 0.7), y: window.innerHeight * 0.1 + Math.random() * (window.innerHeight * 0.6) },
        rotation: photo.isPinned ? 0 : (Math.random() * 50 - 25), zIndex: zIndices[index],
      }));
    });
  };

  const handlePhotoClick = useCallback((photo: Photo) => setSelectedPhoto(photo), []);
  const handleCloseModal = () => setSelectedPhoto(null);
  const handleCloseWelcome = () => setIsWelcomeDismissed(true);

  // Filtering Handlers
  const handleStorySelect = (storyId: string) => {
    setActiveFilter({ type: 'story', value: storyId });
    setFocusedPhotoId(null);
  };

  const handleTagSelect = (tag: string) => {
    setActiveFilter({ type: 'keyword', value: tag });
    setFocusedPhotoId(null);
  };

  const handleFamilySelect = (familyName: string) => {
    setActiveFilter({ type: 'family', value: familyName });
    setFocusedPhotoId(null);
  };
  
  const handleTextSearch = (text: string) => {
    setActiveFilter({ type: 'text', value: text });
    setFocusedPhotoId(null);
  };

  const handleSubTagSelect = (subTag: string | null) => {
    if (activeFilter) {
        setActiveFilter({ ...activeFilter, subValue: subTag });
        setFocusedPhotoId(null);
    }
  };

  const handleClearFilter = () => {
    setActiveFilter(null);
    setFocusedPhotoId(null);
  };
  
  const handleClearStory = () => {
    if (activeFilter?.type === 'story') {
        handleClearFilter();
    }
  }

  const handleFocusPhoto = useCallback((photoId: string) => setFocusedPhotoId(photoId), []);
  
  // Filter Logic
  const { matchingPhotos, nonMatchingPhotos, matchingIndices, nonMatchingIndices } = useMemo(() => {
    if (!activeFilter) {
        const indices = new Map<string, number>();
        photos.forEach((p, i) => indices.set(p.id, i));
        return { matchingPhotos: [], nonMatchingPhotos: photos, matchingIndices: new Map(), nonMatchingIndices: indices };
    }
    
    const matching: Photo[] = [];
    const nonMatching: Photo[] = [];
    
    const { type, value, subValue } = activeFilter;
    const lowerValue = (value || '').toLowerCase();

    photos.forEach(p => {
        let isMatch = false;
        
        if (type === 'story') {
            const story = stories.find(s => s.id === value);
            if (story && story.photoIds.includes(p.id)) {
                isMatch = true;
            }
        } else if (type === 'family') {
            if (p.people) {
                const peopleList = p.people.split(',').map(n => n.trim());
                isMatch = peopleList.some(name => {
                    const parts = name.split(' ').filter(Boolean);
                    if (parts.length < 2) return false;
                    const lastName = parts[parts.length - 1];
                    const firstName = parts.slice(0, -1).join(' ');
                    
                    if (lastName !== value) return false;
                    if (subValue && firstName !== subValue) return false;
                    return true;
                });
            }
        } else if (type === 'keyword') {
             const photoContent = [...(p.keywords || [])].filter((v): v is string => !!v).join(' ').toLowerCase();
             isMatch = photoContent.includes(lowerValue);
        } else if (type === 'text') {
             const searchContent = [
                 p.title, 
                 p.caption, 
                 p.location, 
                 p.people, 
                 ...(p.keywords || [])
             ].filter(Boolean).join(' ').toLowerCase();
             isMatch = searchContent.includes(lowerValue);
        }

        if (isMatch) matching.push(p);
        else nonMatching.push(p);
    });
    
    const matchingIndices = new Map<string, number>();
    matching.forEach((p, i) => matchingIndices.set(p.id, i));
    
    const nonMatchingIndices = new Map<string, number>();
    nonMatching.forEach((p, i) => nonMatchingIndices.set(p.id, i));
    
    return { matchingPhotos: matching, nonMatchingPhotos: nonMatching, matchingIndices, nonMatchingIndices };
  }, [photos, activeFilter, stories]);

  useEffect(() => {
    if (activeFilter) {
      if (matchingPhotos.length > 0) {
        const isFocusedPhotoInSet = matchingPhotos.some(p => p.id === focusedPhotoId);
        if (focusedPhotoId === null || !isFocusedPhotoInSet) {
          setFocusedPhotoId(matchingPhotos[0].id);
        }
      } else {
        setFocusedPhotoId(null);
      }
    }
  }, [matchingPhotos, activeFilter, focusedPhotoId]);

  const handleCyclePhoto = (direction: 'next' | 'prev') => {
    if (!focusedPhotoId || matchingPhotos.length < 2) return;
    const currentIndex = matchingPhotos.findIndex(p => p.id === focusedPhotoId);
    if (currentIndex === -1) return;
    const nextIndex = direction === 'next' ? (currentIndex + 1) % matchingPhotos.length : (currentIndex - 1 + matchingPhotos.length) % matchingPhotos.length;
    setFocusedPhotoId(matchingPhotos[nextIndex].id);
  };

  // Sorted Lists for Sidebar
  const { sortedTags, sortedFamilyNames } = useMemo(() => {
    if (photos.length === 0) return { sortedTags: [], sortedFamilyNames: [] };
    
    const keywordFrequency = new Map<string, number>();
    
    photos.forEach(p => {
        if (p.keywords) {
            p.keywords.forEach(kw => {
                const normalized = kw.trim();
                if (!normalized) return;
                keywordFrequency.set(normalized, (keywordFrequency.get(normalized) || 0) + 1);
            });
        }
    });

    const tagList = Array.from(keywordFrequency.entries()).map(([name, count]) => ({
        name,
        count
    }));

    const familyNameFrequency = new Map<string, number>();
    familyNames.forEach((_, name) => familyNameFrequency.set(name, 0));

    for (const p of photos) {
        if (p.people) {
             p.people.split(',').forEach(name => {
                 const parts = name.trim().split(' ');
                 if (parts.length > 1) {
                     const lastName = parts[parts.length-1];
                     if (familyNameFrequency.has(lastName)) {
                         familyNameFrequency.set(lastName, familyNameFrequency.get(lastName)! + 1);
                     }
                 }
             });
        }
    }
    
    const sortedFamilyList = Array.from(familyNames.keys()).sort((a, b) => {
        const strA = String(a);
        const strB = String(b);
        return strA.toLowerCase().localeCompare(strB.toLowerCase());
    });
    
    return { sortedTags: tagList, sortedFamilyNames: sortedFamilyList };
  }, [photos, familyNames]);
  
  const isNameFilterActive = activeFilter?.type === 'family';
  const activeStory = useMemo(() => activeFilter?.type === 'story' ? stories.find(s => s.id === activeFilter.value) : null, [stories, activeFilter]);

  const handleGoToSlideshowSetup = () => {
    setAppState('slideshowSetup');
  };

  const handleCancelSlideshowSetup = () => {
    setAppState('ready');
  };

  const handleStartSlideshow = () => {
    const { includedTags, order } = slideshowConfig;

    let filteredPhotos = photos;
    
    if (includedTags.size > 0) {
        filteredPhotos = photos.filter(p => {
            const photoTags = new Set(p.keywords || []);
            
            if (p.people) {
                p.people.split(',').map(name => name.trim()).filter(Boolean).forEach(name => {
                const parts = name.split(' ').filter(Boolean);
                if (parts.length > 1) {
                    const lastName = parts.pop()!;
                    photoTags.add(`Name: ${lastName}`);
                }
                });
            }
            
            for (const tag of includedTags) {
                if (photoTags.has(tag)) {
                    return true;
                }
            }
            return false;
        });
    }

    if (filteredPhotos.length === 0) {
      alert("No photos match the selected tags.");
      return;
    }

    if (order === 'newest') {
      filteredPhotos.sort((a, b) => b.lastModified - a.lastModified);
    } else if (order === 'oldest') {
      filteredPhotos.sort((a, b) => a.lastModified - b.lastModified);
    } else { // random
      for (let i = filteredPhotos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredPhotos[i], filteredPhotos[j]] = [filteredPhotos[j], filteredPhotos[i]];
      }
    }

    setSlideshowPhotos(filteredPhotos);
    setAppState('slideshow');
  };

  const handleExitSlideshow = () => {
    setAppState('slideshowSetup');
    setSlideshowPhotos([]);
  };

  const allTags = useMemo(() => {
    const nameTagsFormatted = sortedFamilyNames.map(name => `Name: ${name}`);
    const tagNames = sortedTags.map(t => t.name);
    const combined = Array.from(new Set([...tagNames, ...nameTagsFormatted])) as string[];
    return combined.sort((a,b) => a?.toLowerCase().localeCompare(b?.toLowerCase()));
  }, [sortedTags, sortedFamilyNames]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {isIdle ? (
        <Screensaver photos={photos} onWakeUp={handleWakeUp} />
      ) : (
        <>
          {appState === 'upload' && !showStoryLinker && (
            <UploadScreen 
              onUpload={handleFileUpload} 
              isProcessing={isProcessing}
              progress={processingProgress}
            />
          )}

          {showStoryLinker && (
            <StoryLinker
              files={filesForLinker}
              initialManifest={initialManifestForLinker}
              onComplete={handleLinkerComplete}
              onCancel={handleLinkerCancel}
            />
          )}
          
          {appState === 'ready' && photos.length > 0 && (
              <ShoeboxCover 
                onUnpack={handleUnpack} 
                isLifting={isCoverLifting} 
                onEnterSlideshowSetup={handleGoToSlideshowSetup}
              />
          )}
          
          {appState === 'slideshowSetup' && (
            <SlideshowSetup
              tags={allTags}
              config={slideshowConfig}
              onConfigChange={setSlideshowConfig}
              onStart={handleStartSlideshow}
              onCancel={handleCancelSlideshowSetup}
            />
          )}

          {appState === 'slideshow' && (
            <Slideshow
              photos={slideshowPhotos}
              config={slideshowConfig}
              onExit={handleExitSlideshow}
            />
          )}

          {appState === 'unpacked' && (
            <div className="absolute inset-0">
              {viewMode === 'grid' ? (
                photos.slice(0, visiblePhotoCount).map((photo) => {
                  const isFilterActive = activeFilter !== null;
                  const matchIndex = matchingIndices.get(photo.id) ?? -1;
                  const nonMatchIndex = nonMatchingIndices.get(photo.id) ?? -1;
                  const isMatch = matchIndex !== -1;
                  const focusedPhotoIndex = isFilterActive ? (matchingIndices.get(focusedPhotoId || '') ?? -1) : -1;

                  return (
                      <PhotoItem 
                          key={photo.id} photo={photo} onUpdate={updatePhoto} onBringToFront={bringToFront}
                          onPhotoClick={handlePhotoClick} onFocusPhoto={handleFocusPhoto} isUnpacked={appState === 'unpacked'}
                          isFilterActive={isFilterActive} isMatch={isMatch} isFocused={photo.id === focusedPhotoId}
                          matchIndex={matchIndex} totalMatches={matchingPhotos.length} focusedPhotoIndex={focusedPhotoIndex}
                          nonMatchIndex={nonMatchIndex} totalNonMatches={nonMatchingPhotos.length}
                      />
                  );
                })
              ) : (
                <MapView photos={photos} onPhotoClick={handlePhotoClick} />
              )}
            </div>
          )}

          {appState === 'unpacked' && (
            <div className="absolute top-4 right-4 z-[9999] flex items-center gap-2">
                <label className="bg-white hover:bg-red-50 text-red-800 font-bold py-2 px-4 border border-red-200 rounded-lg shadow cursor-pointer transition-all duration-200 uppercase text-sm tracking-wider">
                    <span>+ Add More</span>
                    <input type="file" multiple accept="image/*,.heic,.heif,text/plain,audio/*,application/json" className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files)} />
                </label>
                <button onClick={handleShuffle} className="bg-white hover:bg-red-50 text-red-800 font-bold py-2 px-4 border border-red-200 rounded-lg shadow cursor-pointer transition-all duration-200 flex items-center gap-2 uppercase text-sm tracking-wider" title="Shuffle photos">
                    <ShuffleIcon /> <span>Shuffle</span>
                </button>
                <button onClick={handleExportStories} className="bg-white hover:bg-red-50 text-red-800 font-bold py-2 px-4 border border-red-200 rounded-lg shadow cursor-pointer transition-all duration-200 flex items-center gap-2 uppercase text-sm tracking-wider" title="Export all stories to stories.json">
                    <DownloadIcon /> <span>Export Stories</span>
                </button>
                <button onClick={handleReset} className="bg-white hover:bg-red-50 text-red-800 font-bold py-2 px-4 border border-red-200 rounded-lg shadow cursor-pointer transition-all duration-200 flex items-center gap-2 uppercase text-sm tracking-wider" title="Repack the shoebox">
                    <ResetIcon /> <span>Repack</span>
                </button>
            </div>
          )}

          {appState === 'unpacked' && (stories.length > 0 || sortedFamilyNames.length > 0 || sortedTags.length > 0) && (
            <LeftSidebar
              stories={stories}
              onStorySelect={handleStorySelect}
              activeStoryId={activeFilter?.type === 'story' ? activeFilter?.value : null}
              onEditStories={handleEditStories}
              
              familyNames={sortedFamilyNames}
              onFamilySelect={handleFamilySelect}
              activeFamilyName={activeFilter?.type === 'family' ? activeFilter?.value : null}
              
              tags={sortedTags}
              onTagSelect={handleTagSelect} 
              activeTag={activeFilter?.type === 'keyword' ? activeFilter?.value : null}
              
              onTextSearch={handleTextSearch}
            />
          )}

          {activeFilter && (
            <>
              <FilterNotification activeFilter={activeFilter} onClear={handleClearFilter} onEditStories={handleEditStories} />
              {isNameFilterActive && activeFilter.type === 'family' && (
                  <SubFilter 
                    firstNames={Array.from(familyNames.get((activeFilter as FilterState).value) || [])} 
                    onSubTagSelect={handleSubTagSelect} 
                    activeSubTag={activeFilter.subValue || null} 
                  />
              )}
              {matchingPhotos.length > 1 && (<PhotoCycleControls onCycle={handleCyclePhoto} />)}
            </>
          )}
          
          {activeStory && ( <StoryViewer story={activeStory} onClose={handleClearStory} /> )}

          {selectedPhoto && (
            <PhotoDetailModal 
              photo={selectedPhoto} 
              stories={stories.filter(s => selectedPhoto.storyIds?.includes(s.id))} 
              onClose={handleCloseModal}
              onUpdatePhoto={updatePhoto}
            />
          )}
          
          {appState === 'unpacked' && !isWelcomeDismissed && !activeFilter && (
            <WelcomeMessage onClose={handleCloseWelcome} />
          )}

          {appState === 'unpacked' && (
            <div className="absolute bottom-6 left-6 z-[9999]">
              <button 
                onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
                className="bg-white hover:bg-red-50 text-red-800 font-bold py-3 px-6 border border-red-200 rounded-full shadow-xl cursor-pointer transition-all duration-300 flex items-center gap-3 uppercase text-sm tracking-widest group"
              >
                {viewMode === 'grid' ? (
                  <>
                    <MapIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Map View</span>
                  </>
                ) : (
                  <>
                    <GridIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Grid View</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
