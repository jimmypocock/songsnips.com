/// <reference types="cypress" />

// Custom command to load a YouTube video
Cypress.Commands.add('loadVideo', (url: string) => {
  cy.get('input[placeholder*="YouTube"], [data-testid="url-input"]').first()
    .clear()
    .type(`${url}{enter}`)
  cy.waitForPlayer()
})

// Custom command to wait for YouTube player to be ready
Cypress.Commands.add('waitForPlayer', () => {
  // Wait for the YouTube player iframe to be present
  cy.get('#youtube-player-container iframe', { timeout: 15000 }).should('be.visible')
  
  // Additional wait to ensure player is fully loaded
  cy.wait(2000)
})

// Custom command to create a loop by clicking timeline
Cypress.Commands.add('createLoop', (startPercent: number, endPercent: number) => {
  const timeline = cy.get('[data-testid="timeline"], [class*="timeline"]').first()
  
  timeline.then(($timeline) => {
    const rect = $timeline[0].getBoundingClientRect()
    const startX = rect.left + (rect.width * startPercent / 100)
    const endX = rect.left + (rect.width * endPercent / 100)
    
    // Click for start point
    timeline.click(startX - rect.left, rect.height / 2)
    cy.wait(500)
    
    // Click for end point
    timeline.click(endX - rect.left, rect.height / 2)
  })
})

// Custom command to use keyboard shortcuts
Cypress.Commands.add('useKeyboardShortcut', (key: string) => {
  cy.get('body').type(key)
})

// Custom command to save current loop
Cypress.Commands.add('saveLoop', () => {
  // Click save button
  cy.contains('button', /save/i).click()
  cy.wait(500)
})

// Custom command to clear all data
Cypress.Commands.add('clearAllData', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Custom command for checking accessibility
Cypress.Commands.add('checkA11y', (options?: any) => {
  // This would integrate with axe-core if installed
  // For now, basic checks
  cy.get('img').each(($img) => {
    cy.wrap($img).should('have.attr', 'alt')
  })
  
  cy.get('button').each(($button) => {
    cy.wrap($button).then(($btn) => {
      const text = $btn.text().trim()
      const ariaLabel = $btn.attr('aria-label')
      expect(text || ariaLabel).to.not.be.empty
    })
  })
})

// Custom command to wait for search results
Cypress.Commands.add('waitForSearchResults', () => {
  cy.get('[data-testid*="search-result"], [class*="search"][class*="result"]', { timeout: 10000 })
    .should('have.length.at.least', 1)
})

// Custom command to tab through elements
Cypress.Commands.add('tab', () => {
  cy.focused().trigger('keydown', { keyCode: 9, which: 9, key: 'Tab' })
})

// Prevent Cypress from failing on uncaught exceptions from YouTube API
Cypress.on('uncaught:exception', (err, runnable) => {
  // YouTube API sometimes throws errors that don't affect our tests
  if (err.message.includes('YouTube') || 
      err.message.includes('postMessage') || 
      err.message.includes('player') ||
      err.message.includes('YT')) {
    return false
  }
  return true
})

// Add custom command types
declare global {
  namespace Cypress {
    interface Chainable {
      loadVideo(url: string): Chainable<void>
      waitForPlayer(): Chainable<void>
      createLoop(startPercent: number, endPercent: number): Chainable<void>
      useKeyboardShortcut(key: string): Chainable<void>
      saveLoop(): Chainable<void>
      clearAllData(): Chainable<void>
      checkA11y(options?: any): Chainable<void>
      waitForSearchResults(): Chainable<void>
      tab(): Chainable<void>
    }
  }
}

// Required for TypeScript
export {}