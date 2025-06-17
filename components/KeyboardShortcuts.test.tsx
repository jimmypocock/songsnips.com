import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import KeyboardShortcuts, { KeyboardShortcutsHelp } from './KeyboardShortcuts'

describe('KeyboardShortcuts', () => {
  const mockOnPlayPause = vi.fn()
  const mockOnStop = vi.fn()
  const mockOnClearLoop = vi.fn()
  const mockOnSeek = vi.fn()
  const mockOnSetLoopPoint = vi.fn()
  const mockOnSpeedChange = vi.fn()

  const defaultProps = {
    onPlayPause: mockOnPlayPause,
    onStop: mockOnStop,
    onClearLoop: mockOnClearLoop,
    onSeek: mockOnSeek,
    onSetLoopPoint: mockOnSetLoopPoint,
    onSpeedChange: mockOnSpeedChange,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render nothing (null component)', () => {
      const { container } = render(<KeyboardShortcuts {...defaultProps} />)
      expect(container.firstChild).toBeNull()
    })

    it('should attach keyboard event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      render(<KeyboardShortcuts {...defaultProps} />)
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should remove keyboard event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = render(<KeyboardShortcuts {...defaultProps} />)
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should not attach listener when isEnabled is false', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      render(<KeyboardShortcuts {...defaultProps} isEnabled={false} />)
      
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('Keyboard Interactions', () => {
    it('should call onPlayPause when space key is pressed', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      const event = new KeyboardEvent('keydown', { key: ' ' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      
      fireEvent(window, event)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(mockOnPlayPause).toHaveBeenCalledOnce()
    })

    it('should call onSetLoopPoint with "start" when A key is pressed', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      fireEvent.keyDown(window, { key: 'a' })
      
      expect(mockOnSetLoopPoint).toHaveBeenCalledWith('start')
    })

    it('should call onSetLoopPoint with "end" when B key is pressed', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      fireEvent.keyDown(window, { key: 'b' })
      
      expect(mockOnSetLoopPoint).toHaveBeenCalledWith('end')
    })

    it('should call onClearLoop when C key is pressed', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      fireEvent.keyDown(window, { key: 'c' })
      
      expect(mockOnClearLoop).toHaveBeenCalledOnce()
    })

    it('should call onStop when R key is pressed', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      fireEvent.keyDown(window, { key: 'r' })
      
      expect(mockOnStop).toHaveBeenCalledOnce()
    })

    it('should call onSeek with -5 when left arrow is pressed', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      fireEvent.keyDown(window, { key: 'ArrowLeft' })
      
      expect(mockOnSeek).toHaveBeenCalledWith(-5)
    })

    it('should call onSeek with 5 when right arrow is pressed', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      fireEvent.keyDown(window, { key: 'ArrowRight' })
      
      expect(mockOnSeek).toHaveBeenCalledWith(5)
    })

    it('should call onSeek with -1 when shift + left arrow is pressed', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      fireEvent.keyDown(window, { key: 'ArrowLeft', shiftKey: true })
      
      expect(mockOnSeek).toHaveBeenCalledWith(-1)
    })

    it('should call onSeek with 1 when shift + right arrow is pressed', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      fireEvent.keyDown(window, { key: 'ArrowRight', shiftKey: true })
      
      expect(mockOnSeek).toHaveBeenCalledWith(1)
    })

    it('should call onSpeedChange with 0.1 when up arrow is pressed', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      fireEvent.keyDown(window, { key: 'ArrowUp' })
      
      expect(mockOnSpeedChange).toHaveBeenCalledWith(0.1)
    })

    it('should call onSpeedChange with -0.1 when down arrow is pressed', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      fireEvent.keyDown(window, { key: 'ArrowDown' })
      
      expect(mockOnSpeedChange).toHaveBeenCalledWith(-0.1)
    })

    it('should handle uppercase keys correctly', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      fireEvent.keyDown(window, { key: 'A' })
      expect(mockOnSetLoopPoint).toHaveBeenCalledWith('start')
      
      fireEvent.keyDown(window, { key: 'B' })
      expect(mockOnSetLoopPoint).toHaveBeenCalledWith('end')
      
      fireEvent.keyDown(window, { key: 'C' })
      expect(mockOnClearLoop).toHaveBeenCalled()
      
      fireEvent.keyDown(window, { key: 'R' })
      expect(mockOnStop).toHaveBeenCalled()
    })

    it('should not trigger speed changes when onSpeedChange is not provided', () => {
      const propsWithoutSpeedChange = { ...defaultProps, onSpeedChange: undefined }
      render(<KeyboardShortcuts {...propsWithoutSpeedChange} />)
      
      fireEvent.keyDown(window, { key: 'ArrowUp' })
      fireEvent.keyDown(window, { key: 'ArrowDown' })
      
      // Should not throw error
      expect(() => fireEvent.keyDown(window, { key: 'ArrowUp' })).not.toThrow()
    })
  })

  describe('Input Field Handling', () => {
    it('should not trigger shortcuts when typing in input field', () => {
      render(
        <>
          <KeyboardShortcuts {...defaultProps} />
          <input type="text" data-testid="test-input" />
        </>
      )
      
      const input = screen.getByTestId('test-input')
      input.focus()
      
      fireEvent.keyDown(input, { key: ' ' })
      fireEvent.keyDown(input, { key: 'a' })
      fireEvent.keyDown(input, { key: 'b' })
      
      expect(mockOnPlayPause).not.toHaveBeenCalled()
      expect(mockOnSetLoopPoint).not.toHaveBeenCalled()
    })

    it('should not trigger shortcuts when typing in textarea', () => {
      render(
        <>
          <KeyboardShortcuts {...defaultProps} />
          <textarea data-testid="test-textarea" />
        </>
      )
      
      const textarea = screen.getByTestId('test-textarea')
      textarea.focus()
      
      fireEvent.keyDown(textarea, { key: 'c' })
      fireEvent.keyDown(textarea, { key: 'r' })
      
      expect(mockOnClearLoop).not.toHaveBeenCalled()
      expect(mockOnStop).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle unknown keys gracefully', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      // Should not throw error for unknown keys
      expect(() => {
        fireEvent.keyDown(window, { key: 'x' })
        fireEvent.keyDown(window, { key: 'Enter' })
        fireEvent.keyDown(window, { key: 'Escape' })
      }).not.toThrow()
      
      // Should not call any handlers
      expect(mockOnPlayPause).not.toHaveBeenCalled()
      expect(mockOnStop).not.toHaveBeenCalled()
      expect(mockOnClearLoop).not.toHaveBeenCalled()
    })

    it('should handle event with working preventDefault', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      const event = new KeyboardEvent('keydown', { key: ' ' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      
      fireEvent(window, event)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(mockOnPlayPause).toHaveBeenCalled()
    })

    it('should update event listeners when props change', () => {
      const { rerender } = render(<KeyboardShortcuts {...defaultProps} />)
      
      const newMockOnPlayPause = vi.fn()
      rerender(<KeyboardShortcuts {...defaultProps} onPlayPause={newMockOnPlayPause} />)
      
      fireEvent.keyDown(window, { key: ' ' })
      
      expect(mockOnPlayPause).not.toHaveBeenCalled()
      expect(newMockOnPlayPause).toHaveBeenCalledOnce()
    })

    it('should handle rapid key presses', () => {
      render(<KeyboardShortcuts {...defaultProps} />)
      
      // Simulate rapid key presses
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(window, { key: ' ' })
      }
      
      expect(mockOnPlayPause).toHaveBeenCalledTimes(10)
    })
  })
})

describe('KeyboardShortcutsHelp', () => {
  it('should render all keyboard shortcuts', () => {
    render(<KeyboardShortcutsHelp />)
    
    expect(screen.getByText('Keyboard Shortcuts:')).toBeInTheDocument()
    expect(screen.getByText('Space')).toBeInTheDocument()
    expect(screen.getByText('Play/Pause')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('Set Loop Start')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('Set Loop End')).toBeInTheDocument()
    expect(screen.getByText('←/→')).toBeInTheDocument()
    expect(screen.getByText('Seek 5s')).toBeInTheDocument()
    expect(screen.getByText('↑/↓')).toBeInTheDocument()
    expect(screen.getByText('Adjust Speed')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('Clear Loop')).toBeInTheDocument()
    expect(screen.getByText('R')).toBeInTheDocument()
    expect(screen.getByText('Reset to Start')).toBeInTheDocument()
    expect(screen.getByText('Shift + ←/→')).toBeInTheDocument()
    expect(screen.getByText('Seek 1s')).toBeInTheDocument()
  })

  it('should have proper styling classes', () => {
    const { container } = render(<KeyboardShortcutsHelp />)
    
    const helpContainer = container.firstChild
    expect(helpContainer).toHaveClass('mt-4', 'p-4', 'rounded-lg')
    
    const kbdElements = container.querySelectorAll('kbd')
    expect(kbdElements.length).toBeGreaterThan(0)
    kbdElements.forEach(kbd => {
      expect(kbd).toHaveClass('px-2', 'py-1', 'rounded', 'font-mono')
    })
  })
})