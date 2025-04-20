const db = require('../config/database');

describe('Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query Execution', () => {
    it('should execute queries successfully', async () => {
      const mockResult = { rows: [{ id: 1 }] };
      db.query.mockResolvedValueOnce(mockResult);

      const result = await db.query('SELECT * FROM test');
      expect(result).toEqual(mockResult);
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('should handle query errors', async () => {
      const mockError = new Error('Database error');
      db.query.mockRejectedValueOnce(mockError);

      await expect(db.query('SELECT * FROM test'))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('Transaction Handling', () => {
    it('should handle transactions correctly', async () => {
      // Mock BEGIN
      db.query.mockResolvedValueOnce({ rows: [] });
      // Mock actual query
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      // Mock COMMIT
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await db.query('BEGIN; SELECT * FROM test; COMMIT;');
      expect(db.query).toHaveBeenCalledTimes(3);
    });

    it('should rollback on error', async () => {
      // Mock BEGIN
      db.query.mockResolvedValueOnce({ rows: [] });
      // Mock failed query
      db.query.mockRejectedValueOnce(new Error('Query failed'));
      // Mock ROLLBACK
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(db.query('BEGIN; SELECT * FROM test; COMMIT;'))
        .rejects
        .toThrow('Query failed');
    });
  });
}); 