'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

interface YouTubePlayer {
  loadVideoById: (videoId: string) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  setPlaybackRate: (suggestedRate: number) => void;
  getPlayerState: () => number;
}

interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data: number;
}

interface YouTubeAPI {
  Player: new (element: HTMLElement, options: {
    height: string;
    width: string;
    videoId: string;
    playerVars?: Record<string, string | number>;
    events?: {
      onReady?: (event: { target: YouTubePlayer }) => void;
      onStateChange?: (event: YouTubePlayerEvent) => void;
      onError?: (event: { data: number }) => void;
    };
  }) => YouTubePlayer;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT: YouTubeAPI;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  onReady?: (player: YouTubePlayer) => void;
  onStateChange?: (event: YouTubePlayerEvent) => void;
  onError?: (event: { data: number }) => void;
  onDurationChange?: (duration: number) => void;
  showDebug?: boolean;
}

export interface YouTubePlayerRef {
  loadVideo: (url: string) => string | null;
  getPlayer: () => YouTubePlayer | null;
}

const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(({ onReady, onStateChange, onError, onDurationChange, showDebug = false }, ref) => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isPlayerInitialized, setIsPlayerInitialized] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [scriptLoadFailed, setScriptLoadFailed] = useState(false);
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Add debug log
  const addDebug = useCallback((message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(`[SongSnips Debug] ${message}`);
  }, []);

  // Add global error listeners for debugging
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      addDebug(`[Global Error] ${event.message} at ${event.filename}:${event.lineno}`);
    };
    
    const handleSecurityPolicy = (e: SecurityPolicyViolationEvent) => {
      addDebug(`[CSP Violation] ${e.violatedDirective} - ${e.blockedURI}`);
    };
    
    window.addEventListener('error', handleError);
    document.addEventListener('securitypolicyviolation', handleSecurityPolicy);
    
    return () => {
      window.removeEventListener('error', handleError);
      document.removeEventListener('securitypolicyviolation', handleSecurityPolicy);
    };
  }, [addDebug]);

  // Initialize YouTube API and player on demand
  const initializePlayer = useCallback(() => {
    if (isPlayerInitialized) {
      addDebug('[YouTube] Player already initialized');
      return;
    }
    
    addDebug('[YouTube] Initializing player...');
    setIsPlayerInitialized(true);
    
    if (typeof window !== 'undefined' && !window.YT) {
      addDebug('[YouTube] Loading YouTube API script...');
      
      // Try different loading method for mobile
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        addDebug('[YouTube] Detected mobile device, using alternative loading method');
        
        // Check for potential blocking issues
        if ('connection' in navigator) {
          const nav = navigator as Navigator & {
            connection?: {
              effectiveType?: string;
              saveData?: boolean;
            };
          };
          if (nav.connection) {
            addDebug(`[YouTube] Connection type: ${nav.connection.effectiveType}, Save data: ${nav.connection.saveData}`);
          }
        }
        
        // Check if we're in a secure context
        addDebug(`[YouTube] Secure context: ${window.isSecureContext}`);
        addDebug(`[YouTube] Protocol: ${window.location.protocol}`);
        
        // Check for existing YouTube scripts
        const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
        if (existingScript) {
          addDebug('[YouTube] Found existing YouTube script');
          return;
        }
        
        // Direct approach for mobile without delay or string injection
        addDebug('[YouTube] Using direct script injection for mobile');
        
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        
        tag.onload = () => {
          addDebug('[YouTube] Script tag loaded successfully');
        };
        
        tag.onerror = (error) => {
          addDebug(`[YouTube] Script load error: ${JSON.stringify(error)}`);
          setScriptLoadFailed(true);
        };
        
        // Add to body instead of head for mobile
        document.body.appendChild(tag);
        addDebug('[YouTube] Script tag appended to body');
        
        // Set up callback
        window.onYouTubeIframeAPIReady = () => {
          addDebug('[YouTube] Mobile API ready!');
          setIsAPIReady(true);
        };
        
        // Check periodically if YT is available
        let checkCount = 0;
        const checkInterval = setInterval(() => {
          checkCount++;
          if (window.YT && window.YT.Player) {
            addDebug('[YouTube] Found YT object on mobile!');
            clearInterval(checkInterval);
            setIsAPIReady(true);
          } else if (checkCount > 20) { // 10 seconds
            addDebug('[YouTube] Mobile load timeout');
            clearInterval(checkInterval);
            setScriptLoadFailed(true);
          }
        }, 500);
      } else {
        // Desktop loading method
        const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
        if (existingScript) {
          addDebug('[YouTube] Found existing YouTube script on desktop');
          return;
        }
        
        window.onYouTubeIframeAPIReady = () => {
          addDebug('[YouTube] Desktop API ready!');
          setIsAPIReady(true);
        };
        
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        
        tag.onerror = () => {
          addDebug('[YouTube] Failed to load API script!');
          setScriptLoadFailed(true);
        };
        
        tag.onload = () => {
          addDebug('[YouTube] Script tag loaded');
          // Check immediately and after a delay
          if (window.YT && window.YT.Player) {
            addDebug('[YouTube] YT object available immediately');
            setIsAPIReady(true);
          } else {
            setTimeout(() => {
              if (window.YT && window.YT.Player && !isAPIReady) {
                addDebug('[YouTube] Found YT object after delay');
                setIsAPIReady(true);
              }
            }, 1000);
          }
        };
        
        document.body.appendChild(tag);
        addDebug('[YouTube] Script tag appended to body');
      }
    } else if (window.YT && window.YT.Player) {
      addDebug('[YouTube] API already loaded');
      setIsAPIReady(true);
    }
  }, [isPlayerInitialized, addDebug, isAPIReady]);

  // Create player when API is ready
  useEffect(() => {
    if (isAPIReady && containerRef.current && !playerRef.current && isPlayerInitialized) {
      addDebug('[YouTube] Creating player instance...');
      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId || '',
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
          onReady: (event: { target: YouTubePlayer }) => {
            addDebug('[YouTube] Player ready!');
            onReady?.(event.target);
            // If we have a videoId waiting, load it now
            if (videoId && event.target.loadVideoById) {
              addDebug(`[YouTube] Loading video: ${videoId}`);
              event.target.loadVideoById(videoId);
            }
          },
          onStateChange: (event: YouTubePlayerEvent) => {
            if (event.data === window.YT.PlayerState.PLAYING && playerRef.current) {
              const duration = playerRef.current.getDuration();
              onDurationChange?.(duration);
            }
            onStateChange?.(event);
          },
          onError: (event: { data: number }) => {
            addDebug(`[YouTube] Player error: ${event.data}`);
            onError?.(event);
          },
        },
      });
      } catch (error) {
        addDebug(`[YouTube] Error creating player: ${error}`);
        onError?.({ data: -1 });
      }
    }
  }, [isAPIReady, isPlayerInitialized, videoId, onReady, onStateChange, onError, onDurationChange, addDebug]);

  // Extract video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Initialize player eagerly on mobile
  useEffect(() => {
    if (isMobile && !isPlayerInitialized) {
      addDebug('[YouTube] Mobile detected, initializing player eagerly');
      initializePlayer();
    }
  }, [isMobile, isPlayerInitialized, initializePlayer, addDebug]);

  // Load video function - initialize player if needed
  const loadVideo = useCallback((url: string) => {
    const extractedVideoId = extractVideoId(url);
    if (!extractedVideoId) return null;
    
    setVideoId(extractedVideoId);
    
    
    // Initialize player on first video load (desktop only, mobile already initialized)
    if (!isPlayerInitialized && !isMobile) {
      initializePlayer();
      // The video will be loaded once the player is ready
      return extractedVideoId;
    }
    
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(extractedVideoId);
    }
    return extractedVideoId;
  }, [isPlayerInitialized, initializePlayer, isMobile]);

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
        <div ref={containerRef} id="youtube-player-container" className="absolute inset-0" />
        
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
        
        {!isPlayerInitialized ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#012f49] to-gray-900 text-white">
            <div className="text-center">
              <p className="text-lg mb-2">🎵 YouTube Player</p>
              <p className="text-sm opacity-75">Load a video to start</p>
            </div>
          </div>
        ) : !isAPIReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#012f49] to-gray-900 text-white p-4">
            <div className="text-center max-w-full">
              <p className="text-lg mb-2">🎵 Loading YouTube Player...</p>
              <p className="text-sm opacity-75 mb-4">This may take a moment</p>
              
              {/* Fallback for script load failure */}
              {scriptLoadFailed && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-red-400 mb-3">Failed to load YouTube API</p>
                  <button
                    onClick={() => {
                      setScriptLoadFailed(false);
                      initializePlayer();
                    }}
                    className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-white rounded-lg mb-3"
                  >
                    Retry
                  </button>
                  <div className="text-xs opacity-75 space-y-1">
                    <p>If this persists on mobile, try:</p>
                    <ul className="list-disc list-inside text-left max-w-xs mx-auto">
                      <li>Opening in desktop mode</li>
                      <li>Disabling ad blockers</li>
                      <li>Using a different browser</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Debug info for mobile */}
              {showDebug && debugInfo.length > 0 && (
                <div className="mt-4 p-2 bg-black/50 rounded text-left text-xs font-mono max-h-40 overflow-y-auto">
                  {debugInfo.map((info, i) => (
                    <div key={i} className="mb-1">{info}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;