const db = require('../../config/database');

describe('Inventory and Order Management', () => {
  let menuItemId;
  let inventoryId;
  let orderId;

  beforeAll(async () => {
    // Create test menu item
    const menuResult = await db.query(
      `INSERT INTO menu_items (name, description, price, category)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Test Inventory Item', 'Test inventory tracking item', 12.99, 'Fresh Produce']
    );
    menuItemId = menuResult.rows[0].id;
  });

  describe('Inventory Management', () => {
    test('should create inventory record', async () => {
      const result = await db.query(
        `INSERT INTO inventory (
          item_id, quantity, unit, min_threshold, max_threshold,
          reorder_point, location, status, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          menuItemId,
          100,
          'units',
          20,
          200,
          50,
          'Main Storage',
          'in_stock',
          new Date()
        ]
      );
      inventoryId = result.rows[0].id;
      expect(inventoryId).toBeDefined();
    });

    test('should update inventory quantity', async () => {
      const result = await db.query(
        `UPDATE inventory
         SET quantity = quantity - 10,
             last_updated = $1
         WHERE id = $2
         RETURNING quantity`,
        [new Date(), inventoryId]
      );
      expect(result.rows[0].quantity).toBe(90);
    });

    test('should track inventory movements', async () => {
      const result = await db.query(
        `INSERT INTO inventory_movements (
          inventory_id, movement_type, quantity, reason,
          reference_id, notes, movement_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          inventoryId,
          'deduction',
          10,
          'sale',
          null,
          'Test inventory movement',
          new Date()
        ]
      );
      expect(result.rows[0].id).toBeDefined();
    });

    test('should calculate inventory metrics', async () => {
      const result = await db.query(
        `SELECT 
          i.item_id,
          mi.name,
          i.quantity,
          COUNT(im.id) as movement_count,
          SUM(CASE WHEN im.movement_type = 'addition' THEN im.quantity ELSE 0 END) as total_additions,
          SUM(CASE WHEN im.movement_type = 'deduction' THEN im.quantity ELSE 0 END) as total_deductions
         FROM inventory i
         JOIN menu_items mi ON i.item_id = mi.id
         LEFT JOIN inventory_movements im ON i.id = im.inventory_id
         WHERE i.id = $1
         GROUP BY i.item_id, mi.name, i.quantity`,
        [inventoryId]
      );
      
      expect(result.rows[0]).toMatchObject({
        quantity: 90,
        movement_count: '1',
        total_deductions: '10'
      });
    });
  });

  describe('Order Management', () => {
    test('should create customer order', async () => {
      const result = await db.query(
        `INSERT INTO orders (
          customer_id, status, total_amount, order_date,
          special_instructions, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          1, // Assuming customer_id 1 exists
          'pending',
          25.98,
          new Date(),
          'Test order instructions',
          'pending'
        ]
      );
      orderId = result.rows[0].id;
      expect(orderId).toBeDefined();
    });

    test('should add order items', async () => {
      const result = await db.query(
        `INSERT INTO order_items (
          order_id, item_id, quantity, unit_price,
          subtotal, notes
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          orderId,
          menuItemId,
          2,
          12.99,
          25.98,
          'Test order item'
        ]
      );
      expect(result.rows[0].id).toBeDefined();
    });

    test('should update order status', async () => {
      const result = await db.query(
        `UPDATE orders
         SET status = $1,
             payment_status = $2,
             updated_at = $3
         WHERE id = $4
         RETURNING status, payment_status`,
        ['completed', 'paid', new Date(), orderId]
      );
      
      expect(result.rows[0]).toMatchObject({
        status: 'completed',
        payment_status: 'paid'
      });
    });

    test('should calculate order analytics', async () => {
      const result = await db.query(
        `SELECT 
          COUNT(*) as total_orders,
          SUM(total_amount) as total_revenue,
          AVG(total_amount) as avg_order_value
         FROM orders
         WHERE id = $1`,
        [orderId]
      );
      
      expect(parseInt(result.rows[0].total_orders)).toBe(1);
      expect(parseFloat(result.rows[0].total_revenue)).toBe(25.98);
    });
  });

  describe('Inventory-Order Integration', () => {
    test('should update inventory after order completion', async () => {
      // First get order items
      const orderItems = await db.query(
        `SELECT item_id, quantity
         FROM order_items
         WHERE order_id = $1`,
        [orderId]
      );
      
      // Update inventory for each item
      for (const item of orderItems.rows) {
        await db.query(
          `UPDATE inventory
           SET quantity = quantity - $1,
               last_updated = $2
           WHERE item_id = $3`,
          [item.quantity, new Date(), item.item_id]
        );
      }

      // Verify inventory update
      const result = await db.query(
        `SELECT quantity
         FROM inventory
         WHERE id = $1`,
        [inventoryId]
      );
      
      expect(result.rows[0].quantity).toBe(88); // 90 - 2
    });

    test('should track order-related inventory movements', async () => {
      const result = await db.query(
        `INSERT INTO inventory_movements (
          inventory_id, movement_type, quantity,
          reason, reference_id, notes
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          inventoryId,
          'deduction',
          2,
          'order_fulfillment',
          orderId,
          'Order completion inventory adjustment'
        ]
      );
      expect(result.rows[0].id).toBeDefined();
    });
  });

  afterAll(async () => {
    // Clean up test data
    await db.query('DELETE FROM inventory_movements WHERE inventory_id = $1', [inventoryId]);
    await db.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
    await db.query('DELETE FROM orders WHERE id = $1', [orderId]);
    await db.query('DELETE FROM inventory WHERE id = $1', [inventoryId]);
    await db.query('DELETE FROM menu_items WHERE id = $1', [menuItemId]);
  });
}); 