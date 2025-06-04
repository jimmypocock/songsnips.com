'use client';

import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onPlayPause: () => void;
  onStop: () => void;
  onClearLoop: () => void;
  onSeek: (delta: number) => void;
  onSetLoopPoint: (type: 'start' | 'end') => void;
  onSpeedChange?: (delta: number) => void;
  isEnabled?: boolean;
}

export default function KeyboardShortcuts({
  onPlayPause,
  onStop,
  onClearLoop,
  onSeek,
  onSetLoopPoint,
  onSpeedChange,
  isEnabled = true,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          onPlayPause();
          break;
        case 'a':
          e.preventDefault();
          onSetLoopPoint('start');
          break;
        case 'b':
          e.preventDefault();
          onSetLoopPoint('end');
          break;
        case 'c':
          e.preventDefault();
          onClearLoop();
          break;
        case 'r':
          e.preventDefault();
          onStop();
          break;
        case 'arrowleft':
          e.preventDefault();
          onSeek(e.shiftKey ? -1 : -5);
          break;
        case 'arrowright':
          e.preventDefault();
          onSeek(e.shiftKey ? 1 : 5);
          break;
        case 'arrowup':
          e.preventDefault();
          if (onSpeedChange) {
            onSpeedChange(0.1); // Increase speed by 0.1x
          }
          break;
        case 'arrowdown':
          e.preventDefault();
          if (onSpeedChange) {
            onSpeedChange(-0.1); // Decrease speed by 0.1x
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPlayPause, onStop, onClearLoop, onSeek, onSetLoopPoint, onSpeedChange, isEnabled]);

  return null;
}

// Keyboard shortcuts help component
export function KeyboardShortcutsHelp() {
  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-[#012f49]/5 to-[#fcc04a]/5 dark:from-[#012f49]/10 dark:to-[#fcc04a]/10 rounded-lg border border-[#012f49]/10">
      <h4 className="font-semibold text-sm mb-2 text-[#012f49] dark:text-gray-300">Keyboard Shortcuts:</h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
        <div><kbd className="px-2 py-1 bg-[#012f49] text-white dark:bg-gray-700 rounded font-mono">Space</kbd> Play/Pause</div>
        <div><kbd className="px-2 py-1 bg-[#012f49] text-white dark:bg-gray-700 rounded font-mono">A</kbd> Set Loop Start</div>
        <div><kbd className="px-2 py-1 bg-[#012f49] text-white dark:bg-gray-700 rounded font-mono">B</kbd> Set Loop End</div>
        <div><kbd className="px-2 py-1 bg-[#012f49] text-white dark:bg-gray-700 rounded font-mono">←/→</kbd> Seek 5s</div>
        <div><kbd className="px-2 py-1 bg-[#012f49] text-white dark:bg-gray-700 rounded font-mono">↑/↓</kbd> Adjust Speed</div>
        <div><kbd className="px-2 py-1 bg-[#012f49] text-white dark:bg-gray-700 rounded font-mono">C</kbd> Clear Loop</div>
        <div><kbd className="px-2 py-1 bg-[#012f49] text-white dark:bg-gray-700 rounded font-mono">R</kbd> Reset to Start</div>
        <div><kbd className="px-2 py-1 bg-[#012f49] text-white dark:bg-gray-700 rounded font-mono">Shift + ←/→</kbd> Seek 1s</div>
      </div>
    </div>
  );
}