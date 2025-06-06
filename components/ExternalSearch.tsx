'use client';

import { useState, useEffect } from 'react';

interface ExternalSearchProps {
  onUrlSubmit: (url: string) => void;
  showAsQuotaExceeded?: boolean;
  hideWhenApiAvailable?: boolean;
}

type InputMode = 'url' | 'external';

export default function ExternalSearch({ onUrlSubmit, showAsQuotaExceeded = false }: ExternalSearchProps) {
  const [mode, setMode] = useState<InputMode>('url');
  const [query, setQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Load preferred mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('preferredInputMode') as InputMode;
    if (savedMode && ['url', 'external'].includes(savedMode)) {
      setMode(savedMode);
    }
  }, []);

  // Save mode preference
  const handleModeChange = (newMode: InputMode) => {
    setMode(newMode);
    localStorage.setItem('preferredInputMode', newMode);
  };

  const handleSearchOnYouTube = () => {
    if (query.trim()) {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUrlSubmit(urlInput);
      setUrlInput('');
    }
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
      // Fallback for browsers that don't support clipboard API
      console.error('Clipboard error:', err);
      alert('Please paste the YouTube URL manually');
    }
  };

  return (
    <div className="mb-2">
      {/* Quota Exceeded Message */}
      {showAsQuotaExceeded && (
        <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-sm rounded">
          Daily search limit reached. Use external search or paste a URL directly.
        </div>
      )}
      
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
          onClick={() => handleModeChange('external')}
          className={`text-xs px-3 py-1 rounded ${
            mode === 'external' 
              ? 'bg-primary text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          🔍 Search on YouTube
        </button>
      </div>
      
      <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
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
                onKeyPress={(e) => e.key === 'Enter' && handleSearchOnYouTube()}
                placeholder="What do you want to practice?"
                className="flex-1 px-3 py-2 rounded-md focus:outline-none bg-transparent text-sm placeholder-gray-400"
              />
              <button
                onClick={handleSearchOnYouTube}
                disabled={!query.trim()}
                className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium text-sm rounded-md transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                YouTube →
              </button>
            </>
          )}
          <button
            onClick={handleQuickPaste}
            className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm rounded-md transform hover:scale-105 transition-all duration-200"
            title="Paste YouTube URL from clipboard"
          >
            📋
          </button>
          {mode === 'external' && (
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

      {/* Help Section */}
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
    </div>
  );
}