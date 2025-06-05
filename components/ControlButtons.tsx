'use client';

interface ControlButtonsProps {
  onPlayPause: () => void;
  onStop: () => void;
  onClearLoop: () => void;
  hasLoopPoints: boolean;
  isPlaying?: boolean;
}

export default function ControlButtons({
  onPlayPause,
  onStop,
  onClearLoop,
  hasLoopPoints,
  isPlaying = false,
}: ControlButtonsProps) {
  return (
    <div className="flex gap-2 justify-start">
      {/* Play/Pause Button - Green for Play, Yellow for Pause */}
      <button
        onClick={onPlayPause}
        className={`relative w-20 py-3 ${isPlaying 
          ? 'bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600' 
          : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
        } active:scale-95 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 min-h-[48px] flex items-center justify-center overflow-hidden group`}
      >
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        {isPlaying ? (
          <svg className="relative w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="5" width="4" height="14" rx="1"/>
            <rect x="14" y="5" width="4" height="14" rx="1"/>
          </svg>
        ) : (
          <svg className="relative w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>

      {/* Stop Button - Theme Red */}
      <button
        onClick={onStop}
        className="relative w-20 py-3 bg-gradient-to-br from-danger to-red-600 hover:from-red-600 hover:to-danger active:scale-95 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 min-h-[48px] flex items-center justify-center overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <svg className="relative w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="2"/>
        </svg>
      </button>

      {/* Clear Loop Button with Gradient */}
      <button
        onClick={onClearLoop}
        disabled={!hasLoopPoints}
        className={`relative w-20 py-3 font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-white min-h-[48px] flex items-center justify-center overflow-hidden group
          ${hasLoopPoints 
            ? 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 active:scale-95' 
            : 'bg-gray-400 cursor-not-allowed opacity-50'
          }
        `}
      >
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <svg className="relative w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
      </button>
    </div>
  );
}