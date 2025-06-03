'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  onReady?: (player: any) => void;
  onStateChange?: (event: any) => void;
  onError?: (event: any) => void;
  onDurationChange?: (duration: number) => void;
}

const YouTubePlayer = forwardRef<any, YouTubePlayerProps>(({ onReady, onStateChange, onError, onDurationChange }, ref) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsAPIReady(true);
      };
    } else if (window.YT && window.YT.Player) {
      setIsAPIReady(true);
    }
  }, []);

  // Initialize player when API is ready
  useEffect(() => {
    if (isAPIReady && containerRef.current && !playerRef.current) {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: {
          controls: 0,           // Hide YouTube controls
          modestbranding: 1,     // Minimal YouTube branding (deprecated but still works)
          rel: 0,                // No related videos at the end
          autoplay: 0,           // Don't autoplay
          showinfo: 0,           // Hide video title and uploader (deprecated)
          fs: 0,                 // Hide fullscreen button
          disablekb: 1,          // Disable keyboard controls (we have our own)
          iv_load_policy: 3,     // Hide video annotations
          playsinline: 1,        // Play inline on iOS
          enablejsapi: 1,        // Enable JavaScript API
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: (event: any) => {
            onReady?.(event.target);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING && playerRef.current) {
              const duration = playerRef.current.getDuration();
              onDurationChange?.(duration);
            }
            onStateChange?.(event);
          },
          onError: (event: any) => {
            onError?.(event);
          },
        },
      });
    }
  }, [isAPIReady, onReady, onStateChange, onError, onDurationChange]);

  // Extract video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Load video function
  const loadVideo = useCallback((url: string) => {
    const extractedVideoId = extractVideoId(url);
    if (extractedVideoId && playerRef.current && playerRef.current.loadVideoById) {
      setVideoId(extractedVideoId);
      playerRef.current.loadVideoById(extractedVideoId);
    }
    return extractedVideoId;
  }, []);

  // Get player instance
  const getPlayer = useCallback(() => {
    return playerRef.current;
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    loadVideo,
    getPlayer,
  }), [loadVideo, getPlayer]);

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-900">
      <div className="relative w-full h-full overflow-hidden">
        <div ref={containerRef} className="absolute inset-0" />
        
        {/* Invisible overlay to prevent accidental YouTube UI interactions */}
        {videoId && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Small clickable area in center for play/pause if needed */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 pointer-events-auto opacity-0 hover:opacity-100 transition-opacity">
                {/* This area can be used for custom play/pause if desired */}
              </div>
            </div>
          </div>
        )}
        
        {!isAPIReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#012f49] to-gray-900 text-white">
            <div className="text-center">
              <p className="text-lg mb-2">🎵 Loading YouTube Player...</p>
              <p className="text-sm opacity-75">This may take a moment on first load</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;