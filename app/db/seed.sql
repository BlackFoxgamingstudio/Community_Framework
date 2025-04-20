-- Insert menu items
INSERT INTO menu_items (label, url, display_order) VALUES
  ('About & Contact', '/about.html', 1),
  ('Farms', '/farm.html', 2),
  ('Eat & Drink', '/food.html', 3),
  ('Health/Wellness', '/health.html', 4),
  ('Data Hub', '/data-hub.html', 5),
  ('Communications', '/communications.html', 6),
  ('Networks', '/networks.html', 7),
  ('Blog', '/blog.html', 8),
  ('Outdoors RX', '/outdoors-rx.html', 9),
  ('Events', '/events.html', 10);

-- Insert sample pages
INSERT INTO pages (slug, title) VALUES
  ('about', 'About Us'),
  ('farm', 'Our Farms'),
  ('food', 'Eat & Drink'),
  ('health', 'Health & Wellness'),
  ('data-hub', 'Data Hub'),
  ('communications', 'Communications'),
  ('networks', 'Networks'),
  ('outdoors-rx', 'Outdoors RX');

-- Insert sample page sections
INSERT INTO page_sections (page_id, heading, content, section_order) VALUES
  (1, 'Our Mission', 'RawFuelFoods is dedicated to promoting plant-based nutrition and sustainable urban farming...', 1),
  (1, 'Our Story', 'Founded with a vision to transform urban spaces into productive food gardens...', 2),
  (2, 'Urban Farming', 'Our network of urban farms produces fresh, organic produce for local communities...', 1),
  (2, 'Sustainable Practices', 'We implement cutting-edge sustainable farming practices...', 2);

-- Insert sample events
INSERT INTO events (title, event_date, description, link) VALUES
  ('Urban Farming Workshop', CURRENT_DATE + INTERVAL '7 days', 'Learn the basics of urban farming in this hands-on workshop.', '/workshops/urban-farming'),
  ('Plant-Based Cooking Class', CURRENT_DATE + INTERVAL '14 days', 'Join our chef for a cooking class featuring seasonal produce.', '/classes/cooking'),
  ('Community Garden Day', CURRENT_DATE + INTERVAL '21 days', 'Help us maintain our community gardens and learn about sustainable practices.', '/events/garden-day');

-- Insert sample blog posts
INSERT INTO blog_posts (slug, title, excerpt, content, published_at) VALUES
  ('benefits-of-urban-farming', 
   'The Benefits of Urban Farming',
   'Discover how urban farming is transforming cities and communities.',
   'Urban farming has numerous benefits for communities and individuals alike...',
   CURRENT_TIMESTAMP - INTERVAL '7 days'),
  ('seasonal-eating-guide',
   'Your Guide to Seasonal Eating',
   'Learn why eating seasonally is better for you and the environment.',
   'Eating seasonally means consuming produce that is naturally ready for harvest...',
   CURRENT_TIMESTAMP - INTERVAL '14 days'),
  ('sustainable-farming-practices',
   'Sustainable Farming Practices for Urban Gardens',
   'Implement these sustainable practices in your urban garden.',
   'Sustainable farming practices are essential for maintaining healthy urban gardens...',
   CURRENT_TIMESTAMP - INTERVAL '21 days'); 