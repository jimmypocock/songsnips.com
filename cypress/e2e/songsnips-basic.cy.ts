describe('SongSnips Basic E2E Tests', () => {
  const TEST_VIDEO_URL = 'https://www.youtube.com/watch?v=8inJtTG_DuU'
  const TEST_VIDEO_ID = '8inJtTG_DuU'

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
    // Wait for the page to fully load
    cy.wait(1000)
  })

  describe('Video Loading', () => {
    it('should load the homepage', () => {
      cy.contains('SongSnips').should('be.visible')
      cy.get('input[placeholder*="YouTube"]').should('be.visible')
    })

    it('should load a video from URL', () => {
      // Find and fill the YouTube URL input
      cy.get('input[placeholder*="YouTube"]')
        .should('be.visible')
        .clear()
        .type(TEST_VIDEO_URL)
      
      // Click the load button
      cy.contains('button', 'Load').click()

      // Wait for video iframe to appear
      cy.get('#youtube-player-container iframe', { timeout: 15000 })
        .should('exist')

      // Check if timeline becomes visible
      cy.get('[class*="Timeline"], [class*="timeline"]', { timeout: 10000 })
        .should('be.visible')
    })

    it('should show error for invalid URL', () => {
      cy.get('input[placeholder*="YouTube"]')
        .clear()
        .type('https://invalid-url.com')
      
      cy.contains('button', 'Load').click()

      // Should show error message
      cy.contains(/invalid|error/i, { timeout: 5000 })
        .should('be.visible')
    })
  })

  describe('Video Controls', () => {
    beforeEach(() => {
      // Load a video first
      cy.get('input[placeholder*="YouTube"]')
        .clear()
        .type(TEST_VIDEO_URL)
      
      cy.contains('button', 'Load').click()
      
      // Wait for video to load
      cy.get('#youtube-player-container iframe', { timeout: 15000 })
        .should('exist')
      
      // Give player time to initialize
      cy.wait(3000)
    })

    it('should have play/pause controls', () => {
      // Should have play button
      cy.get('button').contains(/play/i).should('be.visible')
      
      // Click play
      cy.get('button').contains(/play/i).click()
      
      // Should show pause button
      cy.wait(1000)
      cy.get('button').contains(/pause/i).should('be.visible')
    })

    it('should create a loop by clicking timeline', () => {
      // Click on timeline
      cy.get('[class*="Timeline"], [class*="timeline"]')
        .should('be.visible')
        .then($el => {
          const rect = $el[0].getBoundingClientRect()
          // Click at 25% position
          cy.wrap($el).click(rect.width * 0.25, rect.height / 2)
          cy.wait(500)
          // Click at 75% position
          cy.wrap($el).click(rect.width * 0.75, rect.height / 2)
        })

      // Should have loop markers visible
      cy.get('[class*="loop"], [class*="marker"]', { timeout: 5000 })
        .should('have.length.at.least', 1)
    })

    it('should have quick loop buttons', () => {
      // Check for quick loop buttons
      cy.contains('button', /10s|loop/i).should('be.visible')
      
      // Click a quick loop button
      cy.contains('button', /10s|loop/i).first().click()
      
      // Should create loop markers
      cy.get('[class*="loop"], [class*="marker"]', { timeout: 5000 })
        .should('exist')
    })
  })

  describe('Speed Controls', () => {
    beforeEach(() => {
      // Load a video first
      cy.get('input[placeholder*="YouTube"]')
        .clear()
        .type(TEST_VIDEO_URL)
      
      cy.contains('button', 'Load').click()
      
      cy.get('#youtube-player-container iframe', { timeout: 15000 })
        .should('exist')
    })

    it('should have speed control buttons', () => {
      // Should show default speed (100%)
      cy.contains('100%').should('be.visible')
      
      // Click on different speed
      cy.contains('button', '75%').click()
      
      // Should update active speed
      cy.contains('button', '75%').should('have.class', 'bg-primary')
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x')
      
      // Essential elements should still be visible
      cy.get('input[placeholder*="YouTube"]').should('be.visible')
      cy.contains('button', 'Load').should('be.visible')
      
      // Load a video
      cy.get('input[placeholder*="YouTube"]')
        .clear()
        .type(TEST_VIDEO_URL)
      
      cy.contains('button', 'Load').click()
      
      // Video should load
      cy.get('#youtube-player-container iframe', { timeout: 15000 })
        .should('exist')
    })
  })

  describe('Keyboard Shortcuts', () => {
    beforeEach(() => {
      // Load a video first
      cy.get('input[placeholder*="YouTube"]')
        .clear()
        .type(TEST_VIDEO_URL)
      
      cy.contains('button', 'Load').click()
      
      cy.get('#youtube-player-container iframe', { timeout: 15000 })
        .should('exist')
      
      cy.wait(2000)
    })

    it('should toggle play/pause with spacebar', () => {
      // Focus on body
      cy.get('body').click()
      
      // Press spacebar
      cy.get('body').type(' ')
      
      // Should be playing
      cy.contains('button', /pause/i).should('be.visible')
      
      // Press spacebar again
      cy.get('body').type(' ')
      
      // Should be paused
      cy.contains('button', /play/i).should('be.visible')
    })
  })
})