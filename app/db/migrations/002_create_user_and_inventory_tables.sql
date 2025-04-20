-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_permissions table
CREATE TABLE user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  permission_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_categories table
CREATE TABLE inventory_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_items table
CREATE TABLE inventory_items (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES inventory_categories(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sku VARCHAR(50) UNIQUE,
  quantity INT NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  min_quantity INT DEFAULT 0,
  max_quantity INT,
  reorder_point INT,
  cost_per_unit DECIMAL(10,2),
  location VARCHAR(100),
  supplier VARCHAR(100),
  last_ordered_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_transactions table
CREATE TABLE inventory_transactions (
  id SERIAL PRIMARY KEY,
  item_id INT REFERENCES inventory_items(id),
  transaction_type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment'
  quantity INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  unit_price DECIMAL(10,2),
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT REFERENCES users(id),
  notes TEXT,
  reference_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_suppliers table
CREATE TABLE inventory_suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  payment_terms VARCHAR(100),
  lead_time_days INT,
  minimum_order DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_transactions_item ON inventory_transactions(item_id);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_suppliers_name ON inventory_suppliers(name);

-- Add test data
INSERT INTO users (username, email, password_hash, first_name, last_name, role)
VALUES 
  ('admin', 'admin@rawfuelfoods.com', '$2b$10$xxxxxxxxxxx', 'Admin', 'User', 'admin'),
  ('manager', 'manager@rawfuelfoods.com', '$2b$10$xxxxxxxxxxx', 'Manager', 'User', 'manager');

INSERT INTO inventory_categories (name, description)
VALUES 
  ('Seeds', 'Various types of seeds for planting'),
  ('Tools', 'Farming and gardening tools'),
  ('Supplies', 'General farming supplies');

INSERT INTO inventory_items (category_id, name, sku, quantity, unit, min_quantity, max_quantity)
VALUES 
  (1, 'Tomato Seeds', 'SEED-TOM-001', 100, 'packets', 20, 200),
  (1, 'Lettuce Seeds', 'SEED-LET-001', 150, 'packets', 30, 300),
  (2, 'Garden Shovel', 'TOOL-SHV-001', 10, 'units', 5, 20); 