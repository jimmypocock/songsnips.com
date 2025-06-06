'use client';

import { useState, useEffect, useCallback } from 'react';
import { SearchService } from '@/services/searchService';
import type { SearchResponse, QuotaStatus } from '@/services/searchService';

interface YouTubeSearchProps {
  onVideoSelect: (videoId: string) => void;
  onQuotaStatusChange?: (status: QuotaStatus) => void;
}

const searchService = new SearchService();

export default function YouTubeSearch({ onVideoSelect, onQuotaStatusChange }: YouTubeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const checkQuotaStatus = useCallback(async () => {
    try {
      const status = await searchService.checkQuota();
      setQuotaStatus(status);
      if (onQuotaStatusChange) {
        onQuotaStatusChange(status);
      }
    } catch (err) {
      console.error('Failed to check quota:', err);
    }
  }, [onQuotaStatusChange]);

  // Check quota on mount
  useEffect(() => {
    checkQuotaStatus();
  }, [checkQuotaStatus]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchService.search(query);
      setResults(searchResults);
      setShowResults(true);
      
      // Update quota status after search
      await checkQuotaStatus();
      
      // If quota exceeded after this search, show message
      if (searchResults.quotaExceeded) {
        setError('Daily search limit reached. Try again tomorrow or use external search below.');
      }
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (videoId: string) => {
    onVideoSelect(videoId);
    setShowResults(false);
    setQuery('');
  };

  // Don't render if no API configured
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return null;
  }

  return (
    <div className="mb-2">
      {/* Search Section */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Search YouTube</span>
        {quotaStatus && !quotaStatus.quotaExceeded && (
          <span className="text-xs text-gray-500">
            {quotaStatus.searchesRemaining} searches left today
          </span>
        )}
      </div>
      
      <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-primary via-secondary to-secondary">
        <div className="flex gap-2 bg-white dark:bg-gray-900 rounded-lg p-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for videos... 🔍"
            className="flex-1 px-3 py-2 rounded-md focus:outline-none bg-transparent text-sm placeholder-gray-400"
            disabled={loading || quotaStatus?.quotaExceeded}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim() || quotaStatus?.quotaExceeded}
            className="px-4 py-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-medium rounded-md text-sm whitespace-nowrap transform hover:scale-105 transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            {loading ? '...' : 'Search ✨'}
          </button>
        </div>
      </div>

      {/* Quota Exceeded Message */}
      {quotaStatus?.quotaExceeded && (
        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-sm rounded">
          Daily limit reached. Resets at {new Date(quotaStatus.resetsAt).toLocaleTimeString()}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded">
          {error}
        </div>
      )}

      {/* Search Results */}
      {showResults && results && !results.quotaExceeded && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-500">
                {results.totalResults} results {results.cached && '(cached)'}
              </p>
              <button
                onClick={() => setShowResults(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {results.items.map((item) => (
              <div
                key={item.videoId}
                onClick={() => handleVideoSelect(item.videoId)}
                className="flex gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-24 h-14 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{item.title}</h4>
                  <p className="text-xs text-gray-500 truncate">{item.channelTitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}