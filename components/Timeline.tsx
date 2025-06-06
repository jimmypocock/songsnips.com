'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface TimelineProps {
  duration: number;
  currentTime: number;
  loopStart: number | null;
  loopEnd: number | null;
  onTimelineClick: (time: number) => void;
  onLoopPointChange: (type: 'start' | 'end', time: number, isDragging: boolean) => void;
}

export default function Timeline({
  duration,
  currentTime,
  loopStart,
  loopEnd,
  onTimelineClick,
  onLoopPointChange,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<'start' | 'end' | null>(null);
  const [touchIdentifier, setTouchIdentifier] = useState<number | null>(null);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle timeline click
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || isDragging || duration === 0) return;

    // Check if click is on a handle
    const target = e.target as HTMLElement;
    if (target.closest('.loop-handle')) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const clickTime = percentage * duration;

    onTimelineClick(clickTime);
  }, [duration, isDragging, onTimelineClick]);

  // Handle drag start (mouse)
  const handleDragStart = useCallback((e: React.MouseEvent, handle: 'start' | 'end') => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragHandle(handle);
  }, []);
  
  // Handle drag start (touch)
  const handleTouchStart = useCallback((e: React.TouchEvent, handle: 'start' | 'end') => {
    e.stopPropagation();
    const touch = e.touches[0];
    setTouchIdentifier(touch.identifier);
    setIsDragging(true);
    setDragHandle(handle);
  }, []);

  // Handle drag move
  useEffect(() => {
    if (!isDragging || !dragHandle || !timelineRef.current) return;

    const handleMove = (clientX: number) => {
      const rect = timelineRef.current!.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const time = percentage * duration;

      if (dragHandle === 'start' && (loopEnd === null || time < loopEnd)) {
        onLoopPointChange('start', time, true);
      } else if (dragHandle === 'end' && loopStart !== null && time > loopStart) {
        onLoopPointChange('end', time, true);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (touchIdentifier !== null) {
        const touch = Array.from(e.touches).find(t => t.identifier === touchIdentifier);
        if (touch) {
          handleMove(touch.clientX);
        }
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setDragHandle(null);
      setTouchIdentifier(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDragging, dragHandle, duration, loopStart, loopEnd, onLoopPointChange, touchIdentifier]);

  // Calculate positions
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const loopStartPercent = loopStart !== null && duration > 0 ? (loopStart / duration) * 100 : 0;
  const loopEndPercent = loopEnd !== null && duration > 0 ? (loopEnd / duration) * 100 : 0;
  const loopWidth = loopEnd !== null && loopStart !== null ? loopEndPercent - loopStartPercent : 0;

  return (
    <div className="space-y-2">
      {/* Compact Time display */}
      <div className="flex justify-between text-xs">
        <span className="font-mono text-gray-600 dark:text-gray-400">
          {formatTime(currentTime)}
        </span>
        <span className="font-mono text-gray-600 dark:text-gray-400">
          {formatTime(duration)}
        </span>
      </div>

      {/* Compact Timeline */}
      <div
        ref={timelineRef}
        className="relative h-10 md:h-8 rounded-lg cursor-pointer shadow-inner overflow-hidden ring-1 ring-gray-300/50 dark:ring-gray-600/50"
        onClick={handleTimelineClick}
      >
        {/* Background track with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
        
        
        {/* Full progress indicator - always shows total elapsed time in bottom 50% */}
        <div
          className="absolute bottom-0 left-0 h-1/2 bg-gradient-to-r from-primary via-primary-hover to-primary transition-all duration-100 shadow-sm"
          style={{ 
            width: `${progressPercent}%`,
            boxShadow: '0 2px 4px rgba(1, 47, 73, 0.3)'
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>

        {/* Loop region with visible overlay - using secondary color with gradient */}
        {loopStart !== null && loopEnd !== null && (
          <div
            className="absolute inset-y-0 z-[2]"
            style={{
              left: `${loopStartPercent}%`,
              width: `${loopWidth}%`,
            }}
          >
            {/* Gradient fill */}
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 via-secondary/30 to-secondary/20 dark:from-secondary/30 dark:via-secondary/40 dark:to-secondary/30" />
            
            {/* Left border handle with gradient */}
            <div
              className="loop-handle absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-secondary via-secondary-hover to-secondary cursor-ew-resize hover:w-2 transition-all duration-200 z-[3] shadow-md"
              onMouseDown={(e) => handleDragStart(e, 'start')}
              onTouchStart={(e) => handleTouchStart(e, 'start')}
            />
            {/* Right border handle with gradient */}
            <div
              className="loop-handle absolute right-0 inset-y-0 w-1 bg-gradient-to-b from-secondary via-secondary-hover to-secondary cursor-ew-resize hover:w-2 transition-all duration-200 z-[3] shadow-md"
              onMouseDown={(e) => handleDragStart(e, 'end')}
              onTouchStart={(e) => handleTouchStart(e, 'end')}
            />
          </div>
        )}
      </div>

      {/* Compact Loop info */}
      {(loopStart !== null || loopEnd !== null) && (
        <div className="text-center text-xs text-gray-600 dark:text-gray-400">
          <span className="font-mono">
            {loopStart !== null ? formatTime(loopStart) : '--:--'}
          </span>
          <span className="mx-2">→</span>
          <span className="font-mono">
            {loopEnd !== null ? formatTime(loopEnd) : '--:--'}
          </span>
        </div>
      )}
    </div>
  );
}