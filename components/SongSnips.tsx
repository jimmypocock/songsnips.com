'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import YouTubePlayer, { type YouTubePlayerRef } from './YouTubePlayer';
import Timeline from './Timeline';
import ControlButtons from './ControlButtons';
import QuickLoopButtons from './QuickLoopButtons';
import LoopCounter from './LoopCounter';
import SpeedControl from './SpeedControl';
import KeyboardShortcuts, { KeyboardShortcutsHelp } from './KeyboardShortcuts';
import ShareLoop from './ShareLoop';
import SavedLoops from './SavedLoops';
import UnifiedSearch from './UnifiedSearch';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { useLoopMemory } from '@/hooks/useLoopMemory';

export default function SongSnips() {
  const [videoUrl, setVideoUrl] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const playerComponentRef = useRef<YouTubePlayerRef>(null);

  const {
    duration,
    currentTime,
    loopPoints,
    isLooping,
    isPlaying,
    error,
    handlePlayerReady,
    handleStateChange,
    handleError,
    handleDurationChange,
    togglePlayPause,
    stopPlayback,
    setLoopPoint,
    clearLoop,
    seekTo,
    setError,
  } = useYouTubePlayer();

  // Use loop memory hook
  const { savedLoops, saveLoop, deleteLoop, updateLoopName } = useLoopMemory(currentVideoId);

  // Store URL parameters to load after player is ready
  const [urlParams, setUrlParams] = useState<{videoId: string, start?: string, end?: string} | null>(null);

  // Load video from URL
  const handleLoadVideo = useCallback((url: string = videoUrl) => {
    const urlToLoad = url || videoUrl;
    if (!urlToLoad.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (playerComponentRef.current) {
      const videoId = playerComponentRef.current.loadVideo(urlToLoad);
      if (videoId) {
        clearLoop();
        setError(null);
        setCurrentVideoId(videoId);
        // Don't clear videoUrl - we need it for sharing!
        // Instead, store the loaded URL for sharing
        setVideoUrl(urlToLoad);
      } else {
        setError('Please enter a valid YouTube URL');
      }
    }
  }, [videoUrl, clearLoop, setError]);

  // Load from URL parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const videoId = params.get('v');
      const startTime = params.get('start');
      const endTime = params.get('end');

      if (videoId) {
        setUrlParams({ videoId, start: startTime || undefined, end: endTime || undefined });
      }
    }
  }, []);

  // Track when video is ready for URL params
  const [pendingLoopPoints, setPendingLoopPoints] = useState<{start: number, end: number} | null>(null);

  // Load video when player is ready and we have URL params
  useEffect(() => {
    if (urlParams && playerComponentRef.current) {
      const url = `https://www.youtube.com/watch?v=${urlParams.videoId}`;
      
      // Use handleLoadVideo to properly load the video
      handleLoadVideo(url);
      
      // Store loop points to set after video duration is available
      if (urlParams.start && urlParams.end) {
        setPendingLoopPoints({
          start: parseFloat(urlParams.start),
          end: parseFloat(urlParams.end)
        });
      }
      
      // Clear URL params to prevent re-loading
      setUrlParams(null);
    }
  }, [urlParams, handleLoadVideo]);

  // Set loop points once video is loaded
  useEffect(() => {
    if (!pendingLoopPoints || !currentVideoId) return;
    
    // Poll for video readiness instead of relying on duration
    let attempts = 0;
    const maxAttempts = 20; // 10 seconds max
    
    const checkVideoReady = setInterval(() => {
      attempts++;
      const player = playerComponentRef.current?.getPlayer();
      
      // Check if player is ready and has duration
      if (player && player.getDuration && player.getDuration() > 0) {
        clearInterval(checkVideoReady);
        
        // Update duration in the hook if needed
        const videoDuration = player.getDuration();
        if (duration === 0) {
          handleDurationChange(videoDuration);
        }
        
        // Set loop points
        setLoopPoint('start', pendingLoopPoints.start);
        setLoopPoint('end', pendingLoopPoints.end);
        
        // Play briefly then seek and pause
        setTimeout(() => {
          player.playVideo();
          
          setTimeout(() => {
            player.seekTo(pendingLoopPoints.start);
            seekTo(pendingLoopPoints.start);
            
            setTimeout(() => {
              player.pauseVideo();
            }, 100);
          }, 300);
        }, 100);
        
        // Clear pending points
        setPendingLoopPoints(null);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkVideoReady);
        setPendingLoopPoints(null);
      }
    }, 500);
    
    // Cleanup
    return () => clearInterval(checkVideoReady);
  }, [pendingLoopPoints, currentVideoId, setLoopPoint, seekTo, duration, handleDurationChange]);

  // Load video from search result
  const handleVideoSelect = (videoId: string) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    setVideoUrl(url);
    handleLoadVideo(url);
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
        // When adjusting end point, preview mode is auto-enabled in the hook
        // No need to manually adjust position, hook handles it
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

  const handleSpeedChangeKeyboard = (delta: number) => {
    const newSpeed = Math.max(0.25, Math.min(2, playbackSpeed + delta));
    handleSpeedChange(newSpeed);
  };

  const hasLoopPoints = loopPoints.start !== null && loopPoints.end !== null;

  // Handle loading a saved loop
  const handleLoadSavedLoop = (loop: { start: number; end: number }) => {
    setLoopPoint('start', loop.start, false);
    setLoopPoint('end', loop.end, false); // false = don't enable preview mode
    seekTo(loop.start);
  };

  // Auto-save current loop when user leaves page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasLoopPoints && loopPoints.start !== null && loopPoints.end !== null) {
        saveLoop(loopPoints.start, loopPoints.end, 'Last session');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasLoopPoints, loopPoints, saveLoop]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
      <KeyboardShortcuts
        onPlayPause={togglePlayPause}
        onStop={stopPlayback}
        onClearLoop={clearLoop}
        onSeek={handleSeek}
        onSetLoopPoint={handleSetLoopPointAtCurrentTime}
        onSpeedChange={handleSpeedChangeKeyboard}
      />

      {/* Error Messages Only */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg shadow-md animate-shake">
          💔 {error}
        </div>
      )}

      {/* Unified Search - Handles both API and external search */}
      <UnifiedSearch 
        onVideoSelect={handleVideoSelect}
        onUrlSubmit={handleLoadVideo}
      />

      {/* Compact YouTube Player */}
      <div className="relative max-w-full">
        <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ maxHeight: '50vh' }}>
          <YouTubePlayer
            ref={playerComponentRef}
            onReady={handlePlayerReady}
            onStateChange={handleStateChange}
            onError={handleError}
            onDurationChange={handleDurationChange}
            showDebug={showDebug}
          />
        </div>
      </div>

      {/* Compact Timeline & Core Controls */}
      <div className="space-y-2">
        {/* Timeline with Glow Effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-secondary/30 blur-xl rounded-lg"></div>
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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <ControlButtons
                onPlayPause={togglePlayPause}
                onStop={stopPlayback}
                onClearLoop={clearLoop}
                hasLoopPoints={hasLoopPoints}
                isPlaying={isPlaying}
              />
            </div>
            {currentVideoId && (
              <div className="flex items-center gap-2">
                <ShareLoop
                  videoUrl={videoUrl}
                  loopStart={loopPoints.start}
                  loopEnd={loopPoints.end}
                />
                <SavedLoops
                  savedLoops={savedLoops}
                  currentLoop={loopPoints}
                  onSaveLoop={saveLoop}
                  onLoadLoop={handleLoadSavedLoop}
                  onDeleteLoop={deleteLoop}
                  onUpdateLoopName={updateLoopName}
                />
              </div>
            )}
          </div>
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

        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary rounded-lg p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-primary dark:text-accent mb-4">
          How to Use
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
          <li>Paste YouTube URL and tap &ldquo;Load Video&rdquo;</li>
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

      {/* Debug Toggle - Always show for testing */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {showDebug ? 'Hide' : 'Show'} Debug Info
        </button>
      </div>
    </div>
  );
}