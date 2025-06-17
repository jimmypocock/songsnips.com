import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import YouTubePlayer, { YouTubePlayerRef } from './YouTubePlayer'
import { mockYouTubePlayer, mockYouTubeAPI } from '../src/test/setup'
import { createRef } from 'react'

// Mock navigator.userAgent for mobile detection tests
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    value: userAgent,
    writable: true,
    configurable: true
  })
}

describe('YouTubePlayer', () => {
  const mockOnReady = vi.fn()
  const mockOnStateChange = vi.fn()
  const mockOnError = vi.fn()
  const mockOnDurationChange = vi.fn()

  beforeEach(() => {
    vi.clearAllTimers()
    vi.useFakeTimers()
    
    // Reset all mocks
    vi.clearAllMocks()
    
    // Reset YouTube API to initial state
    mockYouTubePlayer.loadVideoById.mockClear()
    mockYouTubePlayer.getDuration.mockReturnValue(100)
    
    // Mock console.log to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    
    // Reset document state
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    
    // Reset window properties - start with undefined YT
    Object.defineProperty(window, 'YT', {
      value: undefined,
      writable: true,
      configurable: true
    })
    window.onYouTubeIframeAPIReady = undefined as unknown as () => void
    
    // Mock a desktop user agent by default
    mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('Initial Render', () => {
    it('should render initial loading state', () => {
      render(<YouTubePlayer />)
      
      expect(screen.getByText('🎵 YouTube Player')).toBeInTheDocument()
      expect(screen.getByText('Load a video to start')).toBeInTheDocument()
    })

    it('should render with debug info when showDebug is true', () => {
      render(<YouTubePlayer showDebug={true} />)
      
      expect(screen.getByText('🎵 YouTube Player')).toBeInTheDocument()
    })

    it('should have proper container structure', () => {
      render(<YouTubePlayer />)
      
      const container = document.querySelector('#youtube-player-container')
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('absolute', 'inset-0')
    })
  })

  describe('Video ID Extraction', () => {
    it('should extract video ID from standard YouTube URL', () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      act(() => {
        const videoId = ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU')
        expect(videoId).toBe('8inJtTG_DuU')
      })
    })

    it('should extract video ID from youtu.be URL', () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      act(() => {
        const videoId = ref.current?.loadVideo('https://youtu.be/8inJtTG_DuU')
        expect(videoId).toBe('8inJtTG_DuU')
      })
    })

    it('should extract video ID from embed URL', () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      act(() => {
        const videoId = ref.current?.loadVideo('https://www.youtube.com/embed/8inJtTG_DuU')
        expect(videoId).toBe('8inJtTG_DuU')
      })
    })

    it('should return null for invalid URLs', () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      act(() => {
        const videoId = ref.current?.loadVideo('https://example.com/not-youtube')
        expect(videoId).toBeNull()
      })
    })

    it('should handle URLs with additional parameters', () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      act(() => {
        const videoId = ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU&t=120s&list=PLabc123')
        expect(videoId).toBe('8inJtTG_DuU')
      })
    })
  })

  describe('Mobile Detection', () => {
    it('should detect iPhone user agent', () => {
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)')
      
      render(<YouTubePlayer showDebug={true} />)
      
      // Should show mobile detection in debug logs
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[SongSnips Debug] [YouTube] Mobile detected, initializing player eagerly')
      )
    })

    it('should detect Android user agent', () => {
      mockUserAgent('Mozilla/5.0 (Linux; Android 11; SM-G991B)')
      
      render(<YouTubePlayer showDebug={true} />)
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[SongSnips Debug] [YouTube] Mobile detected, initializing player eagerly')
      )
    })

    it('should not trigger mobile behavior on desktop', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
      
      render(<YouTubePlayer showDebug={true} />)
      
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining('Mobile detected')
      )
    })
  })

  describe('Script Loading', () => {
    it('should initialize player when loading video', () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      act(() => {
        // Trigger player initialization
        ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU')
      })
      
      // Should log initialization
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[SongSnips Debug] [YouTube] Initializing player...')
      )
    })
  })

  describe('Player Initialization', () => {
    it('should create player when API is ready', async () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} onReady={mockOnReady} />)
      
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU')
      })
      
      // Set up API and trigger ready
      act(() => {
        window.YT = mockYouTubeAPI
        if (window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady()
        }
      })
      
      await waitFor(() => {
        expect(mockYouTubeAPI.Player).toHaveBeenCalled()
      })
    })

    it('should pass correct player configuration', async () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} onReady={mockOnReady} />)
      
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU')
      })
      
      // Set up API and trigger ready
      act(() => {
        window.YT = mockYouTubeAPI
        if (window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady()
        }
      })
      
      await waitFor(() => {
        expect(mockYouTubeAPI.Player).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.objectContaining({
            height: '100%',
            width: '100%',
            videoId: '8inJtTG_DuU',
            playerVars: expect.objectContaining({
              controls: 0,
              modestbranding: 1,
              rel: 0,
              autoplay: 0,
              showinfo: 0,
              fs: 0,
              disablekb: 1,
              iv_load_policy: 3,
              playsinline: 1,
              enablejsapi: 1
            }),
            events: expect.objectContaining({
              onReady: expect.any(Function),
              onStateChange: expect.any(Function),
              onError: expect.any(Function)
            })
          })
        )
      })
    })

    it('should handle player creation errors', async () => {
      // Mock YT.Player constructor to throw
      mockYouTubeAPI.Player.mockImplementation(() => {
        throw new Error('Player creation failed')
      })
      
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} onError={mockOnError} />)
      
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU')
      })
      
      // Set up API and trigger ready
      act(() => {
        window.YT = mockYouTubeAPI
        if (window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady()
        }
      })
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith({ data: -1 })
      })
    })
  })

  describe('Event Handling', () => {
    it('should call onReady when player is ready', async () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} onReady={mockOnReady} />)
      
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU')
      })
      
      // Trigger API ready and player creation
      act(() => {
        window.YT = mockYouTubeAPI
        if (window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady()
        }
      })
      
      await waitFor(() => {
        expect(mockYouTubeAPI.Player).toHaveBeenCalled()
      })
      
      // Get the events object passed to the player
      const playerCall = mockYouTubeAPI.Player.mock.calls[0]
      const events = playerCall[1].events
      
      // Simulate onReady event
      act(() => {
        events.onReady({ target: mockYouTubePlayer })
      })
      
      expect(mockOnReady).toHaveBeenCalledWith(mockYouTubePlayer)
    })

    it('should call onStateChange when player state changes', async () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} onStateChange={mockOnStateChange} />)
      
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU')
      })
      
      act(() => {
        window.YT = mockYouTubeAPI
        if (window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady()
        }
      })
      
      await waitFor(() => {
        expect(mockYouTubeAPI.Player).toHaveBeenCalled()
      })
      
      const events = mockYouTubeAPI.Player.mock.calls[0][1].events
      
      // Simulate state change event
      const stateChangeEvent = {
        target: mockYouTubePlayer,
        data: mockYouTubeAPI.PlayerState.PLAYING
      }
      
      act(() => {
        events.onStateChange(stateChangeEvent)
      })
      
      expect(mockOnStateChange).toHaveBeenCalledWith(stateChangeEvent)
    })

    it('should call onDurationChange when video starts playing', async () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} onDurationChange={mockOnDurationChange} />)
      
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU')
      })
      
      act(() => {
        window.YT = mockYouTubeAPI
        if (window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady()
        }
      })
      
      await waitFor(() => {
        expect(mockYouTubeAPI.Player).toHaveBeenCalled()
      })
      
      const events = mockYouTubeAPI.Player.mock.calls[0][1].events
      
      // Simulate playing state
      mockYouTubePlayer.getDuration.mockReturnValue(180)
      
      act(() => {
        events.onStateChange({
          target: mockYouTubePlayer,
          data: mockYouTubeAPI.PlayerState.PLAYING
        })
      })
      
      expect(mockOnDurationChange).toHaveBeenCalledWith(180)
    })

    it('should call onError when player errors occur', async () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} onError={mockOnError} />)
      
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU')
      })
      
      act(() => {
        window.YT = mockYouTubeAPI
        if (window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady()
        }
      })
      
      await waitFor(() => {
        expect(mockYouTubeAPI.Player).toHaveBeenCalled()
      })
      
      const events = mockYouTubeAPI.Player.mock.calls[0][1].events
      
      // Simulate error event
      act(() => {
        events.onError({ data: 101 })
      })
      
      expect(mockOnError).toHaveBeenCalledWith({ data: 101 })
    })
  })

  describe('Video Loading', () => {
    it('should load video immediately if player is ready', async () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      // Initialize player first
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=first_video')
      })
      
      act(() => {
        window.YT = mockYouTubeAPI
        if (window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady()
        }
      })
      
      await waitFor(() => {
        expect(mockYouTubeAPI.Player).toHaveBeenCalled()
      })
      
      // Load different video
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU')
      })
      
      expect(mockYouTubePlayer.loadVideoById).toHaveBeenCalledWith('8inJtTG_DuU')
    })

    it('should load video after player becomes ready', async () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      // Load video before player is ready
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU')
      })
      
      // Player should be initialized
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[SongSnips Debug] [YouTube] Initializing player...')
      )
      
      // Set up API and trigger ready
      act(() => {
        window.YT = mockYouTubeAPI
        if (window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady()
        }
      })
      
      await waitFor(() => {
        expect(mockYouTubeAPI.Player).toHaveBeenCalled()
      })
      
      // Simulate player ready event
      const events = mockYouTubeAPI.Player.mock.calls[0][1].events
      act(() => {
        events.onReady({ target: mockYouTubePlayer })
      })
      
      expect(mockYouTubePlayer.loadVideoById).toHaveBeenCalledWith('8inJtTG_DuU')
    })
  })

  describe('Ref Methods', () => {
    it('should expose loadVideo method via ref', () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      expect(ref.current?.loadVideo).toBeDefined()
      expect(typeof ref.current?.loadVideo).toBe('function')
    })

    it('should expose getPlayer method via ref', () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      expect(ref.current?.getPlayer).toBeDefined()
      expect(typeof ref.current?.getPlayer).toBe('function')
    })

    it('should return null from getPlayer when player not ready', () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      expect(ref.current?.getPlayer()).toBeNull()
    })

    it('should return player instance from getPlayer when ready', async () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU')
      })
      
      act(() => {
        window.YT = mockYouTubeAPI
        if (window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady()
        }
      })
      
      await waitFor(() => {
        expect(mockYouTubeAPI.Player).toHaveBeenCalled()
      })
      
      expect(ref.current?.getPlayer()).toBe(mockYouTubePlayer)
    })
  })

  describe('Mobile-Specific Behavior', () => {
    it('should detect iPhone user agent and initialize eagerly', () => {
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)')
      
      render(<YouTubePlayer showDebug={true} />)
      
      // Mobile should initialize eagerly
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[SongSnips Debug] [YouTube] Mobile detected, initializing player eagerly')
      )
    })

    it('should detect Android user agent', () => {
      mockUserAgent('Mozilla/5.0 (Linux; Android 11; SM-G991B)')
      
      render(<YouTubePlayer showDebug={true} />)
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[SongSnips Debug] [YouTube] Mobile detected, initializing player eagerly')
      )
    })
  })

  describe('UI States', () => {
    it('should show loading state when API is loading', async () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU')
      })
      
      await waitFor(() => {
        expect(screen.getByText('🎵 Loading YouTube Player...')).toBeInTheDocument()
        expect(screen.getByText('This may take a moment')).toBeInTheDocument()
      })
    })

    it('should show overlay when video is loaded', async () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=8inJtTG_DuU')
      })
      
      act(() => {
        window.YT = mockYouTubeAPI
        if (window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady()
        }
      })
      
      await waitFor(() => {
        expect(mockYouTubeAPI.Player).toHaveBeenCalled()
      })
      
      // Check for overlay element
      const overlay = document.querySelector('.pointer-events-none')
      expect(overlay).toBeInTheDocument()
    })
  })

  describe('Error Event Listeners', () => {
    it('should add global error listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const docAddEventListenerSpy = vi.spyOn(document, 'addEventListener')
      
      render(<YouTubePlayer />)
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function))
      expect(docAddEventListenerSpy).toHaveBeenCalledWith('securitypolicyviolation', expect.any(Function))
    })

    it('should remove error listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const docRemoveEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      const { unmount } = render(<YouTubePlayer />)
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function))
      expect(docRemoveEventListenerSpy).toHaveBeenCalledWith('securitypolicyviolation', expect.any(Function))
    })

    it('should log global errors to debug', () => {
      render(<YouTubePlayer showDebug={true} />)
      
      // Simulate global error
      const errorEvent = new ErrorEvent('error', {
        message: 'Test error',
        filename: 'test.js',
        lineno: 123
      })
      
      act(() => {
        window.dispatchEvent(errorEvent)
      })
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[SongSnips Debug] [Global Error] Test error at test.js:123')
      )
    })
  })

  describe('Edge Cases', () => {
    it('should prevent duplicate player initialization', () => {
      const ref = createRef<YouTubePlayerRef>()
      render(<YouTubePlayer ref={ref} />)
      
      // Load video multiple times
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=video1')
      })
      
      act(() => {
        ref.current?.loadVideo('https://www.youtube.com/watch?v=video2')
      })
      
      // Should only initialize once
      const initLogs = (console.log as ReturnType<typeof vi.fn>).mock.calls.filter((call: unknown[]) => 
        (call[0] as string)?.includes?.('[YouTube] Initializing player...')
      )
      expect(initLogs).toHaveLength(1)
    })

    it('should handle connection info on mobile when navigator.connection is available', () => {
      // Mock navigator.connection
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '4g',
          saveData: false
        },
        writable: true,
        configurable: true
      })
      
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)')
      
      render(<YouTubePlayer showDebug={true} />)
      
      // Should initialize and log connection info
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[SongSnips Debug] [YouTube] Mobile detected, initializing player eagerly')
      )
    })
  })
})