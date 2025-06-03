'use client';

import { useState, useEffect } from 'react';

interface LoopCounterProps {
  isLooping: boolean;
  currentTime: number;
  loopEnd: number | null;
}

export default function LoopCounter({ isLooping, currentTime, loopEnd }: LoopCounterProps) {
  const [loopCount, setLoopCount] = useState(0);
  const [practiceTime, setPracticeTime] = useState(0);
  const [lastLoopTime, setLastLoopTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLooping && loopEnd !== null) {
      // Check if we've looped
      if (lastLoopTime !== null && currentTime < lastLoopTime && lastLoopTime >= loopEnd - 0.5) {
        setLoopCount(prev => prev + 1);
      }
      setLastLoopTime(currentTime);
    } else {
      setLoopCount(0);
      setLastLoopTime(null);
    }
  }, [currentTime, isLooping, loopEnd, lastLoopTime]);

  useEffect(() => {
    if (isLooping) {
      const interval = setInterval(() => {
        setPracticeTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setPracticeTime(0);
    }
  }, [isLooping]);

  const formatPracticeTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isLooping) return null;

  return (
    <div className="flex gap-4 justify-center text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔁</span>
        <span>Loop <strong className="text-secondary dark:text-secondary">{loopCount}</strong> of ∞</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl">⏱️</span>
        <span>Practice time: <strong className="text-secondary dark:text-secondary">{formatPracticeTime(practiceTime)}</strong></span>
      </div>
    </div>
  );
}