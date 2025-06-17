import { describe, it, expect } from 'vitest'

describe('Test Setup', () => {
  it('should have vitest working', () => {
    expect(true).toBe(true)
  })

  it('should have YouTube API mocked', () => {
    // YT starts as undefined - this is correct behavior
    expect(window.YT).toBeUndefined()
    expect(window.onYouTubeIframeAPIReady).toBeDefined()
  })

  it('should have localStorage mocked', () => {
    localStorage.setItem('test', 'value')
    expect(localStorage.getItem('test')).toBe('value')
  })

  it('should reset mocks between tests', () => {
    expect(localStorage.getItem('test')).toBeNull()
  })
})