-- Create farm_data table
CREATE TABLE farm_data (
  id SERIAL PRIMARY KEY,
  farm_id INT REFERENCES menu_items(id),
  crop_type VARCHAR(100) NOT NULL,
  yield_amount DECIMAL(10,2) NOT NULL,
  planting_date DATE NOT NULL,
  harvest_date DATE,
  area_sqft DECIMAL(10,2),
  resource_usage JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create resource_metrics table
CREATE TABLE resource_metrics (
  id SERIAL PRIMARY KEY,
  farm_id INT REFERENCES menu_items(id),
  metric_type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  recorded_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create community_impact table
CREATE TABLE community_impact (
  id SERIAL PRIMARY KEY,
  program_type VARCHAR(100) NOT NULL,
  participant_count INT NOT NULL,
  impact_metrics JSONB,
  event_date DATE NOT NULL,
  location VARCHAR(200),
  feedback_score DECIMAL(3,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sustainability_metrics table
CREATE TABLE sustainability_metrics (
  id SERIAL PRIMARY KEY,
  metric_type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  measurement_date DATE NOT NULL,
  category VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create data_visualizations table
CREATE TABLE data_visualizations (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  chart_type VARCHAR(50) NOT NULL,
  data_source VARCHAR(100) NOT NULL,
  configuration JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) NOT NULL,
  content JSONB,
  author VARCHAR(100),
  published_date DATE,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX idx_farm_data_farm_id ON farm_data(farm_id);
CREATE INDEX idx_farm_data_crop_type ON farm_data(crop_type);
CREATE INDEX idx_resource_metrics_farm_id ON resource_metrics(farm_id);
CREATE INDEX idx_resource_metrics_type ON resource_metrics(metric_type);
CREATE INDEX idx_community_impact_date ON community_impact(event_date);
CREATE INDEX idx_sustainability_metrics_type ON sustainability_metrics(metric_type);
CREATE INDEX idx_data_visualizations_type ON data_visualizations(chart_type);
CREATE INDEX idx_reports_type ON reports(report_type); 