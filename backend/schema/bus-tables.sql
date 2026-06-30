-- ============================================================
-- Bus Tracking Tables — run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS bus_routes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     uuid NOT NULL,
  number        text NOT NULL,
  driver        text NOT NULL DEFAULT '',
  driver_phone  text NOT NULL DEFAULT '',
  stops         text[] NOT NULL DEFAULT '{}',
  status        text NOT NULL DEFAULT 'active',
  maps_link     text DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bus_locations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id   uuid NOT NULL UNIQUE,
  school_id  uuid NOT NULL,
  lat        float8 NOT NULL,
  lng        float8 NOT NULL,
  speed      float8 NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bus_routes_school    ON bus_routes (school_id);
CREATE INDEX IF NOT EXISTS idx_bus_locations_school ON bus_locations (school_id);
CREATE INDEX IF NOT EXISTS idx_bus_locations_route  ON bus_locations (route_id);
