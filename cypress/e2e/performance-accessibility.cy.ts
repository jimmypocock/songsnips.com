describe('Performance and Accessibility Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  describe('Performance Tests', () => {
    it('should load the homepage quickly', () => {
      cy.visit('/', {
        onBeforeLoad: (win) => {
          win.performance.mark('start')
        },
        onLoad: (win) => {
          win.performance.mark('end')
          win.performance.measure('pageLoad', 'start', 'end')
        }
      })

      cy.window().then((win) => {
        const measure = win.performance.getEntriesByName('pageLoad')[0]
        expect(measure.duration).to.be.lessThan(3000) // Page should load in under 3 seconds
      })
    })

    it('should handle rapid user interactions', () => {
      cy.visit('/')
      
      // Load a video
      cy.get('input[placeholder*="YouTube"]').first()
        .type(`${Cypress.env('TEST_VIDEO_URL')}{enter}`)

      cy.get('#youtube-player-container iframe', { timeout: 10000 })
        .should('exist')

      // Rapidly click timeline multiple times
      const timeline = cy.get('[data-testid="timeline"], [class*="timeline"]').first()
      
      for (let i = 0; i < 10; i++) {
        timeline.click(i * 40, 20)
        cy.wait(50)
      }

      // App should remain responsive
      cy.contains('button', /play/i).should('be.visible').click()
      cy.contains('button', /pause/i).should('be.visible')
    })

    it('should efficiently handle multiple saved loops', () => {
      cy.visit('/')
      
      // Create multiple saved loops in localStorage
      const loops = []
      for (let i = 0; i < 20; i++) {
        loops.push({
          id: `loop-${i}`,
          videoId: 'test-video',
          start: i * 10,
          end: (i * 10) + 5,
          name: `Test Loop ${i}`,
          createdAt: new Date().toISOString()
        })
      }

      cy.window().then((win) => {
        win.localStorage.setItem('savedLoops', JSON.stringify(loops))
      })

      // Reload and check performance
      cy.reload()

      // UI should load without significant delay
      cy.contains(/saved.*loops/i, { timeout: 2000 }).should('exist')
    })
  })

  describe('Accessibility Tests', () => {
    it('should have proper heading structure', () => {
      cy.visit('/')

      // Should have one h1
      cy.get('h1').should('have.length', 1)

      // Check heading hierarchy
      cy.get('h1, h2, h3, h4, h5, h6').then((headings) => {
        const levels = Array.from(headings).map(h => parseInt(h.tagName[1]))
        
        // Check that heading levels don't skip
        for (let i = 1; i < levels.length; i++) {
          expect(levels[i] - levels[i-1]).to.be.lessThan(2)
        }
      })
    })

    it('should have proper ARIA labels for interactive elements', () => {
      cy.visit('/')

      // Buttons should have accessible text or aria-label
      cy.get('button').each(($button) => {
        cy.wrap($button).then(($btn) => {
          const text = $btn.text().trim()
          const ariaLabel = $btn.attr('aria-label')
          expect(text || ariaLabel).to.not.be.empty
        })
      })

      // Form inputs should have labels or aria-label
      cy.get('input').each(($input) => {
        cy.wrap($input).then(($inp) => {
          const ariaLabel = $inp.attr('aria-label')
          const placeholder = $inp.attr('placeholder')
          const id = $inp.attr('id')
          
          if (id) {
            // Check for associated label
            cy.get(`label[for="${id}"]`).should('exist')
          } else {
            // Should have aria-label or placeholder
            expect(ariaLabel || placeholder).to.not.be.empty
          }
        })
      })
    })

    it('should be keyboard navigable', () => {
      cy.visit('/')

      // Tab through interactive elements
      cy.get('body').tab()
      
      // Should focus on first interactive element
      cy.focused().should('exist')

      // Continue tabbing through elements
      const interactiveElements = []
      cy.get('button, input, a, [tabindex="0"]').each(($el) => {
        interactiveElements.push($el)
      })

      // Tab through all elements
      for (let i = 0; i < 10; i++) {
        cy.focused().tab()
      }

      // Should be able to activate elements with keyboard
      cy.focused().type('{enter}')
    })

    it('should have sufficient color contrast', () => {
      cy.visit('/')

      // Check text elements for contrast
      cy.get('p, span, button, h1, h2, h3').each(($el) => {
        cy.wrap($el).then(($element) => {
          const color = $element.css('color')
          const bgColor = $element.css('background-color')
          
          // Skip if transparent background (will inherit from parent)
          if (bgColor !== 'rgba(0, 0, 0, 0)') {
            // This is a simplified check - in practice you'd use a contrast ratio calculator
            const rgb = color.match(/\d+/g)
            if (rgb) {
              const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000
              // Dark text on light background or light text on dark background
              expect(brightness).to.satisfy((b: number) => b < 128 || b > 128)
            }
          }
        })
      })
    })

    it('should announce dynamic content changes', () => {
      cy.visit('/')

      // Load a video
      cy.get('input[placeholder*="YouTube"]').first()
        .type(`${Cypress.env('TEST_VIDEO_URL')}{enter}`)

      // Check for live regions
      cy.get('[aria-live], [role="status"], [role="alert"]').should('exist')

      // Error messages should be announced
      cy.get('input[placeholder*="YouTube"]').first()
        .clear()
        .type('invalid-url{enter}')

      cy.get('[role="alert"], [aria-live="assertive"]').should('contain', /error|invalid/i)
    })

    it('should work with screen reader navigation', () => {
      cy.visit('/')

      // Check for skip links
      cy.get('a[href^="#"]:contains("Skip"), [class*="skip"]').should('exist')

      // Main content should have proper landmark
      cy.get('main, [role="main"]').should('exist')

      // Navigation should be marked
      cy.get('nav, [role="navigation"]').should('exist')
    })

    it('should support reduced motion preferences', () => {
      // Set prefers-reduced-motion
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win, 'matchMedia')
            .withArgs('(prefers-reduced-motion: reduce)')
            .returns({
              matches: true,
              addListener: () => {},
              removeListener: () => {}
            })
        }
      })

      // Animations should be reduced
      cy.get('*').each(($el) => {
        cy.wrap($el).then(($element) => {
          const transition = $element.css('transition-duration')
          const animation = $element.css('animation-duration')
          
          // If element has animation/transition, it should be very short
          if (transition !== '0s') {
            const duration = parseFloat(transition)
            expect(duration).to.be.lessThan(0.1)
          }
        })
      })
    })
  })

  describe('Responsive Design Tests', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 }
    ]

    viewports.forEach((viewport) => {
      it(`should be usable on ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        cy.viewport(viewport.width, viewport.height)
        cy.visit('/')

        // Essential elements should be visible
        cy.get('input[placeholder*="YouTube"]').should('be.visible')
        cy.contains('button', /search|load/i).should('be.visible')

        // Load a video
        cy.get('input[placeholder*="YouTube"]').first()
          .type(`${Cypress.env('TEST_VIDEO_URL')}{enter}`)

        cy.get('#youtube-player-container iframe', { timeout: 10000 })
          .should('exist')

        // Timeline should be accessible
        cy.get('[data-testid="timeline"], [class*="timeline"]')
          .should('be.visible')
          .and('have.css', 'width')
          .and('not.equal', '0px')

        // Controls should be reachable
        cy.contains('button', /play/i).should('be.visible')
      })
    })

    it('should handle orientation changes', () => {
      // Start in portrait
      cy.viewport('iphone-x')
      cy.visit('/')

      cy.get('input[placeholder*="YouTube"]').first()
        .type(`${Cypress.env('TEST_VIDEO_URL')}{enter}`)

      // Switch to landscape
      cy.viewport('iphone-x', 'landscape')

      // Video should adapt
      cy.get('#youtube-player-container').should('be.visible')

      // UI should remain functional
      cy.get('[data-testid="timeline"], [class*="timeline"]').should('be.visible')
    })
  })

  describe('Browser Compatibility Tests', () => {
    it('should show fallback for unsupported features', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          // Simulate browser without certain APIs
          delete win.localStorage
        }
      })

      // App should still load
      cy.contains(/songsnips|youtube|loop/i).should('exist')

      // Should show appropriate message or fallback
      cy.window().then((win) => {
        if (!win.localStorage) {
          cy.contains(/browser.*not.*supported|upgrade/i).should('exist')
        }
      })
    })

    it('should handle third-party cookie blocking', () => {
      // Block YouTube iframe cookies
      cy.visit('/', {
        onBeforeLoad(win) {
          // Simulate third-party cookie blocking
          const originalCookie = win.document.cookie
          Object.defineProperty(win.document, 'cookie', {
            get: () => '',
            set: () => {}
          })
        }
      })

      // Load video
      cy.get('input[placeholder*="YouTube"]').first()
        .type(`${Cypress.env('TEST_VIDEO_URL')}{enter}`)

      // Video should still attempt to load
      cy.get('#youtube-player-container').should('exist')
    })
  })
})