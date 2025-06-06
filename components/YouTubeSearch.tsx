'use client';

import { useState, useEffect } from 'react';
import { SearchService } from '@/services/searchService';
import type { SearchResponse, QuotaStatus } from '@/services/searchService';

interface YouTubeSearchProps {
  onVideoSelect: (videoId: string) => void;
  onUrlSubmit: (url: string) => void;
}

const searchService = new SearchService();

export default function YouTubeSearch({ onVideoSelect, onUrlSubmit }: YouTubeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [mode, setMode] = useState<'search' | 'url'>('search');
  const [urlInput, setUrlInput] = useState('');

  // Check quota on mount
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      checkQuotaStatus();
    }
  }, []);


  const checkQuotaStatus = async () => {
    try {
      const status = await searchService.checkQuota();
      setQuotaStatus(status);
      // Don't auto-switch modes - let user control it
      // if (status.quotaExceeded) {
      //   setMode('url');
      // }
    } catch (err) {
      console.error('Failed to check quota:', err);
      // Don't automatically switch modes on error - let user decide
    }
  };

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
        setError('Daily search limit reached. Please use URL input or search on YouTube.');
        // Don't auto-switch - let user decide
        // setMode('url');
      }
    } catch (err) {
      setError('Search failed. Please try again or use URL input.');
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

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUrlSubmit(urlInput);
      setUrlInput('');
    }
  };

  const isSearchAvailable = process.env.NEXT_PUBLIC_API_URL && !quotaStatus?.quotaExceeded;
  const [showSearchHelp, setShowSearchHelp] = useState(false);

  return (
    <div className="mb-2">
      {/* No API Configured Message */}
      {!process.env.NEXT_PUBLIC_API_URL && mode === 'search' && (
        <div className="mb-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Search API not configured. Use external search or switch to URL mode.
          </p>
        </div>
      )}

      {/* Search Help for External Search Workflow */}
      {mode === 'search' && (quotaStatus?.quotaExceeded || !process.env.NEXT_PUBLIC_API_URL) && showSearchHelp && (
        <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Quick Search Workflow:</p>
              <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 ml-4">
                <li>1. Type your search query below</li>
                <li>2. Click &quot;YouTube →&quot; to search on YouTube</li>
                <li>3. Copy the video URL from YouTube</li>
                <li>4. Switch to &quot;URL&quot; mode and paste it</li>
              </ol>
            </div>
            <button
              onClick={() => setShowSearchHelp(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Mode Toggle - Show when API available OR when quota exceeded */}
      {(isSearchAvailable || quotaStatus?.quotaExceeded || !process.env.NEXT_PUBLIC_API_URL) && (
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setMode('search')}
            className={`text-xs px-3 py-1 rounded ${
              mode === 'search' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            🔍 Search
          </button>
          <button
            onClick={() => setMode('url')}
            className={`text-xs px-3 py-1 rounded ${
              mode === 'url' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            🔗 URL
          </button>
          {quotaStatus && mode === 'search' && (
            <span className="text-xs text-gray-500 ml-auto self-center">
              {quotaStatus.searchesRemaining} searches left today
            </span>
          )}
        </div>
      )}

      {/* Search/URL Input */}
      <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-primary via-secondary to-secondary">
        <div className="flex gap-2 bg-white dark:bg-gray-900 rounded-lg p-1">
          {mode === 'search' ? (
            <>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search YouTube videos... 🔍"
                className="flex-1 px-3 py-2 rounded-md focus:outline-none bg-transparent text-sm placeholder-gray-400"
                disabled={loading}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="px-4 py-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-medium rounded-md text-sm whitespace-nowrap transform hover:scale-105 transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                {loading ? '...' : 'Search ✨'}
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                placeholder="YouTube URL 🎶"
                className="flex-1 px-3 py-2 rounded-md focus:outline-none bg-transparent text-sm placeholder-gray-400"
              />
              <button
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-medium rounded-md text-sm whitespace-nowrap transform hover:scale-105 transition-all duration-200 shadow-sm"
              >
                Load ✨
              </button>
            </>
          )}
          
          {/* External search buttons */}
          {mode === 'search' && (quotaStatus?.quotaExceeded || !process.env.NEXT_PUBLIC_API_URL) && (
            <button
              onClick={() => {
                if (query.trim()) {
                  window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
                }
              }}
              disabled={!query.trim()}
              className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium text-sm rounded-md transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              title="Search on YouTube"
            >
              YouTube →
            </button>
          )}
          
          {/* Help button for external search */}
          {mode === 'search' && (quotaStatus?.quotaExceeded || !process.env.NEXT_PUBLIC_API_URL) && (
            <button
              onClick={() => setShowSearchHelp(!showSearchHelp)}
              className="px-2 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="How to search"
            >
              ?
            </button>
          )}
        </div>
      </div>

      {/* Quota Exceeded Message */}
      {mode === 'search' && quotaStatus?.quotaExceeded && (
        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                Daily search limit reached
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Resets at {quotaStatus.resetsAt ? new Date(quotaStatus.resetsAt).toLocaleTimeString() : 'midnight PT'}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">Options:</p>
                <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1 ml-4">
                  <li>• Search on YouTube and copy the URL back</li>
                  <li>• Switch to URL mode above</li>
                  <li>• Try again tomorrow</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !quotaStatus?.quotaExceeded && (
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