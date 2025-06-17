import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLoopMemory } from './useLoopMemory'
import { localStorageMock } from '../src/test/setup'

describe('useLoopMemory', () => {
  const testVideoId = '8inJtTG_DuU'
  const testVideoId2 = 'anotherVideoId'
  const storageKey = 'songsnips_loop_memory'

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    // Mock Date.now for consistent timestamps
    vi.spyOn(Date, 'now').mockReturnValue(1234567890)
    // Mock Math.random for consistent IDs - reset before each test
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with empty savedLoops when videoId is null', () => {
      const { result } = renderHook(() => useLoopMemory(null))

      expect(result.current.savedLoops).toEqual([])
      expect(typeof result.current.saveLoop).toBe('function')
      expect(typeof result.current.deleteLoop).toBe('function')
      expect(typeof result.current.updateLoopName).toBe('function')
      expect(typeof result.current.clearVideoLoops).toBe('function')
    })

    it('should initialize with empty savedLoops when no data exists in localStorage', () => {
      const { result } = renderHook(() => useLoopMemory(testVideoId))

      expect(result.current.savedLoops).toEqual([])
      expect(localStorageMock.getItem).toHaveBeenCalledWith(storageKey)
    })

    it('should load existing loops from localStorage', () => {
      const existingData = {
        [testVideoId]: [
          {
            id: 'test-loop-1',
            start: 30,
            end: 60,
            name: 'Test Loop',
            timestamp: 1234567890
          }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      expect(result.current.savedLoops).toEqual(existingData[testVideoId])
    })

    it('should handle empty data for specific video ID', () => {
      const existingData = {
        [testVideoId2]: [
          {
            id: 'other-loop',
            start: 10,
            end: 20,
            timestamp: 1234567890
          }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      expect(result.current.savedLoops).toEqual([])
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.setItem(storageKey, 'invalid-json')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      expect(result.current.savedLoops).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Error loading saved loops:', expect.any(Error))
    })
  })

  describe('Video ID Changes', () => {
    it('should reload loops when videoId changes', () => {
      const video1Data = {
        [testVideoId]: [
          { id: 'loop1', start: 30, end: 60, timestamp: 1234567890 }
        ]
      }
      const video2Data = {
        [testVideoId]: [
          { id: 'loop1', start: 30, end: 60, timestamp: 1234567890 }
        ],
        [testVideoId2]: [
          { id: 'loop2', start: 10, end: 20, timestamp: 1234567891 }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(video1Data))

      const { result, rerender } = renderHook(
        ({ videoId }) => useLoopMemory(videoId),
        { initialProps: { videoId: testVideoId } }
      )

      expect(result.current.savedLoops).toEqual(video1Data[testVideoId])

      // Update localStorage with data for video2
      localStorageMock.setItem(storageKey, JSON.stringify(video2Data))

      // Change videoId
      rerender({ videoId: testVideoId2 })

      expect(result.current.savedLoops).toEqual(video2Data[testVideoId2])
    })

    it('should not reload when videoId becomes null', () => {
      const existingData = {
        [testVideoId]: [
          { id: 'loop1', start: 30, end: 60, timestamp: 1234567890 }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result, rerender } = renderHook(
        ({ videoId }) => useLoopMemory(videoId),
        { initialProps: { videoId: testVideoId } }
      )

      expect(result.current.savedLoops).toEqual(existingData[testVideoId])

      rerender({ videoId: '' })

      // When videoId becomes null, savedLoops keeps its previous value
      // because the useEffect early returns and doesn't update state
      expect(result.current.savedLoops).toEqual(existingData[testVideoId])
    })
  })

  describe('Save Loop', () => {
    it('should save a new loop with all properties', () => {
      const { result } = renderHook(() => useLoopMemory(testVideoId))

      let savedLoopId: string | null = null

      act(() => {
        savedLoopId = result.current.saveLoop(30, 60, 'Test Loop') ?? ''
      })

      expect(typeof savedLoopId).toBe('string')
      expect(savedLoopId).toMatch(/^\d+-[a-z0-9]+$/)
      expect(result.current.savedLoops).toHaveLength(1)
      expect(result.current.savedLoops[0]).toEqual({
        id: savedLoopId,
        start: 30,
        end: 60,
        name: 'Test Loop',
        timestamp: 1234567890
      })

      // Verify localStorage was called
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        storageKey,
        expect.stringContaining(testVideoId)
      )
    })

    it('should save a loop without a name', () => {
      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        result.current.saveLoop(45, 75)
      })

      expect(result.current.savedLoops[0]).toMatchObject({
        start: 45,
        end: 75,
        name: undefined,
        timestamp: 1234567890
      })
      expect(typeof result.current.savedLoops[0].id).toBe('string')
    })

    it('should not save when videoId is null', () => {
      const { result } = renderHook(() => useLoopMemory(null))

      let savedLoopId: string | null = null

      act(() => {
        savedLoopId = result.current.saveLoop(30, 60, 'Test Loop')
      })

      expect(savedLoopId).toBeUndefined()
      expect(result.current.savedLoops).toEqual([])
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should add new loops to existing ones and sort by timestamp', () => {
      const existingData = {
        [testVideoId]: [
          {
            id: 'existing-loop',
            start: 10,
            end: 20,
            name: 'Existing',
            timestamp: 1000000000
          }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        result.current.saveLoop(30, 60, 'New Loop')
      })

      expect(result.current.savedLoops).toHaveLength(2)
      // New loop should be first (higher timestamp)
      expect(result.current.savedLoops[0].name).toBe('New Loop')
      expect(result.current.savedLoops[1].name).toBe('Existing')
    })

    it('should limit loops to MAX_LOOPS_PER_VIDEO (10)', () => {
      // Create 10 existing loops
      const existingLoops = Array.from({ length: 10 }, (_, i) => ({
        id: `loop-${i}`,
        start: i * 10,
        end: (i + 1) * 10,
        name: `Loop ${i}`,
        timestamp: 1000000000 + i
      }))

      const existingData = {
        [testVideoId]: existingLoops
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        result.current.saveLoop(100, 110, 'New Loop')
      })

      // Should still have 10 loops
      expect(result.current.savedLoops).toHaveLength(10)
      
      // New loop should be first
      expect(result.current.savedLoops[0].name).toBe('New Loop')
      
      // Oldest loop should be removed
      expect(result.current.savedLoops.find(loop => loop.name === 'Loop 0')).toBeUndefined()
    })

    it('should preserve loops for other videos', () => {
      const existingData = {
        [testVideoId]: [
          { id: 'video1-loop', start: 30, end: 60, timestamp: 1234567890 }
        ],
        [testVideoId2]: [
          { id: 'video2-loop', start: 10, end: 20, timestamp: 1234567890 }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        result.current.saveLoop(70, 80, 'New Loop')
      })

      // Get the data that was saved to localStorage
      const setItemCalls = localStorageMock.setItem.mock.calls
      const lastCall = setItemCalls[setItemCalls.length - 1]
      const savedData = JSON.parse(lastCall[1])
      
      // Should preserve video2 data
      expect(savedData[testVideoId2]).toEqual(existingData[testVideoId2])
      
      // Should have added new loop to video1
      expect(savedData[testVideoId]).toHaveLength(2)
    })

    it('should handle localStorage errors gracefully', () => {
      const { result } = renderHook(() => useLoopMemory(testVideoId))

      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      let savedLoopId: string | null = null

      act(() => {
        savedLoopId = result.current.saveLoop(30, 60, 'Test Loop')
      })

      expect(savedLoopId).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Error saving loop:', expect.any(Error))
    })
  })

  describe('Delete Loop', () => {
    it('should delete a specific loop', () => {
      const existingData = {
        [testVideoId]: [
          { id: 'loop1', start: 30, end: 60, name: 'Loop 1', timestamp: 1234567890 },
          { id: 'loop2', start: 70, end: 100, name: 'Loop 2', timestamp: 1234567891 }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        result.current.deleteLoop('loop1')
      })

      expect(result.current.savedLoops).toHaveLength(1)
      expect(result.current.savedLoops[0].id).toBe('loop2')
    })

    it('should not delete anything when videoId is null', () => {
      const { result } = renderHook(() => useLoopMemory(null))

      act(() => {
        result.current.deleteLoop('some-loop-id')
      })

      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should handle deleting non-existent loop ID', () => {
      const existingData = {
        [testVideoId]: [
          { id: 'loop1', start: 30, end: 60, timestamp: 1234567890 }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        result.current.deleteLoop('non-existent-loop')
      })

      // Should still have the original loop
      expect(result.current.savedLoops).toHaveLength(1)
      expect(result.current.savedLoops[0].id).toBe('loop1')
    })

    it('should handle empty localStorage', () => {
      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        result.current.deleteLoop('some-loop-id')
      })

      // Should not throw error
      expect(result.current.savedLoops).toEqual([])
    })

    it('should preserve loops for other videos', () => {
      const existingData = {
        [testVideoId]: [
          { id: 'video1-loop', start: 30, end: 60, timestamp: 1234567890 }
        ],
        [testVideoId2]: [
          { id: 'video2-loop', start: 10, end: 20, timestamp: 1234567890 }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        result.current.deleteLoop('video1-loop')
      })

      // Get the data that was saved to localStorage
      const setItemCalls = localStorageMock.setItem.mock.calls
      const lastCall = setItemCalls[setItemCalls.length - 1]
      const savedData = JSON.parse(lastCall[1])
      
      // Should preserve video2 data
      expect(savedData[testVideoId2]).toEqual(existingData[testVideoId2])
      
      // Should have removed loop from video1
      expect(savedData[testVideoId]).toEqual([])
    })

    it('should handle localStorage errors gracefully', () => {
      const existingData = {
        [testVideoId]: [
          { id: 'loop1', start: 30, end: 60, timestamp: 1234567890 }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      act(() => {
        result.current.deleteLoop('loop1')
      })

      expect(consoleSpy).toHaveBeenCalledWith('Error deleting loop:', expect.any(Error))
    })
  })

  describe('Update Loop Name', () => {
    it('should update the name of a specific loop', () => {
      const existingData = {
        [testVideoId]: [
          { id: 'loop1', start: 30, end: 60, name: 'Old Name', timestamp: 1234567890 },
          { id: 'loop2', start: 70, end: 100, name: 'Loop 2', timestamp: 1234567891 }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        result.current.updateLoopName('loop1', 'New Name')
      })

      const updatedLoop = result.current.savedLoops.find(loop => loop.id === 'loop1')
      expect(updatedLoop?.name).toBe('New Name')
      
      // Other loop should remain unchanged
      const otherLoop = result.current.savedLoops.find(loop => loop.id === 'loop2')
      expect(otherLoop?.name).toBe('Loop 2')
    })

    it('should not update anything when videoId is null', () => {
      const { result } = renderHook(() => useLoopMemory(null))

      act(() => {
        result.current.updateLoopName('some-loop-id', 'New Name')
      })

      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should handle updating non-existent loop ID', () => {
      const existingData = {
        [testVideoId]: [
          { id: 'loop1', start: 30, end: 60, name: 'Original', timestamp: 1234567890 }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        result.current.updateLoopName('non-existent-loop', 'New Name')
      })

      // Original loop should remain unchanged
      expect(result.current.savedLoops[0].name).toBe('Original')
    })

    it('should handle empty localStorage', () => {
      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        result.current.updateLoopName('some-loop-id', 'New Name')
      })

      // Should not throw error
      expect(result.current.savedLoops).toEqual([])
    })

    it('should preserve loops for other videos', () => {
      const existingData = {
        [testVideoId]: [
          { id: 'video1-loop', start: 30, end: 60, name: 'Original', timestamp: 1234567890 }
        ],
        [testVideoId2]: [
          { id: 'video2-loop', start: 10, end: 20, name: 'Other Video', timestamp: 1234567890 }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        result.current.updateLoopName('video1-loop', 'Updated Name')
      })

      // Get the data that was saved to localStorage
      const setItemCalls = localStorageMock.setItem.mock.calls
      const lastCall = setItemCalls[setItemCalls.length - 1]
      const savedData = JSON.parse(lastCall[1])
      
      // Should preserve video2 data
      expect(savedData[testVideoId2]).toEqual(existingData[testVideoId2])
      
      // Should have updated loop name for video1
      expect(savedData[testVideoId][0].name).toBe('Updated Name')
    })

    it('should handle localStorage errors gracefully', () => {
      const existingData = {
        [testVideoId]: [
          { id: 'loop1', start: 30, end: 60, name: 'Original', timestamp: 1234567890 }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      act(() => {
        result.current.updateLoopName('loop1', 'New Name')
      })

      expect(consoleSpy).toHaveBeenCalledWith('Error updating loop name:', expect.any(Error))
    })
  })

  describe('Clear Video Loops', () => {
    it('should clear all loops for the current video', () => {
      const existingData = {
        [testVideoId]: [
          { id: 'loop1', start: 30, end: 60, timestamp: 1234567890 },
          { id: 'loop2', start: 70, end: 100, timestamp: 1234567891 }
        ],
        [testVideoId2]: [
          { id: 'other-loop', start: 10, end: 20, timestamp: 1234567890 }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      expect(result.current.savedLoops).toHaveLength(2)

      act(() => {
        result.current.clearVideoLoops()
      })

      expect(result.current.savedLoops).toEqual([])

      // Get the data that was saved to localStorage
      const setItemCalls = localStorageMock.setItem.mock.calls
      const lastCall = setItemCalls[setItemCalls.length - 1]
      const savedData = JSON.parse(lastCall[1])
      
      // Should preserve other video data
      expect(savedData[testVideoId2]).toEqual(existingData[testVideoId2])
      
      // Should not have data for current video
      expect(savedData[testVideoId]).toBeUndefined()
    })

    it('should not clear anything when videoId is null', () => {
      const { result } = renderHook(() => useLoopMemory(null))

      act(() => {
        result.current.clearVideoLoops()
      })

      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should handle empty localStorage', () => {
      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        result.current.clearVideoLoops()
      })

      // Should not throw error
      expect(result.current.savedLoops).toEqual([])
    })

    it('should handle localStorage errors gracefully', () => {
      const existingData = {
        [testVideoId]: [
          { id: 'loop1', start: 30, end: 60, timestamp: 1234567890 }
        ]
      }

      localStorageMock.setItem(storageKey, JSON.stringify(existingData))

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      act(() => {
        result.current.clearVideoLoops()
      })

      expect(consoleSpy).toHaveBeenCalledWith('Error clearing video loops:', expect.any(Error))
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed localStorage data during operations', () => {
      localStorageMock.setItem(storageKey, 'invalid-json')

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      act(() => {
        result.current.saveLoop(30, 60, 'Test')
      })

      expect(consoleSpy).toHaveBeenCalled()
    })

    it('should handle localStorage getItem returning null during operations', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        const loopId = result.current.saveLoop(30, 60, 'Test')
        expect(typeof loopId).toBe('string')
        expect(loopId).toMatch(/^\d+-[a-z0-9]+$/)
      })

      expect(result.current.savedLoops).toHaveLength(1)
    })

    it('should handle concurrent operations correctly', () => {
      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        // Save multiple loops rapidly
        result.current.saveLoop(30, 60, 'Loop 1')
        result.current.saveLoop(70, 100, 'Loop 2')
        result.current.saveLoop(110, 140, 'Loop 3')
      })

      expect(result.current.savedLoops).toHaveLength(3)
    })

    it('should generate unique IDs for loops', () => {
      // Reset mocks to get different random values
      vi.restoreAllMocks()
      vi.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(2000)
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.9)

      const { result } = renderHook(() => useLoopMemory(testVideoId))

      act(() => {
        result.current.saveLoop(30, 60, 'Loop 1')
      })

      act(() => {
        result.current.saveLoop(70, 100, 'Loop 2')
      })

      const ids = result.current.savedLoops.map(loop => loop.id)
      expect(ids[0]).not.toBe(ids[1])
    })
  })
})