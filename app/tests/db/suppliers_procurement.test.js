const db = require('../../config/database');

describe('Supplier and Procurement Management', () => {
  let supplierId;
  let purchaseOrderId;
  let itemId;

  describe('Supplier Management', () => {
    test('should create supplier record', async () => {
      const result = await db.query(
        `INSERT INTO suppliers (
          name, contact_person, email, phone,
          address, status, rating, preferred,
          payment_terms, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [
          'Test Farm Supplier',
          'John Doe',
          'john@testfarm.com',
          '555-0123',
          '123 Farm Road',
          'active',
          4.5,
          true,
          'net 30',
          'Test supplier record'
        ]
      );
      supplierId = result.rows[0].id;
      expect(supplierId).toBeDefined();
    });

    test('should update supplier information', async () => {
      const result = await db.query(
        `UPDATE suppliers
         SET rating = $1,
             notes = $2,
             updated_at = $3
         WHERE id = $4
         RETURNING rating, notes`,
        [4.8, 'Updated supplier notes', new Date(), supplierId]
      );
      
      expect(result.rows[0]).toMatchObject({
        rating: 4.8,
        notes: 'Updated supplier notes'
      });
    });

    test('should track supplier performance metrics', async () => {
      const result = await db.query(
        `INSERT INTO supplier_metrics (
          supplier_id, metric_type, value,
          measurement_date, notes
        ) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          supplierId,
          'delivery_time',
          2.5,
          new Date(),
          'Average delivery time in days'
        ]
      );
      expect(result.rows[0].id).toBeDefined();
    });
  });

  describe('Procurement Management', () => {
    beforeAll(async () => {
      // Create test item for procurement
      const itemResult = await db.query(
        `INSERT INTO procurement_items (
          name, category, unit, specifications,
          supplier_id
        ) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          'Organic Tomatoes',
          'Produce',
          'kg',
          'Fresh, organic, locally sourced',
          supplierId
        ]
      );
      itemId = itemResult.rows[0].id;
    });

    test('should create purchase order', async () => {
      const result = await db.query(
        `INSERT INTO purchase_orders (
          supplier_id, status, total_amount,
          order_date, expected_delivery,
          payment_status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          supplierId,
          'pending',
          500.00,
          new Date(),
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          'unpaid',
          'Test purchase order'
        ]
      );
      purchaseOrderId = result.rows[0].id;
      expect(purchaseOrderId).toBeDefined();
    });

    test('should add items to purchase order', async () => {
      const result = await db.query(
        `INSERT INTO purchase_order_items (
          po_id, item_id, quantity,
          unit_price, subtotal, notes
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          purchaseOrderId,
          itemId,
          100,
          5.00,
          500.00,
          'Test PO item'
        ]
      );
      expect(result.rows[0].id).toBeDefined();
    });

    test('should update purchase order status', async () => {
      const result = await db.query(
        `UPDATE purchase_orders
         SET status = $1,
             payment_status = $2,
             updated_at = $3
         WHERE id = $4
         RETURNING status, payment_status`,
        ['received', 'paid', new Date(), purchaseOrderId]
      );
      
      expect(result.rows[0]).toMatchObject({
        status: 'received',
        payment_status: 'paid'
      });
    });

    test('should calculate procurement analytics', async () => {
      const result = await db.query(
        `SELECT 
          COUNT(*) as total_orders,
          SUM(total_amount) as total_spend,
          AVG(total_amount) as avg_order_value
         FROM purchase_orders
         WHERE supplier_id = $1`,
        [supplierId]
      );
      
      expect(parseInt(result.rows[0].total_orders)).toBe(1);
      expect(parseFloat(result.rows[0].total_spend)).toBe(500.00);
    });
  });

  describe('Supplier-Inventory Integration', () => {
    test('should update inventory on purchase order receipt', async () => {
      // Get PO items
      const poItems = await db.query(
        `SELECT item_id, quantity
         FROM purchase_order_items
         WHERE po_id = $1`,
        [purchaseOrderId]
      );
      
      // Create inventory movement record
      const result = await db.query(
        `INSERT INTO inventory_movements (
          inventory_id, movement_type, quantity,
          reason, reference_id, notes
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          itemId,
          'addition',
          poItems.rows[0].quantity,
          'purchase_order_receipt',
          purchaseOrderId,
          'PO receipt inventory adjustment'
        ]
      );
      expect(result.rows[0].id).toBeDefined();
    });

    test('should track supplier quality metrics', async () => {
      const result = await db.query(
        `INSERT INTO supplier_metrics (
          supplier_id, metric_type, value,
          measurement_date, notes
        ) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          supplierId,
          'quality_score',
          95,
          new Date(),
          'Product quality assessment'
        ]
      );
      expect(result.rows[0].id).toBeDefined();
    });
  });

  afterAll(async () => {
    // Clean up test data
    await db.query('DELETE FROM supplier_metrics WHERE supplier_id = $1', [supplierId]);
    await db.query('DELETE FROM inventory_movements WHERE reference_id = $1', [purchaseOrderId]);
    await db.query('DELETE FROM purchase_order_items WHERE po_id = $1', [purchaseOrderId]);
    await db.query('DELETE FROM purchase_orders WHERE id = $1', [purchaseOrderId]);
    await db.query('DELETE FROM procurement_items WHERE id = $1', [itemId]);
    await db.query('DELETE FROM suppliers WHERE id = $1', [supplierId]);
  });
}); 