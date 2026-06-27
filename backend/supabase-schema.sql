-- ============================================================
-- EDUNEX DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor once
-- ============================================================

-- Schools
create table if not exists schools (
  id              text primary key default gen_random_uuid()::text,
  name            text not null,
  email           text not null unique,
  password_hash   text not null,
  principal       text not null,
  city            text default '',
  state           text default 'Telangana',
  phone           text default '',
  board           text default 'CBSE',
  medium          text default 'English',
  plan            text default 'starter' check (plan in ('starter','professional','elite')),
  status          text default 'trial'   check (status in ('active','inactive','trial')),
  twilio_number   text,
  call_duration   int  default 60,
  student_count   int  default 0,
  joined          timestamptz default now()
);

-- Students
create table if not exists students (
  id            text primary key default gen_random_uuid()::text,
  school_id     text not null references schools(id) on delete cascade,
  name          text not null,
  cls           text not null,
  roll          text default '',
  phone         text not null,
  parent        text default '',
  parent_email  text,
  fee_status    text default 'pending' check (fee_status in ('paid','pending','overdue')),
  absent        boolean default false,
  created_at    timestamptz default now()
);

-- Teachers
create table if not exists teachers (
  id          text primary key default gen_random_uuid()::text,
  school_id   text not null references schools(id) on delete cascade,
  name        text not null,
  subject     text default '',
  classes     text[] default '{}',
  phone       text default '',
  email       text,
  status      text default 'active' check (status in ('active','on_leave')),
  created_at  timestamptz default now()
);

-- Calls log
create table if not exists calls (
  id            text primary key default gen_random_uuid()::text,
  school_id     text not null references schools(id) on delete cascade,
  student_id    text references students(id) on delete set null,
  student_name  text default '',
  parent_phone  text default '',
  type          text default 'absent' check (type in ('absent','fee','alarm','demo','custom')),
  status        text default 'initiated' check (status in ('initiated','completed','failed','no-answer')),
  twilio_sid    text,
  called_at     timestamptz default now()
);

-- Fees
create table if not exists fees (
  id          text primary key default gen_random_uuid()::text,
  school_id   text not null references schools(id) on delete cascade,
  student_id  text not null references students(id) on delete cascade,
  term        text default 'Term 1',
  amount      numeric default 0,
  paid        numeric default 0,
  due         numeric default 0,
  status      text default 'pending' check (status in ('paid','pending','overdue')),
  due_date    date,
  created_at  timestamptz default now()
);

-- Marks
create table if not exists marks (
  id          text primary key default gen_random_uuid()::text,
  school_id   text not null references schools(id) on delete cascade,
  student_id  text not null references students(id) on delete cascade,
  exam_id     text,
  subject     text not null,
  marks       numeric default 0,
  total       numeric default 100,
  grade       text default '',
  created_at  timestamptz default now()
);

-- Exams
create table if not exists exams (
  id          text primary key default gen_random_uuid()::text,
  school_id   text not null references schools(id) on delete cascade,
  title       text not null,
  cls         text not null,
  subject     text not null,
  total_marks numeric default 100,
  questions   jsonb default '[]',
  status      text default 'draft' check (status in ('draft','published')),
  date        date,
  created_at  timestamptz default now()
);

-- Bus routes
create table if not exists bus_routes (
  id             text primary key default gen_random_uuid()::text,
  school_id      text not null references schools(id) on delete cascade,
  number         text not null,
  driver         text default '',
  driver_phone   text,
  stops          jsonb default '[]',
  maps_link      text,
  student_count  int default 0,
  status         text default 'active' check (status in ('active','inactive')),
  created_at     timestamptz default now()
);

-- Alerts
create table if not exists alerts (
  id           text primary key default gen_random_uuid()::text,
  school_id    text not null references schools(id) on delete cascade,
  message      text not null,
  message_te   text,
  channel      text default 'sms' check (channel in ('sms','whatsapp','both')),
  template     text,
  scheduled_at timestamptz,
  sent_at      timestamptz,
  status       text default 'sent' check (status in ('scheduled','sent','failed')),
  created_at   timestamptz default now()
);

-- Enquiries
create table if not exists enquiries (
  id          text primary key default gen_random_uuid()::text,
  school_id   text not null references schools(id) on delete cascade,
  name        text not null,
  phone       text not null,
  cls         text default '',
  source      text default 'phone' check (source in ('phone','walk-in','whatsapp','online')),
  status      text default 'new' check (status in ('new','called','interested','admitted','dropped')),
  notes       text,
  created_at  timestamptz default now()
);

-- Admissions
create table if not exists admissions (
  id              text primary key default gen_random_uuid()::text,
  school_id       text not null references schools(id) on delete cascade,
  child_name      text not null,
  parent_name     text default '',
  phone           text not null,
  email           text,
  class_applied   text default '',
  dob             date,
  current_school  text,
  source          text,
  status          text default 'pending' check (status in ('pending','reviewed','admitted','rejected')),
  created_at      timestamptz default now()
);

-- Courses (LMS)
create table if not exists courses (
  id            text primary key default gen_random_uuid()::text,
  school_id     text not null references schools(id) on delete cascade,
  title         text not null,
  subject       text default '',
  cls           text default '',
  description   text,
  thumbnail     text,
  teacher_id    text references teachers(id) on delete set null,
  status        text default 'draft' check (status in ('draft','published')),
  lesson_count  int default 0,
  created_at    timestamptz default now()
);

-- Lessons
create table if not exists lessons (
  id                text primary key default gen_random_uuid()::text,
  course_id         text not null references courses(id) on delete cascade,
  school_id         text not null references schools(id) on delete cascade,
  title             text not null,
  content           text,
  video_url         text,
  "order"           int default 0,
  duration_minutes  int,
  created_at        timestamptz default now()
);

-- IVR responses
create table if not exists ivr_responses (
  id            text primary key default gen_random_uuid()::text,
  school_id     text not null references schools(id) on delete cascade,
  student_id    text references students(id) on delete set null,
  student_name  text default '',
  parent_phone  text default '',
  response      text check (response in ('1','2')),
  responded_at  timestamptz default now()
);

-- ── Indexes for performance ──────────────────────────────────────────
create index if not exists idx_students_school    on students(school_id);
create index if not exists idx_students_cls       on students(school_id, cls);
create index if not exists idx_calls_school       on calls(school_id);
create index if not exists idx_fees_school        on fees(school_id);
create index if not exists idx_marks_student      on marks(student_id);
create index if not exists idx_alerts_school      on alerts(school_id);
create index if not exists idx_enquiries_school   on enquiries(school_id);

-- ── Seed demo data (remove in production) ───────────────────────────
-- You can delete everything below this line once you register your school
