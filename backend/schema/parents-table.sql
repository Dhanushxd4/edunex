-- ============================================================
-- Parents table for parent portal login
-- ============================================================

CREATE TABLE IF NOT EXISTS parents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     uuid NOT NULL,
  student_id    uuid,                        -- linked student (can be null until matched)
  name          text NOT NULL DEFAULT '',
  phone         text NOT NULL,               -- used as login identifier
  email         text NOT NULL DEFAULT '',
  password_hash text NOT NULL,
  status        text NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_parents_school  ON parents (school_id);
CREATE INDEX IF NOT EXISTS idx_parents_phone   ON parents (phone);
CREATE INDEX IF NOT EXISTS idx_parents_student ON parents (student_id);
