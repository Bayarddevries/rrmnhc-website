
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import type { Photo } from '../types';
import { PinIcon } from './Icons';

interface PhotoItemProps {
  photo: Photo;
  onUpdate: (id: string, updates: Partial<Photo>) => void;
  onBringToFront: (id: string) => void;
  onPhotoClick: (photo: Photo) => void;
  onFocusPhoto: (id: string) => void;
  isUnpacked: boolean;
  isFilterActive: boolean;
  isMatch: boolean;
  isFocused: boolean;
  matchIndex: number;
  totalMatches: number;
  focusedPhotoIndex: number;
  nonMatchIndex: number;
  totalNonMatches: number;
}

// We use a fixed width for consistency in the pile, but height is dynamic (auto)
const PHOTO_ITEM_WIDTH = 240;

const PhotoItem: React.FC<PhotoItemProps> = React.memo((props) => {
  const { 
    photo, onUpdate, onBringToFront, onPhotoClick, onFocusPhoto, 
    isUnpacked, isFilterActive, isMatch, isFocused, matchIndex, totalMatches,
    focusedPhotoIndex, nonMatchIndex, totalNonMatches
  } = props;
  
  const nodeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const rafRef = useRef<number | null>(null);
  
  const interactionState = useRef({
    type: null as 'drag' | 'gesture' | null,
    dragStart: { x: 0, y: 0 },
    photoStartPos: { x: 0, y: 0 },
    initialPinchDist: 0,
    initialAngle: 0,
    initialRotation: 0,
    initialScale: 0,
    currentPos: { x: 0, y: 0 },
    currentScale: 1,
    currentRotation: 0
  });
  const [isRendered, setIsRendered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsRendered(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-resize text to fit container - optimized to avoid reflow storm
  useEffect(() => {
    if (!isUnpacked || !photo.title || !textRef.current || !isRendered) return;

    const resizeText = () => {
        const el = textRef.current;
        if (!el) return;
        const container = el.parentElement;
        if (!container) return;

        const containerHeight = container.clientHeight;
        const containerWidth = container.clientWidth;

        if (containerHeight === 0 || containerWidth === 0) return;

        let fontSize = 16;
        el.style.fontSize = `${fontSize}px`;
        
        // Use a single measurement if possible, or limit iterations
        if (el.scrollHeight > containerHeight || el.scrollWidth > containerWidth) {
            // Binary search or just a few steps
            fontSize = 14;
            el.style.fontSize = `${fontSize}px`;
            if (el.scrollHeight > containerHeight || el.scrollWidth > containerWidth) {
                fontSize = 12;
                el.style.fontSize = `${fontSize}px`;
                if (el.scrollHeight > containerHeight || el.scrollWidth > containerWidth) {
                    fontSize = 10;
                    el.style.fontSize = `${fontSize}px`;
                    el.style.whiteSpace = 'nowrap';
                    el.style.overflow = 'hidden';
                    el.style.textOverflow = 'ellipsis';
                }
            }
        }
    };

    // Delay slightly to avoid clashing with mount/animation
    const timer = setTimeout(resizeText, 500 + Math.random() * 500);
    return () => clearTimeout(timer);
  }, [photo.title, isRendered, isUnpacked]);

  const getDistance = (touches: TouchList | React.TouchList) => {
    const t1 = touches[0];
    const t2 = touches[1];
    return Math.sqrt(Math.pow(t1.clientX - t2.clientX, 2) + Math.pow(t1.clientY - t2.clientY, 2));
  };

  const getAngle = (touches: TouchList | React.TouchList) => {
    const t1 = touches[0];
    const t2 = touches[1];
    return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;
  };

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (photo.isPinned || !nodeRef.current) return;
    e.stopPropagation();

    if ('touches' in e) {
        interactionState.current.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
        e.preventDefault();
        interactionState.current.dragStart = { x: e.clientX, y: e.clientY };
    }

    if (isFilterActive) {
        interactionState.current.type = 'drag';
        if ('touches' in e) {
            window.addEventListener('touchend', handleTouchEnd, { passive: true });
            window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
        } else {
            window.addEventListener('mouseup', handleMouseUp, { passive: true });
        }
        return;
    }
    
    onBringToFront(photo.id);
    setIsDragging(true);
    const node = nodeRef.current;
    node.style.transition = 'none';
    node.classList.add('dragging');
    
    interactionState.current.photoStartPos = { x: photo.position.x, y: photo.position.y };
    interactionState.current.initialRotation = photo.rotation;
    interactionState.current.initialScale = photo.scale;
    interactionState.current.currentPos = { x: photo.position.x, y: photo.position.y };
    interactionState.current.currentScale = photo.scale;
    interactionState.current.currentRotation = photo.rotation;
    
    if ('touches' in e) {
        if (e.touches.length === 2) {
            interactionState.current.type = 'gesture';
            interactionState.current.initialPinchDist = getDistance(e.touches);
            interactionState.current.initialAngle = getAngle(e.touches);
        } else if (e.touches.length === 1) {
            interactionState.current.type = 'drag';
        }
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('touchcancel', handleTouchEnd);
    } else {
        interactionState.current.type = 'drag';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleMouseMove = (e: MouseEvent) => updateInteraction(e.clientX, e.clientY);
  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (isFilterActive) return;
    if (e.touches.length === 2 && interactionState.current.type === 'gesture') {
        updateGesture(e.touches);
    } else if (e.touches.length === 1 && interactionState.current.type === 'drag') {
        updateInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const updateInteraction = (clientX: number, clientY: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
        if (isFilterActive) return;
        const { dragStart, photoStartPos, initialRotation, initialScale } = interactionState.current;
        const dx = clientX - dragStart.x;
        const dy = clientY - dragStart.y;
        
        const newX = photoStartPos.x + dx;
        const newY = photoStartPos.y + dy;
        interactionState.current.currentPos = { x: newX, y: newY };
        if (nodeRef.current) {
            nodeRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0) rotate(${initialRotation}deg) scale(${initialScale})`;
        }
    });
  };

  const updateGesture = (touches: TouchList) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
        if (isFilterActive) return;
        const { initialPinchDist, initialAngle, initialRotation, initialScale, photoStartPos } = interactionState.current;
        const newDist = getDistance(touches);
        const newAngle = getAngle(touches);
        const scale = initialScale * (newDist / initialPinchDist);
        const rotation = initialRotation + (newAngle - initialAngle);
        interactionState.current.currentScale = scale;
        interactionState.current.currentRotation = rotation;
        if (nodeRef.current) {
            nodeRef.current.style.transform = `translate3d(${photoStartPos.x}px, ${photoStartPos.y}px, 0) rotate(${rotation}deg) scale(${scale})`;
        }
    });
  };

  const handleMouseUp = (e: MouseEvent) => handleInteractionEnd(e.clientX, e.clientY);
  const handleTouchEnd = (e: TouchEvent) => {
    handleInteractionEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
  };
  
  const handleInteractionEnd = (endClientX: number, endClientY: number) => {
    if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    }

    const node = nodeRef.current;
    if (!node) return;

    // Reset transition on interaction end (though in filter mode interaction is limited)
    const duration = isFilterActive ? 500 : photo.animationDuration;
    const easing = isFilterActive ? 'cubic-bezier(0.4, 0, 0.2, 1)' : 'cubic-bezier(0.25, 0.8, 0.25, 1)'; 
    node.style.transition = `transform ${duration}ms ${easing}, opacity 500ms ease-out`;
    
    node.classList.remove('dragging');
    setIsDragging(false);

    const { dragStart } = interactionState.current;
    const dx = endClientX - dragStart.x;
    const dy = endClientY - dragStart.y;
    const isClick = Math.sqrt(dx * dx + dy * dy) < 10;

    if (isFilterActive) {
      if (isClick && isMatch) {
          if (isFocused) {
              onPhotoClick(photo);
          } else {
              onFocusPhoto(photo.id);
          }
      }
    } else {
      if (isClick) {
          onPhotoClick(photo);
      } else if (interactionState.current.type) {
          const { currentPos, currentScale, currentRotation } = interactionState.current;
  
          const finalUpdate: Partial<Photo> = {
            position: currentPos,
            scale: currentScale,
            rotation: currentRotation,
          };
          onUpdate(photo.id, finalUpdate);
      }
    }
    
    interactionState.current.type = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
    window.removeEventListener('touchcancel', handleTouchEnd);
  };

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowPinned = !photo.isPinned;
    onUpdate(photo.id, { 
        isPinned: isNowPinned,
        rotation: isNowPinned ? 0 : photo.initialRotation,
        scale: isNowPinned ? 1 : photo.initialScale,
    });
    if (isNowPinned) {
      onBringToFront(photo.id);
    }
  };

  let currentStyles: React.CSSProperties = {};
  
  const packedStyles = {
    transform: `translate3d(calc(50vw - ${PHOTO_ITEM_WIDTH / 2}px), calc(50vh - 150px), 0) scale(0.1) rotate(${Math.random() * 20 - 10}deg)`,
    opacity: 0,
  };

  if (isFilterActive) {
    if (isMatch) {
      if (isFocused) {
        // Center Screen Focus - Using CSS translate centering to handle dynamic height
        currentStyles = {
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(0deg) scale(1.4)`,
          opacity: 1,
          zIndex: 2000,
          maxHeight: '80vh' // Prevent super tall images from bleeding off screen
        };
      } else {
        const offsetIndex = matchIndex - focusedPhotoIndex;
        const sign = Math.sign(offsetIndex);
        const arcPos = (Math.abs(offsetIndex) - 1) * 80 + 120;
        
        const x = window.innerWidth / 2 - (PHOTO_ITEM_WIDTH / 2) + (sign * arcPos);
        const y = window.innerHeight / 2 - 150 + Math.abs(offsetIndex) * 40;
        const rotation = sign * (10 + Math.abs(offsetIndex) * 2);
        const scale = 1.2 - Math.abs(offsetIndex) * 0.1;

        currentStyles = {
          transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale < 0.5 ? 0.5 : scale})`,
          opacity: 1,
          zIndex: 1000 - Math.abs(offsetIndex),
        };
      }
    } else { // Not a match
      const x = (window.innerWidth / 2) + (nonMatchIndex - totalNonMatches / 2) * 30;
      const y = window.innerHeight - 100;
      currentStyles = {
        transform: `translate3d(${x}px, ${y}px, 0) rotate(0deg) scale(0.3)`,
        opacity: 0.3,
        zIndex: 1,
      };
    }
  } else { // Not filtered (Normal Shoebox)
    currentStyles = isRendered && isUnpacked ? {
      transform: `translate3d(${photo.position.x}px, ${photo.position.y}px, 0) rotate(${photo.rotation}deg) scale(${photo.scale})`,
      opacity: 1,
      zIndex: photo.zIndex
    } : packedStyles;
  }
  
  // FIXED: Explicitly defined transition logic for smoother filter animations
  const duration = isFilterActive ? 500 : photo.animationDuration;
  const delay = isFilterActive ? 0 : photo.animationDelay;
  const easing = isFilterActive ? 'cubic-bezier(0.4, 0, 0.2, 1)' : 'cubic-bezier(0.25, 0.8, 0.25, 1)';

  const transitionString = isRendered && !isDragging
    ? `transform ${duration}ms ${easing} ${delay}ms, opacity ${duration}ms ease-out ${delay}ms, top ${duration}ms ${easing} ${delay}ms, left ${duration}ms ${easing} ${delay}ms` 
    : 'none';

  // Dynamic Height "Vintage Print" Style
  return (
    <div
      ref={nodeRef}
      className={`absolute bg-white shadow-sharp group photo-item flex flex-col p-3 ${photo.isPinned || isFilterActive ? 'cursor-pointer' : 'cursor-grab'}`}
      style={{
        ...currentStyles,
        width: PHOTO_ITEM_WIDTH,
        height: 'auto', // Let height be determined by content
        top: isFocused && isFilterActive ? '50%' : 0,
        left: isFocused && isFilterActive ? '50%' : 0,
        transition: transitionString,
        willChange: isFilterActive || isDragging ? 'transform, opacity, top, left' : 'auto'
      }}
      onMouseDown={handleInteractionStart}
      onTouchStart={handleInteractionStart}
    >
      {/* Image Area - Natural Aspect Ratio */}
      <div className="w-full bg-gray-100 flex-shrink-0 overflow-hidden relative">
        <img
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            className="w-full h-auto block pointer-events-none" // Allow natural height
            draggable="false"
        />
      </div>
      
      {/* Pin Button (Realistic Push Pin) */}
      <div className="absolute -top-4 -right-4 z-10">
        <button
          onClick={togglePin}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-opacity duration-300 opacity-50 group-hover:opacity-100 ${photo.isPinned ? 'opacity-100' : ''}`}
          title={photo.isPinned ? 'Unpin photo' : 'Pin photo'}
        >
          <PinIcon pinned={photo.isPinned} />
        </button>
      </div>
      
      {/* Title Chin - Always present, fixed min-height for consistency */}
      <div className="w-full min-h-[64px] flex items-center justify-center pt-2 pb-1 overflow-hidden">
        {photo.title ? (
            <p
                ref={textRef}
                className={`${photo.fontClass} text-gray-900 leading-tight text-center w-full font-bold select-none`}
                style={{ fontSize: '16px' }} 
            >
                {photo.title}
            </p>
        ) : (
            <p className={`${photo.fontClass} text-gray-300 text-sm text-center select-none`}>No Title</p>
        )}
      </div>
    </div>
  );
});

export default PhotoItem;
