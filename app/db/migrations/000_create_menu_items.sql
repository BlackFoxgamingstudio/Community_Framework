-- Create menu_items table
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add test data
INSERT INTO menu_items (name, description, price, category)
VALUES 
  ('Farm Fresh Salad', 'Mixed greens from our urban farm', 12.99, 'Salads'),
  ('Seasonal Vegetables', 'Locally grown seasonal vegetables', 8.99, 'Sides'),
  ('Urban Farm Bowl', 'Fresh bowl with farm ingredients', 15.99, 'Mains'); 