import '@testing-library/jest-dom'
import 'vitest-canvas-mock'
import { vi } from 'vitest'

// Mock YouTube API
const mockYouTubePlayer = {
  loadVideoById: vi.fn(),
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
  stopVideo: vi.fn(),
  seekTo: vi.fn(),
  getCurrentTime: vi.fn(() => 0),
  getDuration: vi.fn(() => 100),
  getPlayerState: vi.fn(),
  setPlaybackRate: vi.fn(),
  getPlaybackRate: vi.fn(() => 1),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  destroy: vi.fn()
}

const mockYouTubeAPI = {
  Player: vi.fn(() => mockYouTubePlayer),
  PlayerState: {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5
  }
}

// Global YouTube API mock - initially undefined for component tests
Object.defineProperty(window, 'YT', {
  value: undefined,
  writable: true,
  configurable: true
})

// Mock onYouTubeIframeAPIReady callback
Object.defineProperty(window, 'onYouTubeIframeAPIReady', {
  value: vi.fn(),
  writable: true
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
})

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  value: MockIntersectionObserver
})

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
  value: MockResizeObserver
})

// Mock HTMLCanvasElement.getContext for Timeline tests
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: new Array(4) })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn()
}))

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock fetch for API tests
global.fetch = vi.fn()

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear()
  
  // Reset YouTube API mocks to default values
  mockYouTubePlayer.getCurrentTime.mockReturnValue(0)
  mockYouTubePlayer.getDuration.mockReturnValue(100)
  mockYouTubePlayer.getPlaybackRate.mockReturnValue(1)
  mockYouTubePlayer.getPlayerState.mockReturnValue(mockYouTubeAPI.PlayerState.UNSTARTED)
})

// Export mocks for use in tests
export { mockYouTubePlayer, mockYouTubeAPI, localStorageMock }