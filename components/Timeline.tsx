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
        className="relative h-10 md:h-8 bg-gray-200 dark:bg-gray-700 rounded cursor-pointer shadow-inner overflow-hidden"
        onClick={handleTimelineClick}
      >
        {/* Background track */}
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
        
        {/* Progress bar - taller, single color gradient */}
        <div
          className="absolute inset-y-1 left-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Loop region with visible overlay */}
        {loopStart !== null && loopEnd !== null && (
          <div
            className="absolute inset-y-0 bg-orange-500/30 dark:bg-orange-400/40 border-x-2 border-orange-500/60 z-[1]"
            style={{
              left: `${loopStartPercent}%`,
              width: `${loopWidth}%`,
            }}
          />
        )}

        {/* Loop start handle - rectangle */}
        {loopStart !== null && (
          <div
            className="loop-handle absolute top-0 bottom-0 -translate-x-1/2 w-6 md:w-4 bg-gradient-to-b from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 cursor-ew-resize shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 active:scale-x-125 transition-all duration-200 touch-manipulation rounded-sm z-[2]"
            style={{ left: `${loopStartPercent}%` }}
            onMouseDown={(e) => handleDragStart(e, 'start')}
            onTouchStart={(e) => handleTouchStart(e, 'start')}
          >
            <div className="flex items-center justify-center h-full text-white">
              <svg className="w-3 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path d="M15 5L8 12l7 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Loop end handle - rectangle */}
        {loopEnd !== null && (
          <div
            className="loop-handle absolute top-0 bottom-0 -translate-x-1/2 w-6 md:w-4 bg-gradient-to-b from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 cursor-ew-resize shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 active:scale-x-125 transition-all duration-200 touch-manipulation rounded-sm z-[2]"
            style={{ left: `${loopEndPercent}%` }}
            onMouseDown={(e) => handleDragStart(e, 'end')}
            onTouchStart={(e) => handleTouchStart(e, 'end')}
          >
            <div className="flex items-center justify-center h-full text-white">
              <svg className="w-3 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
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