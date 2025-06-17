describe('SongSnips Critical User Flows', () => {
  const TEST_VIDEO_URL = Cypress.env('TEST_VIDEO_URL')
  const TEST_VIDEO_ID = Cypress.env('TEST_VIDEO_ID')

  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage()
    // Visit the homepage
    cy.visit('/')
  })

  describe('Video Loading Flow', () => {
    it('should load a video from URL input', () => {
      // Enter YouTube URL
      cy.get('[data-testid="url-input"], input[placeholder*="YouTube"]').first()
        .type(`${TEST_VIDEO_URL}{enter}`)

      // Wait for video to load
      cy.get('#youtube-player-container iframe', { timeout: 10000 })
        .should('exist')
        .and('be.visible')

      // Verify timeline is visible
      cy.get('[data-testid="timeline"], [class*="timeline"]').first()
        .should('exist')
        .and('be.visible')

      // Verify control buttons are enabled
      cy.contains('button', /play|pause/i).should('exist')
    })

    it('should display error for invalid URL', () => {
      // Enter invalid URL
      cy.get('[data-testid="url-input"], input[placeholder*="YouTube"]').first()
        .type('https://invalid-url.com{enter}')

      // Should show error message
      cy.contains(/please enter a valid youtube url|invalid/i)
        .should('be.visible')
    })

    it('should load video from URL parameters', () => {
      // Visit with URL parameters
      cy.visit(`/?v=${TEST_VIDEO_ID}&start=10&end=20`)

      // Wait for video to load
      cy.get('#youtube-player-container iframe', { timeout: 10000 })
        .should('exist')

      // Verify loop points are set (look for loop markers or time display)
      cy.contains('0:10').should('exist') // Start time
      cy.contains('0:20').should('exist') // End time
    })
  })

  describe('Loop Creation Flow', () => {
    beforeEach(() => {
      // Load a video first
      cy.get('[data-testid="url-input"], input[placeholder*="YouTube"]').first()
        .type(`${TEST_VIDEO_URL}{enter}`)
      
      // Wait for video to load
      cy.get('#youtube-player-container iframe', { timeout: 10000 })
        .should('exist')
    })

    it('should create a loop by clicking on timeline', () => {
      // Click on timeline to set start point
      cy.get('[data-testid="timeline"], [class*="timeline"]').first()
        .click('left')

      // Click again to set end point
      cy.get('[data-testid="timeline"], [class*="timeline"]').first()
        .click('right')

      // Verify loop markers exist
      cy.get('.loop-handle, [class*="loop"][class*="handle"], [class*="marker"]')
        .should('have.length.at.least', 1)

      // Clear loop button should be enabled
      cy.contains('button', /clear/i).should('not.be.disabled')
    })

    it('should create a quick loop', () => {
      // Click quick loop button
      cy.contains('button', /10s|quick|loop/i).first().click()

      // Verify loop was created
      cy.get('.loop-handle, [class*="loop"][class*="handle"], [class*="marker"]')
        .should('exist')
    })

    it('should clear loop points', () => {
      // First create a loop
      cy.get('[data-testid="timeline"], [class*="timeline"]').first()
        .click('left')
      cy.get('[data-testid="timeline"], [class*="timeline"]').first()
        .click('right')

      // Clear the loop
      cy.contains('button', /clear/i).click()

      // Verify loop markers are gone
      cy.get('.loop-handle, [class*="loop"][class*="handle"], [class*="marker"]')
        .should('not.exist')
    })
  })

  describe('Playback Control Flow', () => {
    beforeEach(() => {
      // Load a video and create a loop
      cy.get('[data-testid="url-input"], input[placeholder*="YouTube"]').first()
        .type(`${TEST_VIDEO_URL}{enter}`)
      
      cy.get('#youtube-player-container iframe', { timeout: 10000 })
        .should('exist')

      // Create a loop
      cy.contains('button', /10s|quick|loop/i).first().click()
    })

    it('should control playback with buttons', () => {
      // Play the video
      cy.contains('button', /play/i).click()

      // Should change to pause
      cy.contains('button', /pause/i).should('exist')

      // Pause the video
      cy.contains('button', /pause/i).click()

      // Should change back to play
      cy.contains('button', /play/i).should('exist')
    })

    it('should stop and reset playback', () => {
      // Play the video
      cy.contains('button', /play/i).click()

      // Stop the video
      cy.contains('button', /stop|reset/i).click()

      // Should be back at play state
      cy.contains('button', /play/i).should('exist')
    })

    it('should change playback speed', () => {
      // Click on speed control
      cy.contains('button', /1\.5x|speed/i).first().click()

      // Verify speed changed (look for active state or confirmation)
      cy.contains(/1\.5x|150%/i).should('exist')
    })
  })

  describe('Keyboard Shortcuts Flow', () => {
    beforeEach(() => {
      // Load a video
      cy.get('[data-testid="url-input"], input[placeholder*="YouTube"]').first()
        .type(`${TEST_VIDEO_URL}{enter}`)
      
      cy.get('#youtube-player-container iframe', { timeout: 10000 })
        .should('exist')
    })

    it('should toggle play/pause with spacebar', () => {
      // Focus on body to ensure keyboard events work
      cy.get('body').click()

      // Press spacebar
      cy.get('body').type(' ')

      // Should show pause button (indicating it's playing)
      cy.contains('button', /pause/i).should('exist')

      // Press spacebar again
      cy.get('body').type(' ')

      // Should show play button (indicating it's paused)
      cy.contains('button', /play/i).should('exist')
    })

    it('should set loop points with keyboard', () => {
      cy.get('body').click()

      // Press 'a' to set loop start
      cy.get('body').type('a')

      // Wait a moment
      cy.wait(500)

      // Press 'b' to set loop end
      cy.get('body').type('b')

      // Verify loop markers exist
      cy.get('.loop-handle, [class*="loop"][class*="handle"], [class*="marker"]')
        .should('have.length.at.least', 1)
    })

    it('should clear loop with keyboard', () => {
      // First create a loop
      cy.get('body').click()
      cy.get('body').type('a')
      cy.wait(500)
      cy.get('body').type('b')

      // Clear with 'c'
      cy.get('body').type('c')

      // Verify loop markers are gone
      cy.get('.loop-handle, [class*="loop"][class*="handle"], [class*="marker"]')
        .should('not.exist')
    })
  })

  describe('Save and Load Loops Flow', () => {
    beforeEach(() => {
      // Load a video and create a loop
      cy.get('[data-testid="url-input"], input[placeholder*="YouTube"]').first()
        .type(`${TEST_VIDEO_URL}{enter}`)
      
      cy.get('#youtube-player-container iframe', { timeout: 10000 })
        .should('exist')

      // Create a loop
      cy.contains('button', /10s|quick|loop/i).first().click()
    })

    it('should save and load a loop', () => {
      // Open saved loops menu
      cy.contains('button', /save|saved|loop/i).click()

      // Save current loop
      cy.contains('button', /save current|add/i).click()

      // Should show in saved loops
      cy.contains(/loop|saved/i).should('exist')

      // Clear current loop
      cy.contains('button', /clear/i).click()

      // Load the saved loop
      cy.contains('button', /load|saved/i).first().click()

      // Verify loop markers are restored
      cy.get('.loop-handle, [class*="loop"][class*="handle"], [class*="marker"]')
        .should('exist')
    })
  })

  describe('Share Loop Flow', () => {
    beforeEach(() => {
      // Load a video and create a loop
      cy.get('[data-testid="url-input"], input[placeholder*="YouTube"]').first()
        .type(`${TEST_VIDEO_URL}{enter}`)
      
      cy.get('#youtube-player-container iframe', { timeout: 10000 })
        .should('exist')

      // Create a specific loop
      cy.get('[data-testid="timeline"], [class*="timeline"]').first()
        .click('left')
      cy.wait(500)
      cy.get('[data-testid="timeline"], [class*="timeline"]').first()
        .click('right')
    })

    it('should generate shareable link', () => {
      // Click share button
      cy.contains('button', /share/i).click()

      // Should show share URL with loop parameters
      cy.get('input[value*="start="], input[value*="end="], [class*="share"][class*="url"]')
        .should('exist')
        .and('contain.value', TEST_VIDEO_ID)
    })

    it('should copy share link to clipboard', () => {
      // Click share button
      cy.contains('button', /share/i).click()

      // Click copy button
      cy.contains('button', /copy/i).click()

      // Should show success message
      cy.contains(/copied/i).should('be.visible')
    })
  })

  describe('Mobile Responsive Flow', () => {
    beforeEach(() => {
      // Set mobile viewport
      cy.viewport('iphone-x')
    })

    it('should work on mobile viewport', () => {
      // Load video
      cy.get('[data-testid="url-input"], input[placeholder*="YouTube"]').first()
        .type(`${TEST_VIDEO_URL}{enter}`)

      // Wait for video
      cy.get('#youtube-player-container iframe', { timeout: 10000 })
        .should('exist')

      // Timeline should be visible and clickable
      cy.get('[data-testid="timeline"], [class*="timeline"]').first()
        .should('be.visible')
        .click()

      // Controls should be accessible
      cy.contains('button', /play/i).should('be.visible')
    })
  })

  describe('Error Recovery Flow', () => {
    it('should handle network errors gracefully', () => {
      // Intercept and fail the API request
      cy.intercept('GET', '**/api/**', { forceNetworkError: true }).as('apiError')

      // Try to search
      cy.contains('button', /search/i).click()

      // Should show error message
      cy.contains(/error|failed|try again/i).should('be.visible')
    })

    it('should handle blocked videos gracefully', () => {
      // Enter a URL that would typically be blocked
      cy.get('[data-testid="url-input"], input[placeholder*="YouTube"]').first()
        .type('https://www.youtube.com/watch?v=blocked-video-id{enter}')

      // Should show appropriate error
      cy.contains(/error|cannot|blocked|unavailable/i, { timeout: 10000 })
        .should('be.visible')
    })
  })
})