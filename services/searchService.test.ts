import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SearchService } from './searchService'
import type { SearchResult, SearchResponse, QuotaStatus } from './searchService'

// Mock fetch globally
global.fetch = vi.fn()

describe('SearchService', () => {
  let searchService: SearchService
  const mockApiUrl = 'https://api.example.com'

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock environment variable
    process.env.NEXT_PUBLIC_API_URL = mockApiUrl
    searchService = new SearchService()
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL
  })

  describe('Constructor', () => {
    it('should initialize with API URL from environment', () => {
      expect(searchService).toBeDefined()
    })

    it('should initialize with empty API URL when not configured', () => {
      delete process.env.NEXT_PUBLIC_API_URL
      const service = new SearchService()
      
      // Service should still be created but with empty API URL
      expect(service).toBeDefined()
    })
  })

  describe('checkQuota', () => {
    const mockQuotaStatus: QuotaStatus = {
      date: '2024-01-15',
      used: 50,
      limit: 10000,
      remaining: 9950,
      searchesPerformed: 10,
      searchesRemaining: 1990,
      percentageUsed: 0.5,
      resetsAt: '2024-01-16T00:00:00Z',
      quotaExceeded: false
    }

    it('should fetch quota status successfully', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockQuotaStatus)
      } as any)

      const result = await searchService.checkQuota()

      expect(mockFetch).toHaveBeenCalledWith(`${mockApiUrl}/api/search/status`)
      expect(result).toEqual(mockQuotaStatus)
    })

    it('should throw error when API returns error status', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as any)

      await expect(searchService.checkQuota()).rejects.toThrow('API returned 500')
    })

    it('should throw error when fetch fails', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await expect(searchService.checkQuota()).rejects.toThrow('Network error')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to check quota:', expect.any(Error))
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('search', () => {
    const mockSearchResult: SearchResult = {
      videoId: '8inJtTG_DuU',
      title: 'Test Video',
      description: 'Test Description',
      thumbnail: 'https://i.ytimg.com/vi/8inJtTG_DuU/default.jpg',
      channelTitle: 'Test Channel',
      publishedAt: '2024-01-15T00:00:00Z'
    }

    const mockSearchResponse: SearchResponse = {
      items: [mockSearchResult],
      totalResults: 1,
      quotaInfo: {
        used: 100,
        limit: 10000,
        remaining: 9900,
        searchesRemaining: 1980
      },
      cached: false
    }

    it('should search with default parameters', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSearchResponse)
      } as any)

      const result = await searchService.search('test query')

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockApiUrl}/api/search?q=test+query&maxResults=5&type=video`
      )
      expect(result).toEqual(mockSearchResponse)
    })

    it('should search with custom maxResults', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSearchResponse)
      } as any)

      await searchService.search('test query', 10)

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockApiUrl}/api/search?q=test+query&maxResults=10&type=video`
      )
    })

    it('should handle quota exceeded response', async () => {
      const quotaExceededResponse = {
        quotaExceeded: true,
        quotaInfo: {
          used: 10000,
          limit: 10000,
          remaining: 0,
          searchesRemaining: 0
        }
      }

      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(quotaExceededResponse)
      } as any)

      const result = await searchService.search('test query')

      expect(result).toEqual({
        items: [],
        totalResults: 0,
        quotaInfo: quotaExceededResponse.quotaInfo,
        quotaExceeded: true
      })
    })

    it('should throw error when API returns error status', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      } as any)

      await expect(searchService.search('test query')).rejects.toThrow('API returned 404')
    })

    it('should throw error when fetch fails', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await expect(searchService.search('test query')).rejects.toThrow('Connection refused')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Search failed:', expect.any(Error))
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle special characters in search query', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSearchResponse)
      } as any)

      await searchService.search('test & query with spaces + symbols')

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockApiUrl}/api/search?q=test+%26+query+with+spaces+%2B+symbols&maxResults=5&type=video`
      )
    })

    it('should handle empty search query', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ items: [], totalResults: 0 })
      } as any)

      await searchService.search('')

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockApiUrl}/api/search?q=&maxResults=5&type=video`
      )
    })

    it('should handle cached responses', async () => {
      const cachedResponse: SearchResponse = {
        ...mockSearchResponse,
        cached: true
      }

      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(cachedResponse)
      } as any)

      const result = await searchService.search('cached query')

      expect(result.cached).toBe(true)
      expect(result.items).toEqual(mockSearchResponse.items)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined API URL gracefully', () => {
      delete process.env.NEXT_PUBLIC_API_URL
      const service = new SearchService()
      
      // Service should still be created but with empty API URL
      expect(service).toBeDefined()
    })

    it('should handle JSON parse errors', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON'))
      } as any)

      await expect(searchService.search('test')).rejects.toThrow('Invalid JSON')
    })

    it('should handle timeout errors', async () => {
      const mockFetch = vi.mocked(global.fetch)
      const timeoutError = new Error('Request timeout')
      timeoutError.name = 'AbortError'
      mockFetch.mockRejectedValueOnce(timeoutError)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await expect(searchService.search('test')).rejects.toThrow('Request timeout')
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle very large maxResults', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ items: [], totalResults: 0 })
      } as any)

      await searchService.search('test', 9999)

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockApiUrl}/api/search?q=test&maxResults=9999&type=video`
      )
    })

    it('should handle negative maxResults', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ items: [], totalResults: 0 })
      } as any)

      await searchService.search('test', -1)

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockApiUrl}/api/search?q=test&maxResults=-1&type=video`
      )
    })
  })
})