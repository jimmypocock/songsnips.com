// YouTube Search Service for production use
export interface SearchResult {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

export interface QuotaInfo {
  used: number;
  limit: number;
  remaining: number;
  searchesRemaining: number;
}

export interface SearchResponse {
  items: SearchResult[];
  totalResults: number;
  quotaInfo: QuotaInfo;
  quotaExceeded?: boolean;
  cached?: boolean;
}

export interface QuotaStatus {
  date: string;
  used: number;
  limit: number;
  remaining: number;
  searchesPerformed: number;
  searchesRemaining: number;
  percentageUsed: number;
  resetsAt: string;
  quotaExceeded: boolean;
}

export class SearchService {
  private apiUrl: string;
  
  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }
  
  async checkQuota(): Promise<QuotaStatus> {
    try {
      const res = await fetch(`${this.apiUrl}/api/search/status`);
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Failed to check quota:', error);
      throw error;
    }
  }
  
  async search(query: string, maxResults: number = 5): Promise<SearchResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        maxResults: maxResults.toString(),
        type: 'video'
      });
      
      const res = await fetch(`${this.apiUrl}/api/search?${params}`);
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      
      const data = await res.json();
      
      // Handle quota exceeded response
      if (data.quotaExceeded) {
        return {
          items: [],
          totalResults: 0,
          quotaInfo: data.quotaInfo,
          quotaExceeded: true
        };
      }
      
      return data;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }
}