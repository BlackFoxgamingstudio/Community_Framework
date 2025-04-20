const request = require('supertest');
const app = require('../server');
const db = require('../config/database');
const path = require('path');
const fs = require('fs');

describe('File Upload', () => {
  const testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

  beforeAll(() => {
    // Create test image if it doesn't exist
    if (!fs.existsSync(testImagePath)) {
      const testDir = path.dirname(testImagePath);
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      // Create a small test image
      const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      fs.writeFileSync(testImagePath, buffer);
    }
  });

  afterAll(() => {
    // Cleanup test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  describe('POST /api/upload', () => {
    it('should upload an image successfully', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app)
        .post('/api/upload')
        .attach('file', testImagePath)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('url');
    });

    it('should reject non-image files', async () => {
      const testTextPath = path.join(__dirname, 'fixtures', 'test.txt');
      fs.writeFileSync(testTextPath, 'test content');

      const response = await request(app)
        .post('/api/upload')
        .attach('file', testTextPath)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      fs.unlinkSync(testTextPath);
    });

    it('should handle missing file', async () => {
      const response = await request(app)
        .post('/api/upload')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'No file uploaded');
    });

    it('should handle large files', async () => {
      const largePath = path.join(__dirname, 'fixtures', 'large.jpg');
      // Create a file larger than 5MB
      const buffer = Buffer.alloc(6 * 1024 * 1024);
      fs.writeFileSync(largePath, buffer);

      const response = await request(app)
        .post('/api/upload')
        .attach('file', largePath)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      fs.unlinkSync(largePath);
    });
  });
}); 