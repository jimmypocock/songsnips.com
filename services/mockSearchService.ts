// Mock Search Service for local development
import type { SearchResult, QuotaInfo, SearchResponse, QuotaStatus } from './searchService';

export class MockSearchService {
  private mockQuotaUsed = 2000;
  
  async checkQuota(): Promise<QuotaStatus> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      date: new Date().toISOString().split('T')[0],
      used: this.mockQuotaUsed,
      limit: 10000,
      remaining: 10000 - this.mockQuotaUsed,
      searchesPerformed: Math.floor(this.mockQuotaUsed / 100),
      searchesRemaining: Math.floor((10000 - this.mockQuotaUsed) / 100),
      percentageUsed: Math.round((this.mockQuotaUsed / 10000) * 100),
      resetsAt: new Date(Date.now() + 24*60*60*1000).toISOString(),
      quotaExceeded: this.mockQuotaUsed >= 10000
    };
  }
  
  async search(query: string, maxResults: number = 10): Promise<SearchResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate quota increment
    this.mockQuotaUsed += 100;
    
    // Simulate quota exceeded
    if (this.mockQuotaUsed > 10000) {
      return {
        items: [],
        totalResults: 0,
        quotaInfo: {
          used: this.mockQuotaUsed,
          limit: 10000,
          remaining: 0,
          searchesRemaining: 0
        },
        quotaExceeded: true
      };
    }
    
    // Generate mock results
    const mockResults: SearchResult[] = [];
    for (let i = 0; i < Math.min(maxResults, 5); i++) {
      mockResults.push({
        videoId: `mock-${Date.now()}-${i}`,
        title: `${query} - Tutorial Part ${i + 1}`,
        description: `This is a mock search result for "${query}". Great for testing the UI during development.`,
        thumbnail: `https://picsum.photos/320/180?random=${i}`,
        channelTitle: `Mock Channel ${i + 1}`,
        publishedAt: new Date(Date.now() - i * 24*60*60*1000).toISOString()
      });
    }
    
    return {
      items: mockResults,
      totalResults: 100, // Mock total
      quotaInfo: {
        used: this.mockQuotaUsed,
        limit: 10000,
        remaining: 10000 - this.mockQuotaUsed,
        searchesRemaining: Math.floor((10000 - this.mockQuotaUsed) / 100)
      },
      cached: Math.random() > 0.7 // Randomly mark some as cached
    };
  }
  
  // Helper method to simulate quota reset
  resetQuota() {
    this.mockQuotaUsed = 0;
  }
  
  // Helper method to simulate high quota usage
  setHighQuotaUsage() {
    this.mockQuotaUsed = 9500;
  }
  
  // Helper method to simulate quota exceeded
  setQuotaExceeded() {
    this.mockQuotaUsed = 10100;
  }
}