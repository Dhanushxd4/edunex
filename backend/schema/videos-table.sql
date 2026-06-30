-- ============================================================
-- Videos Table — AI avatar videos via D-ID
-- ============================================================
CREATE TABLE IF NOT EXISTS videos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    uuid NOT NULL,
  title        text NOT NULL,
  script       text NOT NULL DEFAULT '',
  presenter    text NOT NULL DEFAULT 'amy',
  did_id       text NOT NULL DEFAULT '',
  status       text NOT NULL DEFAULT 'processing',  -- processing | done | error
  video_url    text DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_videos_school ON videos (school_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos (status);
