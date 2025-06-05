'use client';

import { useState } from 'react';

interface SavedLoop {
  id: string;
  start: number;
  end: number;
  name?: string;
  timestamp: number;
}

interface SavedLoopsProps {
  savedLoops: SavedLoop[];
  currentLoop: { start: number | null; end: number | null };
  onSaveLoop: (start: number, end: number, name?: string) => void;
  onLoadLoop: (loop: SavedLoop) => void;
  onDeleteLoop: (loopId: string) => void;
  onUpdateLoopName: (loopId: string, name: string) => void;
}

export default function SavedLoops({
  savedLoops,
  currentLoop,
  onSaveLoop,
  onLoadLoop,
  onDeleteLoop,
  onUpdateLoopName
}: SavedLoopsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [savingName, setSavingName] = useState('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (currentLoop.start !== null && currentLoop.end !== null) {
      onSaveLoop(currentLoop.start, currentLoop.end, savingName || undefined);
      setSavingName('');
    }
  };

  const handleEdit = (loop: SavedLoop) => {
    setEditingId(loop.id);
    setEditingName(loop.name || '');
  };

  const handleUpdateName = () => {
    if (editingId) {
      onUpdateLoopName(editingId, editingName);
      setEditingId(null);
      setEditingName('');
    }
  };

  const canSave = currentLoop.start !== null && currentLoop.end !== null;

  return (
    <div className="flex items-center gap-2">
      {/* Save button */}
      <button
        onClick={() => {
          if (canSave) {
            handleSave();
          }
        }}
        disabled={!canSave}
        title={canSave ? "Save current loop" : "Set both loop markers to save"}
        className={`p-2 rounded-lg transition-colors ${
          canSave
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
        }`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>

      {/* Saved loops dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="hidden sm:inline">Saved Loops</span>
          {savedLoops.length > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
              {savedLoops.length}
            </span>
          )}
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">

          {/* Saved loops list */}
          <div className="max-h-80 overflow-y-auto">
            {savedLoops.length === 0 ? (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400">
                No saved loops yet
              </p>
            ) : (
              <ul className="py-2">
                {savedLoops.map((loop) => (
                  <li key={loop.id} className="group">
                    <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                      {editingId === loop.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateName();
                              if (e.key === 'Escape') {
                                setEditingId(null);
                                setEditingName('');
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={handleUpdateName}
                            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditingName('');
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => onLoadLoop(loop)}
                            className="flex-1 text-left"
                          >
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {loop.name || `Loop ${formatTime(loop.start)} - ${formatTime(loop.end)}`}
                            </div>
                            {loop.name && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formatTime(loop.start)} - {formatTime(loop.end)}
                              </div>
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(loop)}
                            className="p-1 opacity-0 group-hover:opacity-100 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => onDeleteLoop(loop.id)}
                            className="p-1 opacity-0 group-hover:opacity-100 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}