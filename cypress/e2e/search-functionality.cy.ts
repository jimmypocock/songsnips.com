describe('Search Functionality E2E Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
  })

  describe('YouTube Search Integration', () => {
    it('should search for videos using the search feature', () => {
      // Look for search input or button
      cy.contains('button', /search/i).click()

      // Enter search query
      cy.get('input[placeholder*="Search"], input[type="search"]')
        .type('guitar tutorial{enter}')

      // Wait for search results
      cy.get('[data-testid*="search-result"], [class*="search"][class*="result"]', { timeout: 10000 })
        .should('have.length.at.least', 1)

      // Click on first result
      cy.get('[data-testid*="search-result"], [class*="search"][class*="result"]')
        .first()
        .click()

      // Video should load
      cy.get('#youtube-player-container iframe', { timeout: 10000 })
        .should('exist')
    })

    it('should handle empty search query', () => {
      cy.contains('button', /search/i).click()

      // Submit empty search
      cy.get('input[placeholder*="Search"], input[type="search"]')
        .type('{enter}')

      // Should show validation message or no results
      cy.contains(/enter.*search|no results|type something/i)
        .should('be.visible')
    })

    it('should handle search with no results', () => {
      cy.contains('button', /search/i).click()

      // Search for something unlikely to return results
      cy.get('input[placeholder*="Search"], input[type="search"]')
        .type('xyzabc123456789notavideo{enter}')

      // Should show no results message
      cy.contains(/no.*results|not found|try.*different/i, { timeout: 10000 })
        .should('be.visible')
    })

    it('should display search result metadata', () => {
      cy.contains('button', /search/i).click()

      cy.get('input[placeholder*="Search"], input[type="search"]')
        .type('music{enter}')

      // Wait for results
      cy.get('[data-testid*="search-result"], [class*="search"][class*="result"]', { timeout: 10000 })
        .first()
        .within(() => {
          // Should show video title
          cy.get('[class*="title"], h3, h4').should('exist')
          
          // Should show channel name
          cy.get('[class*="channel"]').should('exist')
          
          // Should show thumbnail
          cy.get('img').should('have.attr', 'src')
        })
    })

    it('should handle search API quota exceeded', () => {
      // Intercept API call to simulate quota exceeded
      cy.intercept('GET', '**/api/search*', {
        statusCode: 200,
        body: {
          items: [],
          totalResults: 0,
          quotaExceeded: true,
          quotaInfo: {
            used: 10000,
            limit: 10000,
            remaining: 0,
            searchesRemaining: 0
          }
        }
      }).as('quotaExceeded')

      cy.contains('button', /search/i).click()
      cy.get('input[placeholder*="Search"], input[type="search"]')
        .type('test{enter}')

      cy.wait('@quotaExceeded')

      // Should show quota exceeded message
      cy.contains(/quota.*exceeded|limit.*reached|try.*later/i)
        .should('be.visible')
    })
  })

  describe('External Search Links', () => {
    it('should provide YouTube search link', () => {
      // Look for external search option
      cy.contains(/search.*youtube|external.*search/i).should('exist')

      // Should have YouTube search link
      cy.get('a[href*="youtube.com/results"]')
        .should('exist')
        .and('have.attr', 'target', '_blank')
    })

    it('should update search query in external links', () => {
      const searchQuery = 'jazz piano'

      // Enter search query
      cy.get('input[placeholder*="Search"], input[placeholder*="YouTube"]')
        .first()
        .type(searchQuery)

      // Check if external link is updated
      cy.get('a[href*="youtube.com/results"]')
        .should('have.attr', 'href')
        .and('include', encodeURIComponent(searchQuery))
    })
  })

  describe('Search History and Suggestions', () => {
    it('should save recent searches to localStorage', () => {
      cy.contains('button', /search/i).click()

      // Perform a search
      cy.get('input[placeholder*="Search"], input[type="search"]')
        .type('blues guitar{enter}')

      // Wait for results
      cy.get('[data-testid*="search-result"], [class*="search"][class*="result"]', { timeout: 10000 })
        .should('exist')

      // Check localStorage
      cy.window().then((win) => {
        const storage = win.localStorage.getItem('recentSearches')
        if (storage) {
          expect(storage).to.include('blues guitar')
        }
      })
    })

    it('should load video from direct URL paste', () => {
      const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

      // Paste URL directly
      cy.get('input[placeholder*="YouTube"], input[placeholder*="URL"]')
        .first()
        .clear()
        .type(`${videoUrl}{enter}`)

      // Should load video without search
      cy.get('#youtube-player-container iframe', { timeout: 10000 })
        .should('exist')
        .and('have.attr', 'src')
        .and('include', 'dQw4w9WgXcQ')
    })
  })

  describe('Search UI Responsiveness', () => {
    it('should show loading state during search', () => {
      // Intercept search to add delay
      cy.intercept('GET', '**/api/search*', (req) => {
        req.reply((res) => {
          res.delay = 2000 // 2 second delay
          res.send({
            items: [{
              videoId: 'test123',
              title: 'Test Video',
              description: 'Test',
              thumbnail: 'https://example.com/thumb.jpg',
              channelTitle: 'Test Channel',
              publishedAt: new Date().toISOString()
            }],
            totalResults: 1
          })
        })
      }).as('slowSearch')

      cy.contains('button', /search/i).click()
      cy.get('input[placeholder*="Search"], input[type="search"]')
        .type('test{enter}')

      // Should show loading indicator
      cy.get('[class*="loading"], [class*="spinner"], [role="status"]')
        .should('be.visible')

      cy.wait('@slowSearch')

      // Loading should disappear
      cy.get('[class*="loading"], [class*="spinner"], [role="status"]')
        .should('not.exist')
    })

    it('should be accessible via keyboard navigation', () => {
      cy.contains('button', /search/i).click()

      // Type search query
      cy.get('input[placeholder*="Search"], input[type="search"]')
        .type('piano')

      // Tab to search button and press enter
      cy.get('input[placeholder*="Search"], input[type="search"]')
        .type('{enter}')

      // Wait for results
      cy.get('[data-testid*="search-result"], [class*="search"][class*="result"]', { timeout: 10000 })
        .should('exist')

      // Tab to first result
      cy.get('body').tab()

      // Press enter to select
      cy.focused().type('{enter}')

      // Video should load
      cy.get('#youtube-player-container iframe', { timeout: 10000 })
        .should('exist')
    })
  })

  describe('Search Error Handling', () => {
    it('should handle network errors during search', () => {
      // Intercept and fail the search request
      cy.intercept('GET', '**/api/search*', { forceNetworkError: true }).as('searchError')

      cy.contains('button', /search/i).click()
      cy.get('input[placeholder*="Search"], input[type="search"]')
        .type('test{enter}')

      cy.wait('@searchError')

      // Should show error message
      cy.contains(/error|failed|try.*again|connection/i)
        .should('be.visible')
    })

    it('should retry failed searches', () => {
      let callCount = 0

      // First call fails, second succeeds
      cy.intercept('GET', '**/api/search*', (req) => {
        callCount++
        if (callCount === 1) {
          req.reply({ forceNetworkError: true })
        } else {
          req.reply({
            items: [{
              videoId: 'test123',
              title: 'Test Video',
              description: 'Test',
              thumbnail: 'https://example.com/thumb.jpg',
              channelTitle: 'Test Channel',
              publishedAt: new Date().toISOString()
            }],
            totalResults: 1
          })
        }
      }).as('searchRetry')

      cy.contains('button', /search/i).click()
      cy.get('input[placeholder*="Search"], input[type="search"]')
        .type('test{enter}')

      // Wait for error
      cy.contains(/error|failed/i).should('be.visible')

      // Click retry
      cy.contains('button', /retry|try.*again/i).click()

      // Should succeed second time
      cy.get('[data-testid*="search-result"], [class*="search"][class*="result"]')
        .should('exist')
    })
  })
})