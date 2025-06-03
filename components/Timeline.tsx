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

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent, handle: 'start' | 'end') => {
    e.stopPropagation();
    setIsDragging(true);
    setDragHandle(handle);
  }, []);

  // Handle drag move
  useEffect(() => {
    if (!isDragging || !dragHandle || !timelineRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = timelineRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const time = percentage * duration;

      if (dragHandle === 'start' && (loopEnd === null || time < loopEnd)) {
        onLoopPointChange('start', time, true);
      } else if (dragHandle === 'end' && loopStart !== null && time > loopStart) {
        onLoopPointChange('end', time, true);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragHandle(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragHandle, duration, loopStart, loopEnd, onLoopPointChange]);

  // Calculate positions
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const loopStartPercent = loopStart !== null && duration > 0 ? (loopStart / duration) * 100 : 0;
  const loopEndPercent = loopEnd !== null && duration > 0 ? (loopEnd / duration) * 100 : 0;
  const loopWidth = loopEnd !== null && loopStart !== null ? loopEndPercent - loopStartPercent : 0;

  return (
    <div className="space-y-4">
      {/* Time display */}
      <div className="flex justify-between text-sm">
        <span className="font-mono font-medium text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md">
          {formatTime(currentTime)}
        </span>
        <span className="font-mono font-medium text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md">
          {formatTime(duration)}
        </span>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="relative h-16 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer shadow-inner overflow-hidden border border-gray-300 dark:border-gray-600"
        onClick={handleTimelineClick}
      >
        {/* Progress fill */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-secondary rounded-full transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Loop region */}
        {loopStart !== null && loopEnd !== null && (
          <div
            className="absolute inset-y-0 bg-primary/20 dark:bg-accent/20 backdrop-blur-sm"
            style={{
              left: `${loopStartPercent}%`,
              width: `${loopWidth}%`,
            }}
          />
        )}

        {/* Loop start handle */}
        {loopStart !== null && (
          <div
            className="loop-handle absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-10 bg-secondary dark:bg-secondary border-2 border-white dark:border-gray-800 rounded-lg cursor-ew-resize shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
            style={{ left: `${loopStartPercent}%` }}
            onMouseDown={(e) => handleDragStart(e, 'start')}
          >
            <span className="text-white font-bold text-sm select-none">[</span>
          </div>
        )}

        {/* Loop end handle */}
        {loopEnd !== null && (
          <div
            className="loop-handle absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-10 bg-secondary dark:bg-secondary border-2 border-white dark:border-gray-800 rounded-lg cursor-ew-resize shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
            style={{ left: `${loopEndPercent}%` }}
            onMouseDown={(e) => handleDragStart(e, 'end')}
          >
            <span className="text-white font-bold text-sm select-none">]</span>
          </div>
        )}
      </div>

      {/* Loop info */}
      <div className="text-center">
        <div className="inline-block text-sm bg-gray-100 dark:bg-gray-800 py-2 px-4 rounded-lg">
        <span className="text-gray-600 dark:text-gray-400 font-medium">Loop: </span>
        <span className="font-mono font-bold text-primary dark:text-accent px-2 py-0.5 rounded">
          {loopStart !== null ? formatTime(loopStart) : 'Click timeline'}
        </span>
        <span className="text-gray-600 dark:text-gray-400 mx-2 font-bold">→</span>
        <span className="font-mono font-bold text-primary dark:text-accent px-2 py-0.5 rounded">
          {loopEnd !== null ? formatTime(loopEnd) : 'to set loop'}
        </span>
        </div>
      </div>
    </div>
  );
}