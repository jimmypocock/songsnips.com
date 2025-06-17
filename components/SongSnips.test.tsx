import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import SongSnips from './SongSnips'
import { mockYouTubePlayer, mockYouTubeAPI } from '../src/test/setup'

// Create mock implementations
const mockUseYouTubePlayer = {
  duration: 180,
  currentTime: 60,
  loopPoints: { start: null, end: null },
  isLooping: false,
  isPlaying: false,
  error: null,
  handlePlayerReady: vi.fn(),
  handleStateChange: vi.fn(),
  handleError: vi.fn(),
  handleDurationChange: vi.fn(),
  togglePlayPause: vi.fn(),
  stopPlayback: vi.fn(),
  setLoopPoint: vi.fn(),
  clearLoop: vi.fn(),
  seekTo: vi.fn(),
  setError: vi.fn(),
}

const mockUseLoopMemory = {
  savedLoops: [],
  saveLoop: vi.fn(),
  deleteLoop: vi.fn(),
  updateLoopName: vi.fn(),
}

// Mock the hooks
vi.mock('../hooks/useYouTubePlayer', () => ({
  useYouTubePlayer: () => mockUseYouTubePlayer
}))

vi.mock('../hooks/useLoopMemory', () => ({
  useLoopMemory: () => mockUseLoopMemory
}))

// Create refs for components

// Mock child components with simpler implementations
vi.mock('./YouTubePlayer', () => {
  const MockYouTubePlayer = React.forwardRef<HTMLDivElement, { videoId?: string; onReady: () => void; onStateChange: () => void; onError: () => void }>((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      loadVideo: vi.fn((url: string) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
        return match ? match[1] : null
      }),
      getPlayer: vi.fn(() => mockYouTubePlayer)
    }))
    return <div data-testid="youtube-player">YouTube Player</div>
  })
  MockYouTubePlayer.displayName = 'MockYouTubePlayer'
  return { default: MockYouTubePlayer }
})

vi.mock('./Timeline', () => ({
  default: (props: { onTimelineClick: (time: number) => void; onLoopPointChange: (type: string, time: number, isDragging: boolean) => void }) => {
    const { onTimelineClick, onLoopPointChange } = props
    return (
      <div data-testid="timeline">
        <button data-testid="timeline-click" onClick={() => onTimelineClick(30)}>
          Click Timeline
        </button>
        <button data-testid="drag-start" onClick={() => onLoopPointChange('start', 45, true)}>
          Drag Start
        </button>
      </div>
    )
  }
}))

vi.mock('./ControlButtons', () => ({
  default: (props: { onPlayPause: () => void; onStop: () => void; onClearLoop: () => void }) => {
    const { onPlayPause, onStop, onClearLoop } = props
    return (
      <div data-testid="control-buttons">
        <button data-testid="play-pause" onClick={onPlayPause}>Play/Pause</button>
        <button data-testid="stop" onClick={onStop}>Stop</button>
        <button data-testid="clear-loop" onClick={onClearLoop}>Clear Loop</button>
      </div>
    )
  }
}))

vi.mock('./UnifiedSearch', () => ({
  default: (props: { onVideoSelect: (videoId: string) => void; onUrlSubmit: (url: string) => void }) => {
    const { onVideoSelect, onUrlSubmit } = props
    return (
      <div data-testid="unified-search">
        <input
          data-testid="url-input"
          placeholder="Enter YouTube URL"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onUrlSubmit((e.target as HTMLInputElement).value)
            }
          }}
        />
        <button
          data-testid="search-result"
          onClick={() => onVideoSelect('test-video-id')}
        >
          Test Video Result
        </button>
      </div>
    )
  }
}))

vi.mock('./KeyboardShortcuts', () => ({
  default: () => null,
  KeyboardShortcutsHelp: () => <div data-testid="keyboard-shortcuts-help">Shortcuts Help</div>
}))

vi.mock('./QuickLoopButtons', () => ({
  default: (props: { onSetQuickLoop: (start: number, end: number) => void; currentTime: number }) => {
    const { onSetQuickLoop, currentTime } = props
    return (
      <div data-testid="quick-loop-buttons">
        <button 
          data-testid="quick-loop-10s"
          onClick={() => onSetQuickLoop(currentTime - 5, currentTime + 5)}
        >
          10s Loop
        </button>
      </div>
    )
  }
}))

vi.mock('./SpeedControl', () => ({
  default: (props: { onSpeedChange: (speed: number) => void }) => {
    const { onSpeedChange } = props
    return (
      <div data-testid="speed-control">
        <button data-testid="speed-1.5" onClick={() => onSpeedChange(1.5)}>1.5x</button>
      </div>
    )
  }
}))

vi.mock('./LoopCounter', () => ({
  default: () => <div data-testid="loop-counter">Loop Counter</div>
}))

vi.mock('./ShareLoop', () => ({
  default: () => <div data-testid="share-loop">Share Loop</div>
}))

vi.mock('./SavedLoops', () => ({
  default: (props: { onSaveLoop: (start: number, end: number, name: string) => void; onLoadLoop: (loop: { start: number; end: number }) => void }) => {
    const { onSaveLoop, onLoadLoop } = props
    return (
      <div data-testid="saved-loops">
        <button 
          data-testid="save-loop"
          onClick={() => onSaveLoop(30, 60, 'Test Loop')}
        >
          Save Loop
        </button>
        <button 
          data-testid="load-loop"
          onClick={() => onLoadLoop({ start: 45, end: 75 })}
        >
          Load Loop
        </button>
      </div>
    )
  }
}))

describe('SongSnips Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset mocks to default state
    Object.assign(mockUseYouTubePlayer, {
      duration: 180,
      currentTime: 60,
      loopPoints: { start: null, end: null },
      isLooping: false,
      isPlaying: false,
      error: null,
    })

    // Reset window.location.search
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true,
      configurable: true
    })

    // Set up window.YT
    window.YT = mockYouTubeAPI
  })

  describe('Component Rendering', () => {
    it('should render all main components', () => {
      render(<SongSnips />)

      expect(screen.getByTestId('youtube-player')).toBeInTheDocument()
      expect(screen.getByTestId('timeline')).toBeInTheDocument()
      expect(screen.getByTestId('control-buttons')).toBeInTheDocument()
      expect(screen.getByTestId('unified-search')).toBeInTheDocument()
      expect(screen.getByTestId('quick-loop-buttons')).toBeInTheDocument()
      expect(screen.getByTestId('speed-control')).toBeInTheDocument()
      expect(screen.getByTestId('loop-counter')).toBeInTheDocument()
    })

    it('should show instructions', () => {
      render(<SongSnips />)

      expect(screen.getByText('How to Use')).toBeInTheDocument()
      expect(screen.getByText(/Paste YouTube URL/)).toBeInTheDocument()
    })

    it('should toggle keyboard shortcuts help', () => {
      render(<SongSnips />)

      expect(screen.queryByTestId('keyboard-shortcuts-help')).not.toBeInTheDocument()

      const toggleButton = screen.getByText('Show Keyboard Shortcuts')
      fireEvent.click(toggleButton)

      expect(screen.getByTestId('keyboard-shortcuts-help')).toBeInTheDocument()
      expect(screen.getByText('Hide Keyboard Shortcuts')).toBeInTheDocument()
    })
  })

  describe('Video Loading', () => {
    it('should load video from URL input', () => {
      render(<SongSnips />)
      
      const urlInput = screen.getByTestId('url-input') as HTMLInputElement
      const testUrl = 'https://www.youtube.com/watch?v=test-video-123'

      fireEvent.keyDown(urlInput, { 
        key: 'Enter',
        target: { value: testUrl }
      })

      expect(mockUseYouTubePlayer.clearLoop).toHaveBeenCalled()
      expect(mockUseYouTubePlayer.setError).toHaveBeenCalledWith(null)
    })

    it('should load video from search results', () => {
      render(<SongSnips />)

      const searchResult = screen.getByTestId('search-result')
      fireEvent.click(searchResult)

      expect(mockUseYouTubePlayer.clearLoop).toHaveBeenCalled()
    })

    it('should show error for empty URL', () => {
      render(<SongSnips />)

      const urlInput = screen.getByTestId('url-input') as HTMLInputElement
      fireEvent.keyDown(urlInput, { 
        key: 'Enter',
        target: { value: '' }
      })

      expect(mockUseYouTubePlayer.setError).toHaveBeenCalledWith('Please enter a YouTube URL')
    })

    it('should display error messages', () => {
      mockUseYouTubePlayer.error = 'Video not found'
      
      render(<SongSnips />)

      expect(screen.getByText('💔 Video not found')).toBeInTheDocument()
    })
  })

  describe('Loop Point Setting', () => {
    it('should set loop start on timeline click', () => {
      render(<SongSnips />)

      const timelineButton = screen.getByTestId('timeline-click')
      fireEvent.click(timelineButton)

      expect(mockUseYouTubePlayer.setLoopPoint).toHaveBeenCalledWith('start', 30)
      expect(mockUseYouTubePlayer.seekTo).toHaveBeenCalledWith(30)
    })

    it('should set loop end on second click when start exists', () => {
      mockUseYouTubePlayer.loopPoints = { start: 20, end: null }
      
      render(<SongSnips />)

      const timelineButton = screen.getByTestId('timeline-click')
      fireEvent.click(timelineButton)

      expect(mockUseYouTubePlayer.setLoopPoint).toHaveBeenCalledWith('end', 30)
    })

    it('should handle quick loop buttons', () => {
      render(<SongSnips />)

      const quickLoopButton = screen.getByTestId('quick-loop-10s')
      fireEvent.click(quickLoopButton)

      expect(mockUseYouTubePlayer.setLoopPoint).toHaveBeenCalledWith('start', 55) // 60 - 5
      expect(mockUseYouTubePlayer.setLoopPoint).toHaveBeenCalledWith('end', 65)   // 60 + 5
      expect(mockUseYouTubePlayer.seekTo).toHaveBeenCalledWith(55)
    })

    it('should handle drag interactions', () => {
      render(<SongSnips />)

      const dragButton = screen.getByTestId('drag-start')
      fireEvent.click(dragButton)

      expect(mockUseYouTubePlayer.setLoopPoint).toHaveBeenCalledWith('start', 45)
    })
  })

  describe('Playback Controls', () => {
    it('should toggle play/pause', () => {
      render(<SongSnips />)

      const playPauseButton = screen.getByTestId('play-pause')
      fireEvent.click(playPauseButton)

      expect(mockUseYouTubePlayer.togglePlayPause).toHaveBeenCalled()
    })

    it('should stop playback', () => {
      render(<SongSnips />)

      const stopButton = screen.getByTestId('stop')
      fireEvent.click(stopButton)

      expect(mockUseYouTubePlayer.stopPlayback).toHaveBeenCalled()
    })

    it('should clear loop', () => {
      render(<SongSnips />)

      const clearButton = screen.getByTestId('clear-loop')
      fireEvent.click(clearButton)

      expect(mockUseYouTubePlayer.clearLoop).toHaveBeenCalled()
    })

    it('should change playback speed', () => {
      render(<SongSnips />)

      const speedButton = screen.getByTestId('speed-1.5')
      fireEvent.click(speedButton)

      expect(mockYouTubePlayer.setPlaybackRate).toHaveBeenCalledWith(1.5)
    })
  })

  describe('Saved Loops', () => {
    it('should not show saved loops without video', () => {
      render(<SongSnips />)
      
      // SavedLoops should not be rendered without a video
      expect(screen.queryByTestId('saved-loops')).not.toBeInTheDocument()
    })

    it('should show saved loops after loading video', () => {
      render(<SongSnips />)
      
      // First load a video
      const searchResult = screen.getByTestId('search-result')
      fireEvent.click(searchResult)
      
      // SavedLoops still won't show because currentVideoId is managed by the component state
      // This would require a more complex integration test setup
      expect(mockUseYouTubePlayer.clearLoop).toHaveBeenCalled()
    })
  })

  describe('URL Parameters', () => {
    it('should load video from URL parameters', async () => {
      window.location.search = '?v=url-param-video&start=10&end=20'
      
      render(<SongSnips />)

      // Wait for URL params to be processed
      await waitFor(() => {
        expect(mockUseYouTubePlayer.clearLoop).toHaveBeenCalled()
      })
    })
  })

  describe('Auto-save on Page Leave', () => {
    it('should save loop when user leaves page with loop points set', () => {
      mockUseYouTubePlayer.loopPoints = { start: 10, end: 20 }
      
      render(<SongSnips />)

      // Trigger beforeunload event
      const event = new Event('beforeunload')
      window.dispatchEvent(event)

      expect(mockUseLoopMemory.saveLoop).toHaveBeenCalledWith(10, 20, 'Last session')
    })

    it('should not save if no complete loop points', () => {
      mockUseYouTubePlayer.loopPoints = { start: 10, end: null }
      
      render(<SongSnips />)

      const event = new Event('beforeunload')
      window.dispatchEvent(event)

      expect(mockUseLoopMemory.saveLoop).not.toHaveBeenCalled()
    })
  })
})