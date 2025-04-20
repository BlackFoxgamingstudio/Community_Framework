const db = require('../../config/database');

describe('Farm and Menu Relationships', () => {
  let menuItemId;
  let farmDataId;

  beforeAll(async () => {
    // Clean up existing test data
    await db.query('DELETE FROM farm_data WHERE notes LIKE \'%test%\'');
    
    // Create test menu item
    const menuResult = await db.query(
      `INSERT INTO menu_items (name, description, price, category)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Test Farm Item', 'Test farm to table item', 14.99, 'Farm Fresh']
    );
    menuItemId = menuResult.rows[0].id;
  });

  describe('Farm Data and Menu Items', () => {
    test('should create farm data linked to menu item', async () => {
      const result = await db.query(
        `INSERT INTO farm_data (
          farm_id, crop_type, yield_amount, planting_date, area_sqft,
          resource_usage, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          menuItemId,
          'Test Crop',
          100.5,
          '2024-03-15',
          500,
          JSON.stringify({ water: '50gal', fertilizer: '10kg' }),
          'Test farm data entry'
        ]
      );
      farmDataId = result.rows[0].id;
      expect(farmDataId).toBeDefined();
    });

    test('should enforce foreign key constraint with menu items', async () => {
      await expect(
        db.query(
          `INSERT INTO farm_data (
            farm_id, crop_type, yield_amount, planting_date, area_sqft
          ) VALUES ($1, $2, $3, $4, $5)`,
          [99999, 'Invalid Crop', 50, '2024-03-15', 200]
        )
      ).rejects.toThrow();
    });

    test('should retrieve farm data with menu item details', async () => {
      const result = await db.query(
        `SELECT fd.*, mi.name as menu_item_name, mi.category
         FROM farm_data fd
         JOIN menu_items mi ON fd.farm_id = mi.id
         WHERE fd.id = $1`,
        [farmDataId]
      );
      
      expect(result.rows[0]).toMatchObject({
        crop_type: 'Test Crop',
        menu_item_name: 'Test Farm Item',
        category: 'Farm Fresh'
      });
    });

    test('should calculate total yield by menu item', async () => {
      const result = await db.query(
        `SELECT 
          mi.name,
          SUM(fd.yield_amount) as total_yield,
          COUNT(*) as harvest_count
         FROM farm_data fd
         JOIN menu_items mi ON fd.farm_id = mi.id
         WHERE mi.id = $1
         GROUP BY mi.id, mi.name`,
        [menuItemId]
      );
      
      expect(result.rows[0].total_yield).toBe('100.5');
      expect(parseInt(result.rows[0].harvest_count)).toBe(1);
    });
  });

  describe('Resource Usage Analytics', () => {
    test('should track resource metrics for menu items', async () => {
      const result = await db.query(
        `INSERT INTO resource_metrics (
          farm_id, metric_type, value, unit, recorded_date, notes
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [menuItemId, 'water', 75.5, 'gallons', '2024-03-15', 'Test resource tracking']
      );
      expect(result.rows[0].id).toBeDefined();
    });

    test('should calculate resource efficiency by menu item', async () => {
      const result = await db.query(
        `SELECT 
          mi.name,
          rm.metric_type,
          AVG(rm.value) as avg_usage,
          SUM(rm.value) as total_usage
         FROM resource_metrics rm
         JOIN menu_items mi ON rm.farm_id = mi.id
         WHERE mi.id = $1
         GROUP BY mi.id, mi.name, rm.metric_type`,
        [menuItemId]
      );
      
      expect(result.rows[0]).toMatchObject({
        name: 'Test Farm Item',
        metric_type: 'water',
        avg_usage: '75.5'
      });
    });
  });

  describe('Sustainability Metrics', () => {
    test('should record sustainability metrics for farm items', async () => {
      const result = await db.query(
        `INSERT INTO sustainability_metrics (
          metric_type, value, unit, measurement_date, category, notes
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          'carbon_footprint',
          25.5,
          'kg_co2',
          '2024-03-15',
          'Farm Production',
          'Test sustainability metric'
        ]
      );
      expect(result.rows[0].id).toBeDefined();
    });

    test('should analyze sustainability trends', async () => {
      const result = await db.query(
        `SELECT 
          metric_type,
          category,
          AVG(value) as avg_value,
          MIN(value) as min_value,
          MAX(value) as max_value
         FROM sustainability_metrics
         WHERE category = $1
         GROUP BY metric_type, category`,
        ['Farm Production']
      );
      
      expect(result.rows[0]).toMatchObject({
        metric_type: 'carbon_footprint',
        category: 'Farm Production',
        avg_value: '25.5'
      });
    });
  });

  afterAll(async () => {
    // Clean up test data
    await db.query('DELETE FROM resource_metrics WHERE farm_id = $1', [menuItemId]);
    await db.query('DELETE FROM farm_data WHERE id = $1', [farmDataId]);
    await db.query('DELETE FROM sustainability_metrics WHERE notes LIKE \'%test%\'');
    await db.query('DELETE FROM menu_items WHERE id = $1', [menuItemId]);
  });
}); 