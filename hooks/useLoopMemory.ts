import { useState, useEffect, useCallback } from 'react';

interface SavedLoop {
  id: string;
  start: number;
  end: number;
  name?: string;
  timestamp: number;
}

interface LoopMemory {
  [videoId: string]: SavedLoop[];
}

const STORAGE_KEY = 'songsnips_loop_memory';
const MAX_LOOPS_PER_VIDEO = 10;

export function useLoopMemory(videoId: string | null) {
  const [savedLoops, setSavedLoops] = useState<SavedLoop[]>([]);

  // Load saved loops from localStorage
  useEffect(() => {
    if (!videoId) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const memory: LoopMemory = JSON.parse(stored);
        setSavedLoops(memory[videoId] || []);
      }
    } catch (error) {
      console.error('Error loading saved loops:', error);
    }
  }, [videoId]);

  // Save a new loop
  const saveLoop = useCallback((start: number, end: number, name?: string) => {
    if (!videoId) return;

    const newLoop: SavedLoop = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      start,
      end,
      name,
      timestamp: Date.now()
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const memory: LoopMemory = stored ? JSON.parse(stored) : {};
      
      const videoLoops = memory[videoId] || [];
      
      // Add new loop and keep only the most recent MAX_LOOPS_PER_VIDEO
      const updatedLoops = [newLoop, ...videoLoops]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_LOOPS_PER_VIDEO);
      
      memory[videoId] = updatedLoops;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
      setSavedLoops(updatedLoops);
      
      return newLoop.id;
    } catch (error) {
      console.error('Error saving loop:', error);
      return null;
    }
  }, [videoId]);

  // Delete a saved loop
  const deleteLoop = useCallback((loopId: string) => {
    if (!videoId) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const memory: LoopMemory = JSON.parse(stored);
      const videoLoops = memory[videoId] || [];
      
      memory[videoId] = videoLoops.filter(loop => loop.id !== loopId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
      setSavedLoops(memory[videoId]);
    } catch (error) {
      console.error('Error deleting loop:', error);
    }
  }, [videoId]);

  // Update a loop's name
  const updateLoopName = useCallback((loopId: string, name: string) => {
    if (!videoId) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const memory: LoopMemory = JSON.parse(stored);
      const videoLoops = memory[videoId] || [];
      
      memory[videoId] = videoLoops.map(loop => 
        loop.id === loopId ? { ...loop, name } : loop
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
      setSavedLoops(memory[videoId]);
    } catch (error) {
      console.error('Error updating loop name:', error);
    }
  }, [videoId]);

  // Clear all loops for the current video
  const clearVideoLoops = useCallback(() => {
    if (!videoId) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const memory: LoopMemory = JSON.parse(stored);
      delete memory[videoId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
      setSavedLoops([]);
    } catch (error) {
      console.error('Error clearing video loops:', error);
    }
  }, [videoId]);

  return {
    savedLoops,
    saveLoop,
    deleteLoop,
    updateLoopName,
    clearVideoLoops
  };
}