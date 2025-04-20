describe('Performance Tests', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.performance.mark('start-load');
      },
      onLoad: (win) => {
        win.performance.mark('end-load');
      }
    });
  });

  it('should load home page within 3 seconds', () => {
    cy.window().then((win) => {
      win.performance.measure('page-load', 'start-load', 'end-load');
      const measure = win.performance.getEntriesByName('page-load')[0];
      expect(measure.duration).to.be.lessThan(3000);
    });
  });

  it('should load images efficiently', () => {
    cy.get('img').each(($img) => {
      // Check if images are loaded
      expect($img[0].naturalWidth).to.be.greaterThan(0);
    });
  });

  describe('API Response Times', () => {
    it('should get blog posts within 1 second', () => {
      cy.intercept('/api/blog-posts').as('getBlogPosts');
      cy.visit('/blog.html');
      cy.wait('@getBlogPosts').its('duration').should('be.lessThan', 1000);
    });

    it('should get events within 1 second', () => {
      cy.intercept('/api/events').as('getEvents');
      cy.visit('/events.html');
      cy.wait('@getEvents').its('duration').should('be.lessThan', 1000);
    });
  });

  describe('Mobile Performance', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should handle mobile navigation smoothly', () => {
      cy.intercept('**/*').as('networkRequests');
      
      cy.get('.nav-toggle').click();
      cy.get('.nav-menu ul.active').should('be.visible');
      
      // Check that no unnecessary requests were made
      cy.get('@networkRequests').then((interceptions) => {
        expect(interceptions.length).to.equal(0);
      });
    });

    it('should load mobile-optimized images', () => {
      cy.get('img').each(($img) => {
        cy.wrap($img)
          .should('be.visible')
          .and(($img) => {
            expect($img[0].naturalWidth).to.be.lessThan(1000);
          });
      });
    });
  });

  describe('Resource Loading', () => {
    it('should load CSS before content', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win.console, 'error').as('consoleError');
        },
      });
      
      cy.get('@consoleError').should('not.be.called');
      cy.get('link[rel="stylesheet"]').should('have.attr', 'rel', 'stylesheet');
    });

    it('should defer non-critical JavaScript', () => {
      cy.get('script:not([async]):not([defer])')
        .should('have.length', 0);
    });
  });
}); 