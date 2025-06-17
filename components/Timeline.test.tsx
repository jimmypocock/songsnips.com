import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Timeline from './Timeline'

describe('Timeline', () => {
  const mockOnTimelineClick = vi.fn()
  const mockOnLoopPointChange = vi.fn()

  const defaultProps = {
    duration: 180, // 3 minutes
    currentTime: 60, // 1 minute
    loopStart: null as number | null,
    loopEnd: null as number | null,
    onTimelineClick: mockOnTimelineClick,
    onLoopPointChange: mockOnLoopPointChange
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock getBoundingClientRect for timeline calculations
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 400,
      height: 40,
      top: 0,
      left: 0,
      bottom: 40,
      right: 400,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Render', () => {
    it('should render with default props', () => {
      render(<Timeline {...defaultProps} />)
      
      expect(screen.getByText('1:00')).toBeInTheDocument() // current time
      expect(screen.getByText('3:00')).toBeInTheDocument() // duration
    })

    it('should format time correctly', () => {
      render(<Timeline {...defaultProps} currentTime={75} duration={3665} />)
      
      expect(screen.getByText('1:15')).toBeInTheDocument() // 75 seconds = 1:15
      expect(screen.getByText('61:05')).toBeInTheDocument() // 3665 seconds = 61:05
    })

    it('should handle zero duration', () => {
      render(<Timeline {...defaultProps} duration={0} currentTime={0} />)
      
      expect(screen.getAllByText('0:00')).toHaveLength(2) // current time and duration
    })

    it('should show progress indicator at correct position', () => {
      const { container } = render(<Timeline {...defaultProps} />)
      
      // currentTime (60) / duration (180) = 33.33%
      const progressBar = container.querySelector('[style*="width: 33"]')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Timeline Clicks', () => {
    it('should call onTimelineClick when clicking timeline', () => {
      const { container } = render(<Timeline {...defaultProps} />)
      
      const timeline = container.querySelector('.cursor-pointer')!
      expect(timeline).toBeInTheDocument()
      
      // Click at 200px (middle of 400px timeline)
      fireEvent.click(timeline, { clientX: 200 })
      
      // Should click at 50% of duration = 90 seconds
      expect(mockOnTimelineClick).toHaveBeenCalledWith(90)
    })

    it('should not call onTimelineClick when duration is 0', () => {
      const { container } = render(<Timeline {...defaultProps} duration={0} />)
      
      const timeline = container.querySelector('.cursor-pointer')!
      fireEvent.click(timeline, { clientX: 200 })
      
      expect(mockOnTimelineClick).not.toHaveBeenCalled()
    })

    it('should handle clicks at timeline boundaries', () => {
      const { container } = render(<Timeline {...defaultProps} />)
      
      const timeline = container.querySelector('.cursor-pointer')!
      
      // Click at start (0px)
      fireEvent.click(timeline, { clientX: 0 })
      expect(mockOnTimelineClick).toHaveBeenCalledWith(0)
      
      // Click at end (400px)
      fireEvent.click(timeline, { clientX: 400 })
      expect(mockOnTimelineClick).toHaveBeenCalledWith(180)
    })

    it('should handle clicks outside timeline bounds', () => {
      const { container } = render(<Timeline {...defaultProps} />)
      
      const timeline = container.querySelector('.cursor-pointer')!
      
      // Click before start (-50px)
      fireEvent.click(timeline, { clientX: -50 })
      expect(mockOnTimelineClick).toHaveBeenCalledWith(0)
      
      // Click after end (500px)
      fireEvent.click(timeline, { clientX: 500 })
      expect(mockOnTimelineClick).toHaveBeenCalledWith(180)
    })
  })

  describe('Loop Markers', () => {
    it('should render loop start marker when provided', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} />)
      
      // loopStart (30) / duration (180) = 16.67%
      const startMarker = container.querySelector('[style*="left: 16.6"]')
      expect(startMarker).toBeInTheDocument()
      expect(startMarker).toHaveClass('loop-handle')
    })

    it('should render loop end marker when both start and end provided', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} loopEnd={120} />)
      
      // Should have loop region - look for any element with both left and width styles
      const loopRegion = container.querySelector('[style*="left:"][style*="width:"]')
      expect(loopRegion).toBeInTheDocument()
      
      // Should have multiple loop handles (start and end)
      const endMarkers = container.querySelectorAll('.loop-handle')
      expect(endMarkers.length).toBeGreaterThan(1)
    })

    it('should show loop time display when loop points exist', () => {
      render(<Timeline {...defaultProps} loopStart={30} loopEnd={120} />)
      
      expect(screen.getByText('0:30')).toBeInTheDocument() // loop start time
      expect(screen.getByText('2:00')).toBeInTheDocument() // loop end time
    })

    it('should show partial loop info when only start is set', () => {
      render(<Timeline {...defaultProps} loopStart={45} />)
      
      expect(screen.getByText('0:45')).toBeInTheDocument() // loop start time
      expect(screen.getByText('--:--')).toBeInTheDocument() // placeholder for end
    })

    it('should not render loop region without both start and end', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} />)
      
      // Should not have loop region styling
      const loopRegion = container.querySelector('[style*="width:"][style*="left:"]')
      expect(loopRegion).toBeNull()
    })
  })

  describe('Mouse Drag Interactions', () => {
    it('should start dragging loop start marker', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} />)
      
      const startMarker = container.querySelector('.loop-handle')!
      expect(startMarker).toBeInTheDocument()
      
      fireEvent.mouseDown(startMarker, { clientX: 66 })
      
      // Should start dragging - verify by triggering mousemove
      fireEvent(document, new MouseEvent('mousemove', { clientX: 100 }))
      
      // Should call onLoopPointChange with dragging=true
      expect(mockOnLoopPointChange).toHaveBeenCalledWith('start', expect.any(Number), true)
    })

    it('should drag loop end marker', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} loopEnd={120} />)
      
      // Find all loop handles and get the second one (end marker)
      const allHandles = container.querySelectorAll('.loop-handle')
      expect(allHandles.length).toBe(2)
      const endMarker = allHandles[1]
      
      fireEvent.mouseDown(endMarker, { clientX: 266 })
      
      // Drag to new position
      fireEvent(document, new MouseEvent('mousemove', { clientX: 300 }))
      
      expect(mockOnLoopPointChange).toHaveBeenCalledWith('end', expect.any(Number), true)
    })

    it('should stop dragging on mouse up', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} />)
      
      const startMarker = container.querySelector('.loop-handle')!
      
      // Start dragging
      fireEvent.mouseDown(startMarker, { clientX: 66 })
      
      // Move
      fireEvent(document, new MouseEvent('mousemove', { clientX: 100 }))
      
      // Stop dragging
      fireEvent(document, new MouseEvent('mouseup'))
      
      // Further moves should not trigger callbacks
      mockOnLoopPointChange.mockClear()
      fireEvent(document, new MouseEvent('mousemove', { clientX: 150 }))
      
      expect(mockOnLoopPointChange).not.toHaveBeenCalled()
    })

    it('should prevent timeline clicks while dragging', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} />)
      
      const timeline = container.querySelector('.cursor-pointer')!
      const startMarker = container.querySelector('.loop-handle')!
      
      // Start dragging
      fireEvent.mouseDown(startMarker, { clientX: 66 })
      
      // Try to click timeline while dragging
      fireEvent.click(timeline, { clientX: 200 })
      
      expect(mockOnTimelineClick).not.toHaveBeenCalled()
    })

    it('should enforce constraints when dragging start marker', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} loopEnd={120} />)
      
      const startMarker = container.querySelector('.loop-handle')!
      
      fireEvent.mouseDown(startMarker, { clientX: 66 })
      
      // Try to drag start past end (300px = 135 seconds > 120 seconds end)
      fireEvent(document, new MouseEvent('mousemove', { clientX: 300 }))
      
      // Should not update because start would be past end
      expect(mockOnLoopPointChange).not.toHaveBeenCalled()
    })

    it('should enforce constraints when dragging end marker', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} loopEnd={120} />)
      
      // Find the end marker (second handle)
      const allHandles = container.querySelectorAll('.loop-handle')
      const endMarker = allHandles[1]
      
      fireEvent.mouseDown(endMarker, { clientX: 266 })
      
      // Try to drag end before start (50px = 22.5 seconds < 30 seconds start)
      fireEvent(document, new MouseEvent('mousemove', { clientX: 50 }))
      
      // Should not update because end would be before start
      expect(mockOnLoopPointChange).not.toHaveBeenCalled()
    })
  })

  describe('Touch Interactions', () => {
    it('should handle touch start on loop marker', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} />)
      
      const startMarker = container.querySelector('.loop-handle')!
      
      // Use fireEvent.touchStart instead of creating TouchEvent directly
      fireEvent.touchStart(startMarker, {
        touches: [{ identifier: 0, clientX: 66 }]
      })
      
      // Should start touch dragging
      fireEvent.touchMove(document, {
        touches: [{ identifier: 0, clientX: 100 }]
      })
      
      expect(mockOnLoopPointChange).toHaveBeenCalledWith('start', expect.any(Number), true)
    })

    it('should handle touch end', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} />)
      
      const startMarker = container.querySelector('.loop-handle')!
      
      // Start touch
      fireEvent.touchStart(startMarker, {
        touches: [{ identifier: 0, clientX: 66 }]
      })
      
      // End touch
      fireEvent.touchEnd(document, {
        touches: []
      })
      
      // Further moves should not trigger callbacks
      mockOnLoopPointChange.mockClear()
      fireEvent.touchMove(document, {
        touches: [{ identifier: 0, clientX: 100 }]
      })
      
      expect(mockOnLoopPointChange).not.toHaveBeenCalled()
    })

    it('should handle touch cancel', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} />)
      
      const startMarker = container.querySelector('.loop-handle')!
      
      // Start touch
      fireEvent.touchStart(startMarker, {
        touches: [{ identifier: 0, clientX: 66 }]
      })
      
      // Cancel touch
      fireEvent.touchCancel(document, {
        touches: []
      })
      
      // Should stop dragging
      mockOnLoopPointChange.mockClear()
      fireEvent.touchMove(document, {
        touches: [{ identifier: 0, clientX: 100 }]
      })
      
      expect(mockOnLoopPointChange).not.toHaveBeenCalled()
    })

    it('should handle multi-touch correctly', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} />)
      
      const startMarker = container.querySelector('.loop-handle')!
      
      // Start with touch identifier 1
      fireEvent.touchStart(startMarker, {
        touches: [{ identifier: 1, clientX: 66 }]
      })
      
      // Move with different identifier should be ignored
      fireEvent.touchMove(document, {
        touches: [{ identifier: 2, clientX: 100 }]
      })
      
      expect(mockOnLoopPointChange).not.toHaveBeenCalled()
      
      // Move with correct identifier should work
      fireEvent.touchMove(document, {
        touches: [{ identifier: 1, clientX: 100 }]
      })
      
      expect(mockOnLoopPointChange).toHaveBeenCalled()
    })
  })

  describe('Event Prevention', () => {
    it('should prevent default on drag start', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} />)
      
      const startMarker = container.querySelector('.loop-handle')!
      
      const mouseDownEvent = new MouseEvent('mousedown', { clientX: 66, bubbles: true })
      const preventDefaultSpy = vi.spyOn(mouseDownEvent, 'preventDefault')
      
      fireEvent(startMarker, mouseDownEvent)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should stop propagation on drag start', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} />)
      
      const startMarker = container.querySelector('.loop-handle')!
      
      const mouseDownEvent = new MouseEvent('mousedown', { clientX: 66, bubbles: true })
      const stopPropagationSpy = vi.spyOn(mouseDownEvent, 'stopPropagation')
      
      fireEvent(startMarker, mouseDownEvent)
      
      expect(stopPropagationSpy).toHaveBeenCalled()
    })

    it('should not call timeline click when clicking on handle', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} />)
      
      const startMarker = container.querySelector('.loop-handle')!
      
      // Click on the handle should not trigger timeline click
      fireEvent.click(startMarker)
      
      expect(mockOnTimelineClick).not.toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const { container, unmount } = render(<Timeline {...defaultProps} loopStart={30} />)
      
      const startMarker = container.querySelector('.loop-handle')!
      
      // Start dragging to add event listeners
      fireEvent.mouseDown(startMarker, { clientX: 66 })
      
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function))
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing timeline ref', () => {
      // Mock getBoundingClientRect to return null (simulating missing ref)
      Element.prototype.getBoundingClientRect = vi.fn(() => {
        throw new Error('No element')
      })
      
      expect(() => {
        render(<Timeline {...defaultProps} />)
      }).not.toThrow()
    })

    it('should handle drag with no duration', () => {
      const { container } = render(<Timeline {...defaultProps} duration={0} loopStart={30} />)
      
      const startMarker = container.querySelector('.loop-handle')!
      
      fireEvent.mouseDown(startMarker, { clientX: 66 })
      fireEvent(document, new MouseEvent('mousemove', { clientX: 100 }))
      
      // Should call with 0 because duration is 0 (calculated as percentage * 0)
      expect(mockOnLoopPointChange).toHaveBeenCalledWith('start', 0, true)
    })

    it('should handle very small timeline width', () => {
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        width: 1,
        height: 40,
        top: 0,
        left: 0,
        bottom: 40,
        right: 1,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }))
      
      const { container } = render(<Timeline {...defaultProps} />)
      
      const timeline = container.querySelector('.cursor-pointer')!
      fireEvent.click(timeline, { clientX: 0.5 })
      
      // Should handle small width gracefully
      expect(mockOnTimelineClick).toHaveBeenCalledWith(90) // 50% of duration
    })

    it('should handle negative client coordinates', () => {
      const { container } = render(<Timeline {...defaultProps} />)
      
      const timeline = container.querySelector('.cursor-pointer')!
      fireEvent.click(timeline, { clientX: -100 })
      
      // Should clamp to 0
      expect(mockOnTimelineClick).toHaveBeenCalledWith(0)
    })

    it('should render correctly with null loop values', () => {
      expect(() => {
        render(<Timeline {...defaultProps} loopStart={null} loopEnd={null} />)
      }).not.toThrow()
      
      // Should not show loop info section
      expect(screen.queryByText('→')).not.toBeInTheDocument()
    })

    it('should handle fractional time values', () => {
      render(<Timeline {...defaultProps} currentTime={90.7} duration={180.3} />)
      
      // Should round down for display
      expect(screen.getByText('1:30')).toBeInTheDocument() // 90.7 -> 1:30
      expect(screen.getByText('3:00')).toBeInTheDocument() // 180.3 -> 3:00
    })
  })

  describe('Accessibility', () => {
    it('should have proper cursor styles', () => {
      const { container } = render(<Timeline {...defaultProps} loopStart={30} />)
      
      const timeline = container.querySelector('.cursor-pointer')
      expect(timeline).toHaveClass('cursor-pointer')
      
      const startMarker = container.querySelector('.loop-handle')
      expect(startMarker).toHaveClass('cursor-ew-resize')
    })

    it('should handle keyboard navigation gracefully', () => {
      const { container } = render(<Timeline {...defaultProps} />)
      
      const timeline = container.querySelector('.cursor-pointer')!
      
      // Should not crash on keyboard events
      expect(() => {
        fireEvent.keyDown(timeline, { key: 'Enter' })
        fireEvent.keyDown(timeline, { key: ' ' })
        fireEvent.keyDown(timeline, { key: 'ArrowLeft' })
      }).not.toThrow()
    })
  })
})