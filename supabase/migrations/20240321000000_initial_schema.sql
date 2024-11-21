-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recordings table with segments
CREATE TABLE recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    duration INTEGER NOT NULL,
    transcript TEXT,
    segments JSONB,
    status TEXT CHECK (status IN ('processing', 'completed', 'error')) DEFAULT 'processing' NOT NULL
);

-- Rest of the schema remains the same...
-- Meetings table
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    recording_id UUID REFERENCES recordings(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    date DATE NOT NULL,
    participants TEXT[] NOT NULL DEFAULT '{}'::TEXT[]
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    assignee TEXT,
    due_date DATE,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending' NOT NULL
);

-- Topics table
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    keywords TEXT[] NOT NULL DEFAULT '{}'::TEXT[]
);

-- Set up Row Level Security (RLS)
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Policies for recordings
CREATE POLICY "Users can view their own recordings"
    ON recordings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recordings"
    ON recordings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recordings"
    ON recordings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recordings"
    ON recordings FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for meetings
CREATE POLICY "Users can view meetings of their recordings"
    ON meetings FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM recordings
        WHERE recordings.id = meetings.recording_id
        AND recordings.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert meetings"
    ON meetings FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM recordings
        WHERE recordings.id = recording_id
        AND recordings.user_id = auth.uid()
    ));

CREATE POLICY "Users can update meetings"
    ON meetings FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM recordings
        WHERE recordings.id = recording_id
        AND recordings.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete meetings"
    ON meetings FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM recordings
        WHERE recordings.id = recording_id
        AND recordings.user_id = auth.uid()
    ));

-- Policies for tasks
CREATE POLICY "Users can view tasks"
    ON tasks FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM meetings
        JOIN recordings ON recordings.id = meetings.recording_id
        WHERE meetings.id = tasks.meeting_id
        AND recordings.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert tasks"
    ON tasks FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM meetings
        JOIN recordings ON recordings.id = meetings.recording_id
        WHERE meetings.id = meeting_id
        AND recordings.user_id = auth.uid()
    ));

CREATE POLICY "Users can update tasks"
    ON tasks FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM meetings
        JOIN recordings ON recordings.id = meetings.recording_id
        WHERE meetings.id = tasks.meeting_id
        AND recordings.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete tasks"
    ON tasks FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM meetings
        JOIN recordings ON recordings.id = meetings.recording_id
        WHERE meetings.id = tasks.meeting_id
        AND recordings.user_id = auth.uid()
    ));

-- Policies for topics
CREATE POLICY "Users can view topics"
    ON topics FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM meetings
        JOIN recordings ON recordings.id = meetings.recording_id
        WHERE meetings.id = topics.meeting_id
        AND recordings.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert topics"
    ON topics FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM meetings
        JOIN recordings ON recordings.id = meetings.recording_id
        WHERE meetings.id = meeting_id
        AND recordings.user_id = auth.uid()
    ));

CREATE POLICY "Users can update topics"
    ON topics FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM meetings
        JOIN recordings ON recordings.id = meetings.recording_id
        WHERE meetings.id = topics.meeting_id
        AND recordings.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete topics"
    ON topics FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM meetings
        JOIN recordings ON recordings.id = meetings.recording_id
        WHERE meetings.id = topics.meeting_id
        AND recordings.user_id = auth.uid()
    ));