'use client';

import { useState, useEffect } from 'react';
import { SearchService } from '@/services/searchService';
import { MockSearchService } from '@/services/mockSearchService';
import type { SearchResponse, QuotaStatus } from '@/services/searchService';

// Use mock service if no API URL is configured
const searchService = process.env.NEXT_PUBLIC_API_URL 
  ? new SearchService()
  : new MockSearchService();

export default function SearchExample() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check quota on mount
  useEffect(() => {
    checkQuotaStatus();
  }, []);

  const checkQuotaStatus = async () => {
    try {
      const status = await searchService.checkQuota();
      setQuotaStatus(status);
    } catch (err) {
      console.error('Failed to check quota:', err);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchService.search(query);
      setResults(searchResults);
      
      // Update quota status after search
      await checkQuotaStatus();
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadVideo = (videoId: string) => {
    // In your actual implementation, this would load the video in your player
    console.log('Loading video:', videoId);
    // window.location.href = `/?v=${videoId}`;
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">YouTube Search Test</h2>
      
      {/* Environment Indicator */}
      <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded">
        <p className="text-sm">
          Environment: {process.env.NEXT_PUBLIC_API_URL ? 'AWS API' : 'Mock Data'}
        </p>
        {!process.env.NEXT_PUBLIC_API_URL && (
          <p className="text-xs text-gray-500">
            Add NEXT_PUBLIC_API_URL to .env.local to use real API
          </p>
        )}
      </div>

      {/* Quota Status */}
      {quotaStatus && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="text-sm">
            Quota: {quotaStatus.searchesRemaining} searches remaining today
            ({quotaStatus.percentageUsed}% used)
          </p>
          {quotaStatus.quotaExceeded && (
            <p className="text-red-600 text-sm mt-1">
              Daily quota exceeded. Resets at {new Date(quotaStatus.resetsAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search YouTube videos..."
          className="flex-1 px-3 py-2 border rounded-md"
          disabled={loading || quotaStatus?.quotaExceeded}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim() || quotaStatus?.quotaExceeded}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Quota Exceeded - Fallback */}
      {results?.quotaExceeded && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
          <p className="mb-2">Daily search limit reached.</p>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Search on YouTube →
          </a>
        </div>
      )}

      {/* Search Results */}
      {results && !results.quotaExceeded && (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Found {results.totalResults} results
            {results.cached && ' (cached)'}
          </p>
          <div className="space-y-4">
            {results.items.map((item) => (
              <div
                key={item.videoId}
                className="flex gap-4 p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => loadVideo(item.videoId)}
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-40 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.channelTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}