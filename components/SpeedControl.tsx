'use client';

import { useState, useEffect } from 'react';

interface SpeedControlProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
}

// Musician-focused speed presets
const SPEED_PRESETS = [
  { value: 0.25, label: '25%' },
  { value: 0.5, label: '50%' },
  { value: 0.75, label: '75%' },
  { value: 0.85, label: '85%' },
  { value: 1, label: '100%' },
];

export default function SpeedControl({ currentSpeed, onSpeedChange }: SpeedControlProps) {
  const [customSpeed, setCustomSpeed] = useState(currentSpeed.toFixed(2));
  const [showCustom, setShowCustom] = useState(false);
  
  // Update custom speed input when current speed changes
  useEffect(() => {
    setCustomSpeed(currentSpeed.toFixed(2));
  }, [currentSpeed]);
  const handleCustomSpeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const speed = parseFloat(customSpeed);
    if (!isNaN(speed) && speed >= 0.1 && speed <= 2) {
      onSpeedChange(speed);
      setShowCustom(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">Speed:</span>
        <div className="flex gap-1">
          {SPEED_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onSpeedChange(preset.value)}
              className={`
                px-3 py-1 text-xs font-medium rounded transition-all
                ${Math.abs(currentSpeed - preset.value) < 0.01
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }
              `}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={`
              px-3 py-1 text-xs font-medium rounded transition-all
              ${showCustom
                ? 'bg-secondary text-white shadow-md' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }
            `}
            title="Custom speed"
          >
            Custom
          </button>
        </div>
      </div>
      
      {showCustom && (
        <form onSubmit={handleCustomSpeedSubmit} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
          <label className="text-xs text-gray-600 dark:text-gray-400">Custom speed:</label>
          <input
            type="number"
            value={customSpeed}
            onChange={(e) => setCustomSpeed(e.target.value)}
            min="0.1"
            max="2"
            step="0.05"
            className="w-20 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary"
            autoFocus
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">x</span>
          <button
            type="submit"
            className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-hover transition-colors"
          >
            Set
          </button>
        </form>
      )}
      
      <div className="text-center">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Current: {currentSpeed.toFixed(2)}x
        </span>
      </div>
    </div>
  );
}