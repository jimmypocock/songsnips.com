// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Ignore hydration errors from Next.js
Cypress.on('uncaught:exception', (err) => {
  // Ignore hydration errors
  if (err.message.includes('Hydration failed') || 
      err.message.includes('Text content does not match') ||
      err.message.includes('Cannot access globalThis.queueMicrotask')) {
    return false
  }
  // Let other errors fail the test
  return true
})

// Custom commands for SongSnips E2E testing
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Load a YouTube video in SongSnips
       * @param videoId YouTube video ID
       */
      loadVideo(videoId: string): Chainable<Element>
      
      /**
       * Wait for YouTube player to be ready
       */
      waitForPlayer(): Chainable<Element>
      
      /**
       * Create a loop with start and end times
       * @param startTime Start time in seconds
       * @param endTime End time in seconds
       */
      createLoop(startTime: number, endTime: number): Chainable<Element>
      
      /**
       * Save current loop
       * @param name Optional name for the loop
       */
      saveLoop(name?: string): Chainable<Element>
      
      /**
       * Load a saved loop
       * @param index Index of the loop to load
       */
      loadSavedLoop(index: number): Chainable<Element>
      
      /**
       * Wait for video to load and be playable
       */
      waitForVideoLoad(): Chainable<Element>
      
      /**
       * Drag timeline marker to specific position
       * @param marker 'start' or 'end'
       * @param percentage Position as percentage of timeline width
       */
      dragTimelineMarker(marker: 'start' | 'end', percentage: number): Chainable<Element>
    }
  }
}