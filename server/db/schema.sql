
--Enable UUID Support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email varchar(255) unique not null,
    password_hash text not null,
    avatar_url text,
    is_online boolean default false,
    created_at timestamptz default now()
);

--ORGANISATIONS
create table if not exists organisations (
    id uuid primary key default uuid_generate_v4(),
    name varchar(100) not null,
    slug varchar(100) unique not null,
    owner_id uuid references users(id) on delete set null,
    created_at timestamptz default now()
);

--ORG MEMBERS
CREATE TABLE IF NOT EXISTS org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

--CHANNELS
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  is_dm BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, name)
);

--CHANNEL MEMBERS
CREATE TABLE IF NOT EXISTS channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- READ RECEIPTS
CREATE TABLE IF NOT EXISTS read_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FILES
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(100),
  file_url TEXT NOT NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);