
export interface Photo {
  id: string;
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  people?: string;
  location?: string;
  copyright?: string;
  keywords?: string[];
  storyIds?: string[];
  position: { x: number; y: number };
  rotation: number;
  zIndex: number;
  isPinned: boolean;
  initialRotation: number;
  scale: number;
  initialScale: number;
  lastModified: number;
  animationDelay: number;
  animationDuration: number;
  fontClass: string;
  exifData?: Record<string, any>;
  lat?: number;
  lng?: number;
}

export interface Story {
  id: string;
  title: string;
  text: string;
  audioSrc: string;
  photoIds: string[];
  textFile?: string;
  audioFile?: string;
}

export type FilterType = 'story' | 'keyword' | 'family' | 'text';

export interface FilterState {
  type: FilterType;
  value: string;
  subValue?: string | null;
}
