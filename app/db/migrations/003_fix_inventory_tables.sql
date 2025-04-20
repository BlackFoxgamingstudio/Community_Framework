-- Drop existing tables if they exist
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;

-- Create menu_items table
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory table
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 0,
  max_quantity INTEGER,
  unit_cost NUMERIC(10,2),
  last_restock_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_movements table
CREATE TABLE inventory_movements (
  id SERIAL PRIMARY KEY,
  inventory_id INTEGER NOT NULL REFERENCES inventory(id),
  quantity_change INTEGER NOT NULL,
  movement_type VARCHAR(50) NOT NULL,
  reference_id INTEGER,
  reference_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add some test data
INSERT INTO menu_items (name, description, price, category) VALUES
  ('Organic Tomatoes', 'Fresh organic tomatoes', 3.99, 'Produce'),
  ('Mixed Greens', 'Fresh mixed salad greens', 4.99, 'Produce'),
  ('Quinoa', 'Organic quinoa', 6.99, 'Grains');

-- Add initial inventory
INSERT INTO inventory (menu_item_id, quantity, min_quantity, max_quantity, unit_cost) VALUES
  (1, 100, 20, 200, 2.50),
  (2, 50, 10, 100, 3.00),
  (3, 75, 15, 150, 4.50); 