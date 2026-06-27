-- ============================================================
-- Edunex Performance Indexes
-- Run once in Supabase SQL editor:
--   Dashboard → SQL Editor → paste → Run
-- ============================================================

-- Students: most queries filter by school_id then cls/search
CREATE INDEX IF NOT EXISTS idx_students_school_id     ON students (school_id);
CREATE INDEX IF NOT EXISTS idx_students_school_cls     ON students (school_id, cls);
CREATE INDEX IF NOT EXISTS idx_students_fee_status     ON students (school_id, fee_status);
CREATE INDEX IF NOT EXISTS idx_students_absent         ON students (school_id, absent) WHERE absent = true;
CREATE INDEX IF NOT EXISTS idx_students_name_search    ON students USING gin (name gin_trgm_ops);

-- Teachers: filter by school_id
CREATE INDEX IF NOT EXISTS idx_teachers_school_id     ON teachers (school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_status        ON teachers (school_id, status);

-- Fees: filter by school_id and student_id
CREATE INDEX IF NOT EXISTS idx_fees_school_id         ON fees (school_id);
CREATE INDEX IF NOT EXISTS idx_fees_student_id        ON fees (student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status            ON fees (school_id, status);

-- Enquiries: filter by school_id
CREATE INDEX IF NOT EXISTS idx_enquiries_school_id    ON enquiries (school_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at   ON enquiries (school_id, created_at DESC);

-- Schools: filter by status (super admin queries)
CREATE INDEX IF NOT EXISTS idx_schools_status         ON schools (status);

-- Enable pg_trgm for fuzzy name search (needed for gin_trgm_ops above)
-- Run this first if not already enabled:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
