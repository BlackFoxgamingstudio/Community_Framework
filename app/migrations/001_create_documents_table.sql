-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    pdf_url TEXT NOT NULL,
    thumbnail_url TEXT,
    extracted_text TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    CONSTRAINT valid_type CHECK (type IN ('research', 'guides', 'historical'))
);

-- Create index for search
CREATE INDEX idx_documents_search ON documents USING GIN (
    to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(extracted_text, ''))
);

-- Create index for type filtering
CREATE INDEX idx_documents_type ON documents(type);

-- Create index for upload date
CREATE INDEX idx_documents_upload_date ON documents(upload_date DESC);

-- Add trigger to update last_modified timestamp
CREATE OR REPLACE FUNCTION update_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_last_modified
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified(); 