'use client';

import { useState, useEffect } from 'react';
import { SearchService } from '@/services/searchService';
import type { SearchResponse, QuotaStatus } from '@/services/searchService';

interface UnifiedSearchProps {
  onVideoSelect: (videoId: string) => void;
  onUrlSubmit: (url: string) => void;
}

type InputMode = 'url' | 'search';

const searchService = new SearchService();

export default function UnifiedSearch({ onVideoSelect, onUrlSubmit }: UnifiedSearchProps) {
  const [mode, setMode] = useState<InputMode>('url');
  const [urlInput, setUrlInput] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Check quota on mount if API is configured
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      checkQuotaStatus();
    }
  }, []);

  // Load preferred mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('preferredInputMode') as InputMode;
    if (savedMode && ['url', 'search'].includes(savedMode)) {
      setMode(savedMode);
    }
  }, []);

  const checkQuotaStatus = async () => {
    try {
      const status = await searchService.checkQuota();
      setQuotaStatus(status);
    } catch (err) {
      console.error('Failed to check quota:', err);
    }
  };

  const handleModeChange = (newMode: InputMode) => {
    setMode(newMode);
    localStorage.setItem('preferredInputMode', newMode);
    setShowResults(false);
    setError(null);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUrlSubmit(urlInput);
      setUrlInput('');
    }
  };

  const handleApiSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchService.search(query);
      setResults(searchResults);
      setShowResults(true);
      
      // Update quota status after search
      await checkQuotaStatus();
      
      if (searchResults.quotaExceeded) {
        setError('Daily search limit reached. Try again tomorrow or search directly on YouTube.');
      }
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExternalSearch = () => {
    if (query.trim()) {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    }
  };

  const handleVideoSelect = (videoId: string) => {
    onVideoSelect(videoId);
    setShowResults(false);
    setQuery('');
  };

  const handleQuickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.includes('youtube.com/watch') || text.includes('youtu.be/'))) {
        onUrlSubmit(text);
      } else {
        alert('No YouTube URL found in clipboard');
      }
    } catch (err) {
      console.error('Clipboard error:', err);
      alert('Please paste the YouTube URL manually');
    }
  };

  const hasApiUrl = !!process.env.NEXT_PUBLIC_API_URL;
  const hasQuota = hasApiUrl && quotaStatus && !quotaStatus.quotaExceeded;

  return (
    <div className="mb-2">
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => handleModeChange('url')}
          className={`text-xs px-3 py-1 rounded ${
            mode === 'url' 
              ? 'bg-primary text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          🔗 URL
        </button>
        <button
          onClick={() => handleModeChange('search')}
          className={`text-xs px-3 py-1 rounded ${
            mode === 'search' 
              ? 'bg-primary text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          🔍 Search on YouTube
        </button>
        {mode === 'search' && hasQuota && (
          <span className="text-xs text-gray-500 ml-auto self-center">
            {quotaStatus?.searchesRemaining} searches left today
          </span>
        )}
      </div>
      
      {/* Search/URL Input */}
      <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-primary via-secondary to-secondary">
        <div className="flex gap-2 bg-white dark:bg-gray-900 rounded-lg p-1">
          {mode === 'url' ? (
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
                disabled={!urlInput.trim()}
                className="px-4 py-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-medium rounded-md text-sm whitespace-nowrap transform hover:scale-105 transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                Load ✨
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (hasQuota ? handleApiSearch() : handleExternalSearch())}
                placeholder={hasQuota ? "Search YouTube videos... 🔍" : "What do you want to practice?"}
                className="flex-1 px-3 py-2 rounded-md focus:outline-none bg-transparent text-sm placeholder-gray-400"
                disabled={loading}
              />
              {hasQuota ? (
                <button
                  onClick={handleApiSearch}
                  disabled={loading || !query.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-medium rounded-md text-sm whitespace-nowrap transform hover:scale-105 transition-all duration-200 shadow-sm disabled:opacity-50"
                >
                  {loading ? '...' : 'Search ✨'}
                </button>
              ) : (
                <button
                  onClick={handleExternalSearch}
                  disabled={!query.trim()}
                  className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium text-sm rounded-md transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                  YouTube →
                </button>
              )}
            </>
          )}
          
          {/* Quick Paste - Only show for URL mode or external search */}
          {(mode === 'url' || (mode === 'search' && !hasQuota)) && (
            <button
              onClick={handleQuickPaste}
              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm rounded-md transform hover:scale-105 transition-all duration-200"
              title="Paste YouTube URL from clipboard"
            >
              📋
            </button>
          )}
          
          {mode === 'search' && !hasQuota && (
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="px-2 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="How to use"
            >
              ?
            </button>
          )}
        </div>
      </div>

      {/* Quota Exceeded Message */}
      {mode === 'search' && hasApiUrl && quotaStatus?.quotaExceeded && (
        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-sm rounded">
          Daily search limit reached. Search opens in YouTube. Resets at {new Date(quotaStatus.resetsAt).toLocaleTimeString()}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded">
          {error}
        </div>
      )}

      {/* Help Section for External Search */}
      {showHelp && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">How to use:</p>
          <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4">
            <li>1. Search for a video on YouTube</li>
            <li>2. Copy the video URL</li>
            <li>3. Click &quot;Quick Paste&quot; to load it instantly</li>
          </ol>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Tip: The Quick Paste button automatically detects YouTube URLs from your clipboard!
          </p>
        </div>
      )}

      {/* Search Results (for API search) */}
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