-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Allow public read access (SELECT)
CREATE POLICY "Allow public read access"
  ON locations
  FOR SELECT
  TO public
  USING (true);

-- Create RLS policy: Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create RLS policy: Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update"
  ON locations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policy: Allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete"
  ON locations
  FOR DELETE
  TO authenticated
  USING (true);
