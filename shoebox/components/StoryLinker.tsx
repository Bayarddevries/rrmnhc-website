
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CloseIcon, PlusIcon, TrashIcon, FileIconAudio, FileIconText, FileIconPhoto } from './Icons';

interface StoryLinkerProps {
  files: File[];
  initialManifest: any[];
  onComplete: (manifest: any[], originalFiles: File[]) => void;
  onCancel: () => void;
}

type StoryState = {
  id: number | string;
  title: string;
  text_file: string | null;
  audio_file: string | null;
  photo_files: string[];
};

const FileThumbnail: React.FC<{ file: File }> = ({ file }) => {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file.type.startsWith('image/')) return;
        const newUrl = URL.createObjectURL(file);
        setUrl(newUrl);
        return () => URL.revokeObjectURL(newUrl);
    }, [file]);

    if (!url) return <FileIconPhoto className="w-6 h-6 text-gray-500 flex-shrink-0" />;
    return <img src={url} alt={file.name} className="w-8 h-8 object-cover rounded" />;
};

const FileItem = React.memo<{ file: File, onDragStart: (e: React.DragEvent<HTMLDivElement>, file: File) => void }>(({ file, onDragStart }) => {
    const isAudio = file.type.startsWith('audio/');
    const isText = file.type === 'text/plain';
    const isImage = file.type.startsWith('image/');
  
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart(e, file)}
        className="flex items-center gap-2 p-2 bg-gray-100 rounded-md cursor-grab active:cursor-grabbing border border-gray-200"
      >
        {isImage ? <FileThumbnail file={file} /> : 
         isAudio ? <FileIconAudio className="w-6 h-6 text-blue-500 flex-shrink-0" /> :
         isText ? <FileIconText className="w-6 h-6 text-green-500 flex-shrink-0" /> : 
         <FileIconPhoto className="w-6 h-6 text-gray-500 flex-shrink-0" />
        }
        <span className="text-xs text-gray-700 truncate" title={file.name}>{file.name}</span>
      </div>
    );
});
FileItem.displayName = 'FileItem';

const DropZone: React.FC<{ onDrop: (file: File) => void, children: React.ReactNode, type: 'text' | 'audio' | 'photo', className?: string }> = ({ onDrop, children, type, className }) => {
    const [isOver, setIsOver] = useState(false);
  
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsOver(true);
    };
  
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsOver(false);
    };
  
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsOver(false);
      const fileString = e.dataTransfer.getData('application/json');
      if (fileString) {
        const file = JSON.parse(fileString);
        if (type === 'text' && file.type === 'text/plain') onDrop(file);
        if (type === 'audio' && file.type.startsWith('audio/')) onDrop(file);
        if (type === 'photo' && file.type.startsWith('image/')) onDrop(file);
      }
    };
  
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`transition-colors duration-200 rounded-lg ${isOver ? 'bg-red-100 border-red-400' : 'bg-white border-gray-300'} ${className}`}
      >
        {children}
      </div>
    );
};
  
const FileThumbnailLarge: React.FC<{ file: File }> = ({ file }) => {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const newUrl = URL.createObjectURL(file);
        setUrl(newUrl);
        return () => URL.revokeObjectURL(newUrl);
    }, [file]);

    if (!url) return <div className="w-full h-20 bg-gray-700 animate-pulse rounded" />;
    return <img src={url} alt={file.name} className="w-full h-20 object-cover rounded" />;
};

const StoryLinker: React.FC<StoryLinkerProps> = ({ files, initialManifest, onComplete, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayLimit, setDisplayLimit] = useState(50);
  const [stories, setStories] = useState<StoryState[]>(() => {
    const initialStories = initialManifest.map((item): StoryState => ({
        id: item.id,
        title: item.title,
        text_file: item.text_file,
        audio_file: item.audio_file,
        photo_files: item.photo_files || [],
    }));
    if (initialStories.length === 0) {
        return [{ id: Date.now(), title: 'Untitled Story 1', text_file: null, audio_file: null, photo_files: [] }];
    }
    return initialStories;
  });

  const [selectedStoryId, setSelectedStoryId] = useState<number | string | null>(stories[0]?.id || null);

  const fileMap = useMemo(() => new Map(files.map(f => [f.name, f])), [files]);

  const { availableImages, availableText, availableAudio, totalAvailable } = useMemo(() => {
    const linkedPhotos = new Set(stories.flatMap(s => s.photo_files));
    const linkedText = new Set(stories.map(s => s.text_file).filter(Boolean));
    const linkedAudio = new Set(stories.map(s => s.audio_file).filter(Boolean));
    
    const lowerSearch = searchTerm.toLowerCase();
    const filterFn = (f: File) => !searchTerm || f.name.toLowerCase().includes(lowerSearch);

    const images = files.filter(f => f.type.startsWith('image/') && !linkedPhotos.has(f.name) && filterFn(f));
    const texts = files.filter(f => f.type === 'text/plain' && !linkedText.has(f.name) && filterFn(f));
    const audios = files.filter(f => f.type.startsWith('audio/') && !linkedAudio.has(f.name) && filterFn(f));

    return {
      availableImages: images,
      availableText: texts,
      availableAudio: audios,
      totalAvailable: images.length + texts.length + audios.length
    };
  }, [files, stories, searchTerm]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, file: File) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ name: file.name, type: file.type }));
  };

  const handleAddStory = () => {
    const newStory: StoryState = { id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, title: `Untitled Story ${stories.length + 1}`, text_file: null, audio_file: null, photo_files: [] };
    setStories([...stories, newStory]);
    setSelectedStoryId(newStory.id);
  };

  const handleDeleteStory = (storyId: number | string) => {
    setStories(current => current.filter(s => s.id !== storyId));
    if (selectedStoryId === storyId) {
      setSelectedStoryId(stories[0]?.id || null);
    }
  };

  const updateStory = (storyId: number | string, updates: Partial<StoryState>) => {
    setStories(current => current.map(s => s.id === storyId ? { ...s, ...updates } : s));
  };

  const handleDropIn = (type: 'text' | 'audio' | 'photo', file: { name: string, type: string }) => {
    if (!selectedStoryId) return;
    const selectedStory = stories.find(s => s.id === selectedStoryId);
    if (!selectedStory) return;

    if (type === 'text') updateStory(selectedStoryId, { text_file: file.name });
    if (type === 'audio') updateStory(selectedStoryId, { audio_file: file.name });
    if (type === 'photo') {
      if (!selectedStory.photo_files.includes(file.name)) {
        updateStory(selectedStoryId, { photo_files: [...selectedStory.photo_files, file.name] });
      }
    }
  };

  const handleUnlink = (type: 'text' | 'audio' | 'photo', fileName: string) => {
    if (!selectedStoryId) return;
    if (type === 'text') updateStory(selectedStoryId, { text_file: null });
    if (type === 'audio') updateStory(selectedStoryId, { audio_file: null });
    if (type === 'photo') {
      const selectedStory = stories.find(s => s.id === selectedStoryId);
      if (selectedStory) {
        updateStory(selectedStoryId, { photo_files: selectedStory.photo_files.filter(name => name !== fileName) });
      }
    }
  };

  const selectedStory = useMemo(() => stories.find(s => s.id === selectedStoryId), [stories, selectedStoryId]);

  const handleGenerate = () => {
    const manifest = stories
      .filter(story => story.photo_files.length > 0 || story.text_file || story.audio_file) // only include stories with content
      .map((story) => ({
        id: story.id,
        title: story.title.trim() === '' ? `Story for ${story.photo_files[0] || story.text_file || story.audio_file}` : story.title,
        text_file: story.text_file,
        audio_file: story.audio_file,
        photo_files: story.photo_files,
      }));
    onComplete(manifest, files);
  };

  const getFileByName = useCallback((name: string | null) => name ? fileMap.get(name) : undefined, [fileMap]);
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000]" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
        <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col m-4 text-white" style={{ animation: 'zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-heading tracking-wider">Story Linker Tool</h2>
                <button onClick={onCancel} className="text-gray-400 hover:text-white"><CloseIcon /></button>
            </div>

            <div className="flex-grow flex p-4 gap-4 overflow-hidden">
                {/* Column 1: Stories */}
                <div className="w-1/4 flex flex-col bg-gray-900/50 rounded-lg p-3">
                    <h3 className="font-bold text-lg mb-2 text-center text-red-400">Stories</h3>
                    <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2">
                        {stories.map(story => (
                            <div key={story.id} onClick={() => setSelectedStoryId(story.id)}
                                className={`p-2 rounded-lg cursor-pointer flex justify-between items-center ${selectedStoryId === story.id ? 'bg-red-600/50' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                <input type="text" value={story.title} onChange={e => updateStory(story.id, { title: e.target.value })}
                                    className="bg-transparent font-semibold w-full focus:outline-none" />
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteStory(story.id); }} className="text-gray-400 hover:text-red-400"><TrashIcon /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAddStory} className="mt-2 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                        <PlusIcon /> New Story
                    </button>
                </div>

                {/* Column 2: Available Files */}
                <div className="w-1/4 flex flex-col bg-gray-900/50 rounded-lg p-3">
                    <h3 className="font-bold text-lg mb-2 text-center text-red-400">Available Files</h3>
                    
                    <div className="mb-3">
                        <input 
                            type="text" 
                            placeholder="Search files..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setDisplayLimit(50);
                            }}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2">
                        {availableImages.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-1">Photos ({availableImages.length})</h4>
                                <div className="space-y-1">
                                    {availableImages.slice(0, displayLimit).map((f, i) => <FileItem key={`img_${f.name}_${i}`} file={f} onDragStart={handleDragStart} />)}
                                </div>
                            </div>
                        )}
                        {availableText.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-1">Text ({availableText.length})</h4>
                                <div className="space-y-1">
                                    {availableText.slice(0, Math.max(0, displayLimit - availableImages.length)).map((f, i) => <FileItem key={`txt_${f.name}_${i}`} file={f} onDragStart={handleDragStart} />)}
                                </div>
                            </div>
                        )}
                        {availableAudio.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-1">Audio ({availableAudio.length})</h4>
                                <div className="space-y-1">
                                    {availableAudio.slice(0, Math.max(0, displayLimit - availableImages.length - availableText.length)).map((f, i) => <FileItem key={`aud_${f.name}_${i}`} file={f} onDragStart={handleDragStart} />)}
                                </div>
                            </div>
                        )}

                        {totalAvailable > displayLimit && (
                            <button 
                                onClick={() => setDisplayLimit(prev => prev + 50)}
                                className="w-full py-2 text-sm text-red-400 hover:text-red-300 font-semibold"
                            >
                                Show More ({totalAvailable - displayLimit} remaining)
                            </button>
                        )}

                        {totalAvailable === 0 && (
                            <p className="text-center text-gray-500 text-sm mt-4">No files found</p>
                        )}
                    </div>
                </div>

                {/* Column 3: Linked Files */}
                <div className="w-2/4 flex flex-col bg-gray-900/50 rounded-lg p-3">
                    <h3 className="font-bold text-lg mb-2 text-center text-red-400">
                        {selectedStory ? `Links for "${selectedStory.title}"` : 'Select a Story'}
                    </h3>
                    {selectedStory && (
                    <div className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-2">
                        {/* Text Dropzone */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-1">Story Text (1 file)</h4>
                            <DropZone type="text" onDrop={(file) => handleDropIn('text', file)} className="border-2 border-dashed p-4 min-h-[70px] bg-gray-800/50">
                                {selectedStory.text_file ? (
                                    <div className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                                        <div className="flex items-center gap-2"><FileIconText className="w-6 h-6 text-green-400 flex-shrink-0" /><span className="text-sm">{selectedStory.text_file}</span></div>
                                        <button onClick={() => handleUnlink('text', selectedStory.text_file!)} className="text-gray-400 hover:text-red-400"><CloseIcon className="w-4 h-4" /></button>
                                    </div>
                                ) : <p className="text-center text-gray-500 text-sm">Drop .txt file here</p>}
                            </DropZone>
                        </div>
                         {/* Audio Dropzone */}
                         <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-1">Audio Recording (1 file)</h4>
                            <DropZone type="audio" onDrop={(file) => handleDropIn('audio', file)} className="border-2 border-dashed p-4 min-h-[70px] bg-gray-800/50">
                                {selectedStory.audio_file ? (
                                    <div className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                                        <div className="flex items-center gap-2"><FileIconAudio className="w-6 h-6 text-blue-400 flex-shrink-0" /><span className="text-sm">{selectedStory.audio_file}</span></div>
                                        <button onClick={() => handleUnlink('audio', selectedStory.audio_file!)} className="text-gray-400 hover:text-red-400"><CloseIcon className="w-4 h-4"/></button>
                                    </div>
                                ) : <p className="text-center text-gray-500 text-sm">Drop audio file here</p>}
                            </DropZone>
                        </div>
                         {/* Photos Dropzone */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-1">Linked Photos</h4>
                            <DropZone type="photo" onDrop={(file) => handleDropIn('photo', file)} className="border-2 border-dashed p-4 min-h-[120px] bg-gray-800/50">
                                {selectedStory.photo_files.length > 0 ? (
                                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                        {selectedStory.photo_files.map((name, i) => {
                                            const file = getFileByName(name);
                                            return file ? (
                                                <div key={`${name}_${i}`} className="relative group">
                                                    <FileThumbnailLarge file={file} />
                                                    <button onClick={() => handleUnlink('photo', name)} className="absolute top-0 right-0 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <CloseIcon className="w-3 h-3"/>
                                                    </button>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                ) : <p className="text-center text-gray-500 text-sm">Drop photo files here</p>}
                            </DropZone>
                        </div>
                    </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-end gap-4">
                <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg">Cancel</button>
                <button onClick={handleGenerate} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">Create Stories &amp; Continue</button>
            </div>
        </div>
    </div>
  );
};

export default StoryLinker;
