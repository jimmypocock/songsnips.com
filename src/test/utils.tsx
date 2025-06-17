import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { mockYouTubePlayer, mockYouTubeAPI } from './setup'

// Custom render function that includes common providers
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions
) {
  return render(ui, options)
}

// YouTube Player test utilities
export const createMockYouTubePlayer = (overrides = {}) => ({
  ...mockYouTubePlayer,
  ...overrides
})

export const createMockYouTubeAPI = (overrides = {}) => ({
  ...mockYouTubeAPI,
  ...overrides
})

// Helper to simulate YouTube player events
export const simulateYouTubeEvent = (eventType: string, data?: any) => {
  const event = { target: mockYouTubePlayer, data }
  mockYouTubePlayer.addEventListener.mock.calls.forEach(([type, callback]) => {
    if (type === eventType) {
      callback(event)
    }
  })
}

// Helper to create mock video data
export const createMockVideoData = (overrides = {}) => ({
  videoId: '8inJtTG_DuU',
  title: 'Test Video',
  duration: 180,
  ...overrides
})

// Helper to create mock loop data
export const createMockLoop = (overrides = {}) => ({
  id: '1',
  startTime: 30,
  endTime: 60,
  name: 'Test Loop',
  videoId: '8inJtTG_DuU',
  createdAt: new Date().toISOString(),
  ...overrides
})

// Helper to wait for YouTube player to be ready
export const waitForYouTubePlayer = async () => {
  return new Promise(resolve => {
    setTimeout(resolve, 100)
  })
}

// Helper to simulate time updates
export const simulateTimeUpdate = (currentTime: number) => {
  mockYouTubePlayer.getCurrentTime.mockReturnValue(currentTime)
  simulateYouTubeEvent('onStateChange', mockYouTubeAPI.PlayerState.PLAYING)
}

// Helper to simulate keyboard events
export const createKeyboardEvent = (key: string, options = {}) => {
  return new KeyboardEvent('keydown', {
    key,
    code: key,
    bubbles: true,
    ...options
  })
}

// Helper to simulate touch events
export const createTouchEvent = (type: string, touches: Array<{ clientX: number; clientY: number }>) => {
  return new TouchEvent(type, {
    touches: touches.map(touch => ({
      ...touch,
      identifier: 0,
      target: document.body,
      radiusX: 1,
      radiusY: 1,
      rotationAngle: 0,
      force: 1,
      pageX: touch.clientX,
      pageY: touch.clientY,
      screenX: touch.clientX,
      screenY: touch.clientY
    })) as any,
    bubbles: true
  })
}

// Helper to simulate mouse events with precise coordinates
export const createMouseEvent = (type: string, coords: { clientX: number; clientY: number }) => {
  return new MouseEvent(type, {
    ...coords,
    bubbles: true,
    cancelable: true
  })
}

// Helper to mock localStorage with specific data
export const mockLocalStorageData = (data: Record<string, any>) => {
  Object.keys(data).forEach(key => {
    localStorage.setItem(key, JSON.stringify(data[key]))
  })
}

// Helper to mock fetch responses
export const mockFetchResponse = (data: any, status = 200) => {
  const mockResponse = {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data))
  }
  
  global.fetch = vi.fn().mockResolvedValue(mockResponse)
  return mockResponse
}

// Helper to assert coverage of critical paths
export const assertCriticalPath = (mockFn: any, expectedCalls: number) => {
  expect(mockFn).toHaveBeenCalledTimes(expectedCalls)
}

// Helper to test error boundaries
export const ThrowError = ({ shouldThrow = false, children }: { shouldThrow?: boolean; children: React.ReactNode }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <>{children}</>
}