const request = require('supertest');
const app = require('../server');
const db = require('../config/database');

describe('API Endpoints', () => {
  describe('GET /api/menu-items', () => {
    it('should return menu items', async () => {
      const mockMenuItems = [
        { id: 1, label: 'About', url: '/about.html', display_order: 1 },
        { id: 2, label: 'Blog', url: '/blog.html', display_order: 2 }
      ];

      db.query.mockResolvedValueOnce({ rows: mockMenuItems });

      const response = await request(app)
        .get('/api/menu-items')
        .expect(200);

      expect(response.body).toEqual(mockMenuItems);
    });
  });

  describe('GET /api/blog-posts', () => {
    it('should return published blog posts', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Test Post',
          content: 'Test content',
          published_at: new Date().toISOString()
        }
      ];

      db.query.mockResolvedValueOnce({ rows: mockPosts });

      const response = await request(app)
        .get('/api/blog-posts')
        .expect(200);

      expect(response.body).toEqual(mockPosts);
    });
  });

  describe('GET /api/events', () => {
    it('should return upcoming events', async () => {
      const mockEvents = [
        {
          id: 1,
          title: 'Test Event',
          event_date: new Date().toISOString(),
          description: 'Test description'
        }
      ];

      db.query.mockResolvedValueOnce({ rows: mockEvents });

      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(response.body).toEqual(mockEvents);
    });
  });

  describe('POST /api/contact', () => {
    it('should save contact form submission', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message'
      };

      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Message sent successfully');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: 'Test User',
        // missing required fields
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 