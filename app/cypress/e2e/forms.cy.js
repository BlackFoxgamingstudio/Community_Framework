describe('Form Validation and Error Handling', () => {
  beforeEach(() => {
    cy.visit('/about.html');
  });

  describe('Contact Form Validation', () => {
    it('should validate required fields', () => {
      cy.get('.contact-form button').click();
      cy.get('#name:invalid').should('exist');
      cy.get('#email:invalid').should('exist');
      cy.get('#subject:invalid').should('exist');
      cy.get('#message:invalid').should('exist');
    });

    it('should validate email format', () => {
      cy.get('#name').type('Test User');
      cy.get('#email').type('invalid-email');
      cy.get('#subject').type('Test Subject');
      cy.get('#message').type('Test message');
      cy.get('.contact-form button').click();
      cy.get('#email:invalid').should('exist');
    });

    it('should show success message on valid submission', () => {
      cy.get('#name').type('Test User');
      cy.get('#email').type('test@example.com');
      cy.get('#subject').type('Test Subject');
      cy.get('#message').type('Test message');
      cy.get('.contact-form button').click();
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Message sent successfully');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', () => {
      // Intercept API call and force an error
      cy.intercept('POST', '/api/contact', {
        statusCode: 500,
        body: { error: 'Server error' }
      });

      cy.get('#name').type('Test User');
      cy.get('#email').type('test@example.com');
      cy.get('#subject').type('Test Subject');
      cy.get('#message').type('Test message');
      cy.get('.contact-form button').click();
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Error sending message');
      });
    });

    it('should handle network errors', () => {
      // Simulate network failure
      cy.intercept('POST', '/api/contact', {
        forceNetworkError: true
      });

      cy.get('#name').type('Test User');
      cy.get('#email').type('test@example.com');
      cy.get('#subject').type('Test Subject');
      cy.get('#message').type('Test message');
      cy.get('.contact-form button').click();
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Error sending message');
      });
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper ARIA labels', () => {
      cy.get('form').should('have.attr', 'role', 'form');
      cy.get('label[for="name"]').should('be.visible');
      cy.get('label[for="email"]').should('be.visible');
      cy.get('label[for="subject"]').should('be.visible');
      cy.get('label[for="message"]').should('be.visible');
    });

    it('should be keyboard navigable', () => {
      cy.get('#name').focus().type('Test User').tab();
      cy.get('#email').should('have.focus').type('test@example.com').tab();
      cy.get('#subject').should('have.focus').type('Test Subject').tab();
      cy.get('#message').should('have.focus').type('Test message').tab();
      cy.get('button[type="submit"]').should('have.focus');
    });
  });
}); 