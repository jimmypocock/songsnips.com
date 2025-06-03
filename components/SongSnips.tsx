'use client';

import { useRef, useState } from 'react';
import YouTubePlayer from './YouTubePlayer';
import Timeline from './Timeline';
import ControlButtons from './ControlButtons';
import QuickLoopButtons from './QuickLoopButtons';
import LoopCounter from './LoopCounter';
import SpeedControl from './SpeedControl';
import KeyboardShortcuts, { KeyboardShortcutsHelp } from './KeyboardShortcuts';
import ShareLoop from './ShareLoop';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { useEffect } from 'react';

export default function SongSnips() {
  const [videoUrl, setVideoUrl] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const playerComponentRef = useRef<any>(null);

  const {
    duration,
    currentTime,
    loopPoints,
    isLooping,
    isPlaying,
    error,
    success,
    handlePlayerReady,
    handleStateChange,
    handleError,
    handleDurationChange,
    togglePlayPause,
    stopPlayback,
    setLoopPoint,
    clearLoop,
    toggleLoop,
    seekTo,
    setError,
    setSuccess,
  } = useYouTubePlayer();

  // Load from URL parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const videoId = params.get('v');
      const startTime = params.get('start');
      const endTime = params.get('end');

      if (videoId) {
        const url = `https://youtube.com/watch?v=${videoId}`;
        setVideoUrl(url);

        // Auto-load the video after a short delay
        setTimeout(() => {
          if (playerComponentRef.current) {
            const player = playerComponentRef.current.getPlayer();
            if (player && player.loadVideoById) {
              player.loadVideoById(videoId);

              // Set loop points if provided
              if (startTime && endTime) {
                setTimeout(() => {
                  setLoopPoint('start', parseFloat(startTime));
                  setLoopPoint('end', parseFloat(endTime));
                  setSuccess('Video and loop loaded from shared link!');
                }, 1000);
              }
            }
          }
        }, 1000);
      }
    }
  }, [setLoopPoint, setSuccess]);

  // Extract video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Load video
  const handleLoadVideo = () => {
    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    if (playerComponentRef.current) {
      const player = playerComponentRef.current.getPlayer();
      if (player && player.loadVideoById) {
        player.loadVideoById(videoId);
        clearLoop();
        setSuccess('Video loaded successfully! Click on the timeline to set your loop points.');
        setError(null);
      } else {
        setError('Player is initializing... Please try again in a moment.');
      }
    }
  };

  // Load test video
  const handleLoadTestVideo = () => {
    const testUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';
    setVideoUrl(testUrl);

    // Use the video ID directly
    if (playerComponentRef.current) {
      const player = playerComponentRef.current.getPlayer();
      if (player && player.loadVideoById) {
        player.loadVideoById('jNQXAC9IVRw');
        clearLoop();
        setSuccess('Test video loaded successfully! Click on the timeline to set your loop points.');
        setError(null);
      }
    }
  };

  // Handle timeline click
  const handleTimelineClick = (time: number) => {
    // Set loop points
    if (loopPoints.start === null) {
      setLoopPoint('start', time);
      seekTo(time);
    } else if (loopPoints.end === null) {
      if (time > loopPoints.start) {
        setLoopPoint('end', time);
        // Don't seek when setting end point
      } else {
        setLoopPoint('start', time);
        seekTo(time);
      }
    } else {
      // Both points set, update closest one
      const distToStart = Math.abs(time - loopPoints.start);
      const distToEnd = Math.abs(time - loopPoints.end);

      if (distToStart < distToEnd) {
        setLoopPoint('start', time);
        seekTo(time);
      } else {
        setLoopPoint('end', time);
        // Don't seek when adjusting end point
      }
    }
  };

  // Handle loop point change (from dragging or clicking)
  const handleLoopPointChange = (type: 'start' | 'end', time: number, isDragging: boolean = false) => {
    setLoopPoint(type, time);

    // Only adjust playback position when dragging, not clicking
    if (isDragging) {
      // Smart playback position handling when dragging
      if (type === 'end') {
        // When adjusting end point
        if (time < currentTime) {
          // If new end is before current position, jump to loop start
          if (loopPoints.start !== null) {
            seekTo(loopPoints.start);
          }
        }
        // Otherwise, don't interrupt playback
      } else if (type === 'start') {
        // When adjusting start point
        if (time > currentTime) {
          // If new start is after current position, jump to new start
          seekTo(time);
        }
        // Otherwise, don't interrupt playback
      }
    }
  };

  // Handle speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    const player = playerComponentRef.current?.getPlayer();
    if (player && player.setPlaybackRate) {
      player.setPlaybackRate(speed);
    }
  };

  // Handle quick loop
  const handleQuickLoop = (start: number, end: number) => {
    setLoopPoint('start', start);
    setLoopPoint('end', end);
    // Loop will auto-enable when both points are set
    seekTo(start);
  };

  // Handle keyboard shortcut actions
  const handleSeek = (delta: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + delta));
    seekTo(newTime);
  };

  const handleSetLoopPointAtCurrentTime = (type: 'start' | 'end') => {
    setLoopPoint(type, currentTime);
  };

  const hasLoopPoints = loopPoints.start !== null && loopPoints.end !== null;

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
      <KeyboardShortcuts
        onPlayPause={togglePlayPause}
        onStop={stopPlayback}
        onClearLoop={clearLoop}
        onSeek={handleSeek}
        onSetLoopPoint={handleSetLoopPointAtCurrentTime}
      />

      {/* Animated Error/Success Messages */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg shadow-md animate-shake">
          💔 {error}
        </div>
      )}

      {/* Compact URL Input with Gradient Border */}
      <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-primary via-secondary to-accent mb-2">
        <div className="flex gap-2 bg-white dark:bg-gray-900 rounded-lg p-1">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLoadVideo()}
            placeholder="YouTube URL 🎶"
            className="flex-1 px-3 py-2 rounded-md focus:outline-none bg-transparent text-sm placeholder-gray-400"
          />
          <button
            onClick={handleLoadVideo}
            className="px-4 py-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-medium rounded-md text-sm whitespace-nowrap transform hover:scale-105 transition-all duration-200 shadow-sm"
          >
            Load ✨
          </button>
          <button
            onClick={handleLoadTestVideo}
            className="px-3 py-2 bg-gradient-to-r from-secondary/20 to-accent/20 hover:from-secondary/30 hover:to-accent/30 text-secondary dark:text-secondary font-medium text-sm rounded-md transform hover:scale-105 transition-all duration-200"
            title="Load test video"
          >
            Test
          </button>
        </div>
      </div>

      {/* Compact YouTube Player */}
      <div className="relative max-w-full">
        <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ maxHeight: '50vh' }}>
          <YouTubePlayer
            ref={playerComponentRef}
            onReady={handlePlayerReady}
            onStateChange={handleStateChange}
            onError={handleError}
            onDurationChange={handleDurationChange}
          />
        </div>
      </div>

      {/* Compact Timeline & Core Controls */}
      <div className="space-y-2">
        {/* Timeline with Glow Effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-xl rounded-lg"></div>
          <div className="relative bg-white dark:bg-gray-800/90 rounded-lg p-3 shadow-lg backdrop-blur-sm">
            <Timeline
              duration={duration}
              currentTime={currentTime}
              loopStart={loopPoints.start}
              loopEnd={loopPoints.end}
              onTimelineClick={handleTimelineClick}
              onLoopPointChange={handleLoopPointChange}
            />
          </div>
        </div>

        {/* Core Controls - Immediately accessible */}
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 shadow">
          <ControlButtons
            onPlayPause={togglePlayPause}
            onStop={stopPlayback}
            onClearLoop={clearLoop}
            hasLoopPoints={hasLoopPoints}
            isPlaying={isPlaying}
          />
        </div>
      </div>

      {/* Secondary Controls - Below the fold */}
      <div className="space-y-3 mt-4">
        {/* Quick Loop Buttons */}
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 shadow">
          <QuickLoopButtons
            currentTime={currentTime}
            duration={duration}
            onSetQuickLoop={handleQuickLoop}
            isDisabled={duration === 0}
          />
        </div>

        {/* Loop Counter & Speed Control */}
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 shadow space-y-3">
          <LoopCounter
            isLooping={isLooping}
            currentTime={currentTime}
            loopEnd={loopPoints.end}
          />

          <div className="flex justify-center">
            <SpeedControl
              currentSpeed={playbackSpeed}
              onSpeedChange={handleSpeedChange}
            />
          </div>

          <div className="flex justify-center">
            <ShareLoop
              videoUrl={videoUrl}
              loopStart={loopPoints.start}
              loopEnd={loopPoints.end}
            />
          </div>
        </div>
      </div>

      {/* Instructions - Collapsible on Mobile */}
      <details className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary rounded-lg">
        <summary className="p-4 md:p-6 cursor-pointer">
          <h3 className="inline text-base md:text-lg font-semibold text-primary dark:text-accent">
            How to Use
          </h3>
        </summary>
        <div className="px-4 pb-4 md:px-6 md:pb-6 -mt-2">
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
            <li>Paste YouTube URL and tap "Load Video"</li>
            <li>Tap timeline to set loop start</li>
            <li>Tap again for loop end</li>
            <li>Drag markers to adjust</li>
          </ol>
          <div className="mt-4 space-y-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Tip:</strong> Use quick loop buttons for instant loops</p>
          </div>
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="mt-3 text-xs md:text-sm text-secondary hover:text-secondary-hover dark:text-secondary dark:hover:text-secondary-hover font-medium underline underline-offset-2"
          >
            {showShortcuts ? 'Hide' : 'Show'} Keyboard Shortcuts
          </button>
          {showShortcuts && <KeyboardShortcutsHelp />}
        </div>
      </details>
    </div>
  );
}