describe('RawFuelFoods Website', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should load the home page', () => {
    cy.get('.hero h1').should('contain', 'RawFuelFoods');
    cy.get('.nav-menu').should('be.visible');
  });

  it('should navigate to About page', () => {
    cy.get('.nav-menu a[href="about.html"]').click();
    cy.get('.page-header h1').should('contain', 'About Us');
    cy.get('.contact-form').should('be.visible');
  });

  it('should submit contact form', () => {
    cy.visit('/about.html');
    cy.get('#name').type('Test User');
    cy.get('#email').type('test@example.com');
    cy.get('#subject').type('Test Subject');
    cy.get('#message').type('Test message');
    cy.get('.contact-form button').click();
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Message sent successfully');
    });
  });

  it('should load blog posts', () => {
    cy.visit('/blog.html');
    cy.get('.blog-grid').should('be.visible');
    cy.get('.blog-post').should('have.length.at.least', 1);
  });

  it('should load events', () => {
    cy.visit('/events.html');
    cy.get('.events-list').should('be.visible');
    cy.get('.event-card').should('have.length.at.least', 1);
  });

  it('should handle mobile navigation', () => {
    cy.viewport('iphone-x');
    cy.get('.nav-toggle').should('be.visible').click();
    cy.get('.nav-menu ul').should('have.class', 'active');
  });
}); 