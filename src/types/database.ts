export interface Recording {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  audio_url: string;
  duration: number;
  transcript: string | null;
  status: 'processing' | 'completed' | 'error';
}

export interface Meeting {
  id: string;
  created_at: string;
  recording_id: string;
  title: string;
  summary: string;
  date: string;
  participants: string[];
}

export interface Task {
  id: string;
  created_at: string;
  meeting_id: string;
  description: string;
  assignee: string | null;
  due_date: string | null;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Topic {
  id: string;
  created_at: string;
  meeting_id: string;
  name: string;
  summary: string;
  keywords: string[];
}