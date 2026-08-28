-- EcoPadi UK Limited — database schema (PostgreSQL)
-- Run this once against your Render Postgres instance (or local Postgres) before seeding.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer',      -- 'customer' | 'admin'
  is_vip BOOLEAN NOT NULL DEFAULT FALSE,
  vip_since TIMESTAMPTZ,
  reward_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United Kingdom',
  is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,                     -- Spices & Seasoning | Grains & Rice | Proteins & Meats | Pantry Essentials | Fresh Produce | Traditional Snacks
  description TEXT,
  price_pence INTEGER NOT NULL,               -- store money as integer pence to avoid float errors
  compare_at_price_pence INTEGER,
  image_url TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  availability TEXT NOT NULL DEFAULT 'in_stock',  -- 'in_stock' | 'out_of_stock' | 'preorder'
  availability_note TEXT,                          -- optional admin message, e.g. "Back in stock Friday" or "Ships in 2 weeks"
  is_placeholder BOOLEAN NOT NULL DEFAULT TRUE, -- flags demo/seed data so it's obvious what to replace
  nutrition JSONB,                             -- { basis: "Per 100g", items: [{ label, value }] } — shown on the product page
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adds the nutrition column to a products table that already existed before
-- this feature was added — safe and idempotent to run on any database.
ALTER TABLE products ADD COLUMN IF NOT EXISTS nutrition JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS availability TEXT NOT NULL DEFAULT 'in_stock';
ALTER TABLE products ADD COLUMN IF NOT EXISTS availability_note TEXT;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_availability_check;
ALTER TABLE products ADD CONSTRAINT products_availability_check
  CHECK (availability IN ('in_stock', 'out_of_stock', 'preorder'));

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  external_id TEXT,                          -- Cloudinary public_id, needed to delete the file later
  is_thumbnail BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE product_images ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Video support has been removed. Any previously uploaded videos are dropped
-- here — they were stored on the backend's local disk anyway, which Render
-- wipes on every redeploy, so these rows were already pointing at dead files.
-- Guarded so this is a no-op on a fresh database that never had video support.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_images' AND column_name = 'media_type') THEN
    DELETE FROM product_images WHERE media_type = 'video';
  END IF;
END $$;
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_media_type_check;
ALTER TABLE product_images DROP COLUMN IF EXISTS media_type;

-- Clean up any remaining image rows saved under the old local-disk storage
-- (path starting with /uploads/) — those files no longer exist after a
-- Render redeploy, so the URLs are permanently broken. Products will need
-- their photos re-uploaded once, after which Cloudinary keeps them for good.
UPDATE products SET image_url = NULL WHERE image_url LIKE '/uploads/%';
DELETE FROM product_images WHERE url LIKE '/uploads/%';

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                          -- e.g. "Size", "Weight"
  value TEXT NOT NULL,                         -- e.g. "500g", "1kg"
  price_delta_pence INTEGER NOT NULL DEFAULT 0,
  sku_suffix TEXT
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,                          -- 'percent' | 'fixed'
  value INTEGER NOT NULL,                      -- percent (0-100) or pence
  min_spend_pence INTEGER DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  usage_limit INTEGER,
  times_used INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,   -- null for guest checkout
  guest_email TEXT,
  guest_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',      -- pending | paid | processing | shipped | delivered | cancelled | refunded
  payment_method TEXT NOT NULL,                -- 'stripe' | 'paypal' | 'bank_transfer'
  payment_reference TEXT,
  subtotal_pence INTEGER NOT NULL,
  discount_pence INTEGER NOT NULL DEFAULT 0,
  discount_code TEXT,
  delivery_fee_pence INTEGER NOT NULL DEFAULT 0,
  total_pence INTEGER NOT NULL,
  delivery_address JSONB NOT NULL,
  delivery_country TEXT NOT NULL DEFAULT 'United Kingdom', -- UK | Ireland
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,                  -- snapshot at time of order
  variant_label TEXT,
  unit_price_pence INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  line_total_pence INTEGER NOT NULL
);

-- Upgrades an order_items table created before this fix — a product that's
-- been ordered can now be deleted without breaking existing order history,
-- since product_name/price were already saved as a snapshot at order time.
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);
