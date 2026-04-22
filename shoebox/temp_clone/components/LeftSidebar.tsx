
import React, { useState, useEffect, useMemo } from 'react';
import type { Story } from '../types';

interface TagData {
    name: string;
    count: number;
}

interface LeftSidebarProps {
  stories: Story[];
  onStorySelect: (id: string) => void;
  activeStoryId: string | null;
  
  familyNames: string[];
  onFamilySelect: (name: string) => void;
  activeFamilyName: string | null;
  
  tags: TagData[];
  onTagSelect: (tag: string) => void;
  activeTag: string | null;
  
  onTextSearch: (text: string) => void;
  onEditStories: () => void;
}

type ActiveView = 'stories' | 'keywords' | 'names';
type SortMode = 'alpha' | 'count';

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  stories, onStorySelect, activeStoryId,
  familyNames, onFamilySelect, activeFamilyName,
  tags, onTagSelect, activeTag,
  onTextSearch, onEditStories
}) => {
  const [activeView, setActiveView] = useState<ActiveView>('keywords');
  const [searchTerm, setSearchTerm] = useState('');
  const [tagSortMode, setTagSortMode] = useState<SortMode>('alpha');

  const hasStories = stories.length > 0;
  const hasKeywords = tags.length > 0;
  const hasNames = familyNames.length > 0;

  useEffect(() => {
    if (activeStoryId) setActiveView('stories');
    else if (activeTag) setActiveView('keywords');
    else if (activeFamilyName) setActiveView('names');
    else {
        // Default view priority
        if (hasKeywords) setActiveView('keywords');
        else if (hasStories) setActiveView('stories');
        else if (hasNames) setActiveView('names');
    }
  }, [activeStoryId, activeTag, activeFamilyName, hasStories, hasNames, hasKeywords]);

  // Suggestions Logic
  const suggestions = useMemo(() => {
    if (!searchTerm) return null;
    const lowerTerm = searchTerm.toLowerCase();
    
    const matchingKeywords = tags.filter(t => t.name.toLowerCase().includes(lowerTerm));
    const matchingFamilies = familyNames.filter(n => n.toLowerCase().includes(lowerTerm));
    const matchingStories = stories.filter(s => s.title.toLowerCase().includes(lowerTerm));
    
    return {
        keywords: matchingKeywords,
        families: matchingFamilies,
        stories: matchingStories
    };
  }, [searchTerm, tags, familyNames, stories]);

  // Renderers
  const renderList = (items: { id: string, label: string }[], activeId: string | null, handler: (id: string) => void, emptyMsg: string = "No items found.") => (
    <div className="flex flex-col gap-2 py-2">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => handler(item.id)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
            activeId === item.id
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-gray-200/80 text-gray-800 hover:bg-white'
          }`}
        >
          {item.label}
        </button>
      ))}
      {items.length === 0 && (
          <div className="text-gray-400 text-sm text-center py-4 italic">{emptyMsg}</div>
      )}
    </div>
  );

  const renderTagsList = () => {
      let displayTags = [...tags];

      if (tagSortMode === 'count') {
          // Sort by count descending
          displayTags.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
          
          return (
            <div className="flex flex-col gap-2 py-2">
                {displayTags.map(tag => (
                    <button
                    key={`tag_${tag.name}`}
                    onClick={() => onTagSelect(tag.name)}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                        activeTag === tag.name
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-200/80 text-gray-800 hover:bg-white'
                    }`}
                    >
                    <span>{tag.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeTag === tag.name ? 'bg-white/20' : 'bg-gray-300/50 text-gray-600'}`}>
                        {tag.count}
                    </span>
                    </button>
                ))}
            </div>
          );
      } else {
          // Alpha Grouping
          displayTags.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
          
          const grouped: Record<string, TagData[]> = {};
          displayTags.forEach(tag => {
              const char = tag.name.charAt(0).toUpperCase();
              const groupKey = /[A-Z]/.test(char) ? char : '#';
              if (!grouped[groupKey]) grouped[groupKey] = [];
              grouped[groupKey].push(tag);
          });
          
          const sortedKeys = Object.keys(grouped).sort();
          // Move '#' to end if exists
          if (sortedKeys.includes('#')) {
              sortedKeys.splice(sortedKeys.indexOf('#'), 1);
              sortedKeys.push('#');
          }

          return (
              <div className="py-2 space-y-4">
                  {sortedKeys.map(key => (
                      <div key={key}>
                          <h4 className="text-xs font-bold text-gray-400 border-b border-gray-700 mb-2 pb-1">{key}</h4>
                          <div className="flex flex-col gap-2">
                            {grouped[key].map(tag => (
                                <button
                                    key={`tag_grouped_${tag.name}`}
                                    onClick={() => onTagSelect(tag.name)}
                                    className={`w-full flex justify-between items-center px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                                        activeTag === tag.name
                                        ? 'bg-red-600 text-white shadow-md'
                                        : 'bg-gray-200/80 text-gray-800 hover:bg-white'
                                    }`}
                                    >
                                    <span>{tag.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeTag === tag.name ? 'bg-white/20' : 'bg-gray-300/50 text-gray-600'}`}>
                                        {tag.count}
                                    </span>
                                </button>
                            ))}
                          </div>
                      </div>
                  ))}
              </div>
          )
      }
  };
  
  const TabButton: React.FC<{ view: ActiveView, label: string }> = ({ view, label }) => (
    <button
        onClick={() => setActiveView(view)}
        className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 focus:outline-none ${
            activeView === view
            ? 'text-white border-b-2 border-red-500'
            : 'text-gray-400 hover:text-white border-b-2 border-transparent'
        }`}
    >
        {label}
    </button>
  );

  return (
    <div 
        className="absolute top-0 left-0 bottom-0 z-[9998] w-72 bg-black/80 backdrop-blur-md p-4 flex flex-col border-r border-white/10"
        style={{ animation: 'fadeIn 0.5s ease-in-out' }}
    >
      {/* Search Bar */}
      <div className="mb-2 relative">
          <input 
            type="text" 
            placeholder="Search tags, people, stories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-red-500 placeholder-gray-500 transition-all focus:bg-gray-700"
          />
          {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
          )}
      </div>

      {/* If Searching, show Suggestions View */}
      {searchTerm ? (
        <div className="flex-grow overflow-y-auto pr-2 -mr-2 custom-scrollbar">
            <div className="mt-2 mb-4">
                <button 
                    onClick={() => onTextSearch(searchTerm)}
                    className="w-full bg-red-900/80 hover:bg-red-800 text-white text-xs font-bold py-3 px-3 rounded border border-red-700 transition-colors shadow-sm"
                >
                    Search full text for "{searchTerm}"
                </button>
            </div>

            {suggestions?.stories.length ? (
                <div className="mb-4">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">Stories</h4>
                    {renderList(suggestions.stories.map(s => ({ id: s.id, label: s.title })), null, onStorySelect)}
                </div>
            ) : null}

            {suggestions?.families.length ? (
                <div className="mb-4">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">Family Names</h4>
                    {renderList(suggestions.families.map(n => ({ id: n, label: n })), null, onFamilySelect)}
                </div>
            ) : null}

            {suggestions?.keywords.length ? (
                <div className="mb-4">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">Tags</h4>
                    {renderList(suggestions.keywords.map(t => ({ id: t.name, label: t.name })), null, onTagSelect)}
                </div>
            ) : null}
            
            {!suggestions?.keywords.length && !suggestions?.families.length && !suggestions?.stories.length && (
                <div className="text-gray-500 text-center italic mt-10">No matches found.<br/>Try the "Search full text" button above.</div>
            )}
        </div>
      ) : (
        // Standard Tabbed View
        <>
            <div className="flex-shrink-0 flex items-center justify-around mb-2 border-b border-gray-700">
                {hasStories && <TabButton view="stories" label="Stories" />}
                {hasKeywords && <TabButton view="keywords" label="Tags" />}
                {hasNames && <TabButton view="names" label="Family" />}
            </div>
            
            <div className="flex-grow flex flex-col min-h-0 overflow-y-auto pr-2 -mr-2 overscroll-contain custom-scrollbar">
                {activeView === 'stories' && hasStories && (
                    <>
                        {renderList(stories.map(s => ({ id: s.id, label: s.title })), activeStoryId, onStorySelect, "No stories available.")}
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <button 
                                onClick={onEditStories}
                                className="w-full bg-gray-800 hover:bg-gray-700 text-red-400 text-xs font-bold py-2 px-3 rounded border border-gray-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <span>✎</span> Manage Stories
                            </button>
                        </div>
                    </>
                )}
                
                {activeView === 'keywords' && hasKeywords && (
                    <>
                        <div className="flex justify-center mb-2 bg-gray-800/50 rounded p-1 gap-1">
                            <button 
                                onClick={() => setTagSortMode('alpha')}
                                className={`flex-1 text-xs font-bold py-1 rounded ${tagSortMode === 'alpha' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                A-Z
                            </button>
                            <button 
                                onClick={() => setTagSortMode('count')}
                                className={`flex-1 text-xs font-bold py-1 rounded ${tagSortMode === 'count' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                Count
                            </button>
                        </div>
                        {renderTagsList()}
                    </>
                )}
                
                {activeView === 'names' && hasNames && renderList(familyNames.map(n => ({ id: n, label: n })), activeFamilyName, onFamilySelect, "No family names found.")}
            </div>
        </>
      )}
    </div>
  );
};

export default LeftSidebar;
