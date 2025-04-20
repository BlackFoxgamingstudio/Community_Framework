const db = require('../../config/database');

describe('Database Tables', () => {
  // Test data
  let userId;
  let categoryId;
  let itemId;
  let supplierId;

  beforeAll(async () => {
    // Clean up any existing test data
    await db.query('DELETE FROM inventory_transactions');
    await db.query('DELETE FROM user_permissions');
    await db.query('DELETE FROM inventory_items');
    await db.query('DELETE FROM inventory_categories');
    await db.query('DELETE FROM inventory_suppliers');
    await db.query('DELETE FROM users WHERE username LIKE \'test%\'');
  });

  describe('User Management Tables', () => {
    test('should create a user', async () => {
      const result = await db.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        ['testuser', 'test@example.com', 'hash', 'Test', 'User', 'user']
      );
      userId = result.rows[0].id;
      expect(userId).toBeDefined();
    });

    test('should enforce unique username constraint', async () => {
      await expect(
        db.query(
          `INSERT INTO users (username, email, password_hash)
           VALUES ($1, $2, $3)`,
          ['testuser', 'another@example.com', 'hash']
        )
      ).rejects.toThrow();
    });

    test('should add user permissions', async () => {
      const result = await db.query(
        `INSERT INTO user_permissions (user_id, permission_name)
         VALUES ($1, $2) RETURNING id`,
        [userId, 'manage_inventory']
      );
      expect(result.rows[0].id).toBeDefined();
    });
  });

  describe('Inventory Management Tables', () => {
    test('should create inventory category', async () => {
      const result = await db.query(
        `INSERT INTO inventory_categories (name, description)
         VALUES ($1, $2) RETURNING id`,
        ['Test Category', 'Test Description']
      );
      categoryId = result.rows[0].id;
      expect(categoryId).toBeDefined();
    });

    test('should create inventory item', async () => {
      const result = await db.query(
        `INSERT INTO inventory_items (
           category_id, name, sku, quantity, unit, min_quantity, max_quantity
         ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [categoryId, 'Test Item', 'TEST-001', 100, 'units', 10, 200]
      );
      itemId = result.rows[0].id;
      expect(itemId).toBeDefined();
    });

    test('should enforce unique SKU constraint', async () => {
      await expect(
        db.query(
          `INSERT INTO inventory_items (
             category_id, name, sku, quantity, unit
           ) VALUES ($1, $2, $3, $4, $5)`,
          [categoryId, 'Another Item', 'TEST-001', 50, 'units']
        )
      ).rejects.toThrow();
    });

    test('should create inventory supplier', async () => {
      const result = await db.query(
        `INSERT INTO inventory_suppliers (
           name, contact_person, email, phone
         ) VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Test Supplier', 'John Doe', 'supplier@example.com', '1234567890']
      );
      supplierId = result.rows[0].id;
      expect(supplierId).toBeDefined();
    });

    test('should record inventory transaction', async () => {
      const result = await db.query(
        `INSERT INTO inventory_transactions (
           item_id, transaction_type, quantity, previous_quantity, new_quantity,
           unit_price, user_id, reference_number
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [itemId, 'in', 50, 100, 150, 10.99, userId, 'REF-001']
      );
      expect(result.rows[0].id).toBeDefined();
    });
  });

  describe('Table Relationships', () => {
    test('should cascade delete user permissions when user is deleted', async () => {
      await db.query('DELETE FROM users WHERE id = $1', [userId]);
      const result = await db.query(
        'SELECT COUNT(*) FROM user_permissions WHERE user_id = $1',
        [userId]
      );
      expect(parseInt(result.rows[0].count)).toBe(0);
    });

    test('should enforce foreign key constraint on inventory items', async () => {
      await expect(
        db.query(
          `INSERT INTO inventory_items (
             category_id, name, sku, quantity, unit
           ) VALUES ($1, $2, $3, $4, $5)`,
          [99999, 'Invalid Item', 'INV-001', 100, 'units']
        )
      ).rejects.toThrow();
    });

    test('should enforce foreign key constraint on inventory transactions', async () => {
      await expect(
        db.query(
          `INSERT INTO inventory_transactions (
             item_id, transaction_type, quantity, previous_quantity, new_quantity
           ) VALUES ($1, $2, $3, $4, $5)`,
          [99999, 'in', 50, 100, 150]
        )
      ).rejects.toThrow();
    });
  });

  describe('Data Integrity', () => {
    test('should enforce NOT NULL constraints', async () => {
      await expect(
        db.query(
          'INSERT INTO users (username) VALUES ($1)',
          ['incomplete_user']
        )
      ).rejects.toThrow();

      await expect(
        db.query(
          'INSERT INTO inventory_items (name) VALUES ($1)',
          ['incomplete_item']
        )
      ).rejects.toThrow();
    });

    test('should set default values', async () => {
      const result = await db.query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3) RETURNING role, is_active`,
        ['testuser2', 'test2@example.com', 'hash']
      );
      expect(result.rows[0].role).toBe('user');
      expect(result.rows[0].is_active).toBe(true);
    });

    test('should update timestamps', async () => {
      const result = await db.query(
        `INSERT INTO inventory_items (
           category_id, name, sku, quantity, unit
         ) VALUES ($1, $2, $3, $4, $5)
         RETURNING created_at, updated_at`,
        [categoryId, 'Timestamp Test', 'TIME-001', 100, 'units']
      );
      expect(result.rows[0].created_at).toBeDefined();
      expect(result.rows[0].updated_at).toBeDefined();
    });
  });

  afterAll(async () => {
    // Clean up test data
    await db.query('DELETE FROM inventory_transactions');
    await db.query('DELETE FROM user_permissions');
    await db.query('DELETE FROM inventory_items');
    await db.query('DELETE FROM inventory_categories');
    await db.query('DELETE FROM inventory_suppliers');
    await db.query('DELETE FROM users WHERE username LIKE \'test%\'');
  });
}); 