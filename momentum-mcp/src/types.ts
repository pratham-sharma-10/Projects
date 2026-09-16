export type LoopStatus = 'open' | 'waiting' | 'resolved';
export type LoopOwner = 'me' | 'external' | 'shared';
export type Priority = 'low' | 'medium' | 'high';
export type ContextKind = 'note' | 'interaction' | 'update';

export interface Project {
  id: number;
  name: string;
  summary: string | null;
  status: string;
  last_touched_at: string;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: number;
  display_name: string;
  relationship: string | null;
  notes: string | null;
  last_interaction_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContextItem {
  id: number;
  kind: ContextKind;
  title: string;
  body: string;
  source: string | null;
  project_id: number | null;
  project_name?: string | null;
  person_id: number | null;
  person_name?: string | null;
  created_at: string;
}

export interface OpenLoop {
  id: number;
  title: string;
  description: string | null;
  status: LoopStatus;
  owner: LoopOwner;
  priority: Priority;
  project_id: number | null;
  project_name?: string | null;
  person_id: number | null;
  person_name?: string | null;
  due_at: string | null;
  expected_at: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface Decision {
  id: number;
  title: string;
  decision: string;
  rationale: string | null;
  project_id: number | null;
  project_name?: string | null;
  created_at: string;
}

export interface DailyBrief {
  generated_at: string;
  priorities: OpenLoop[];
  overdue: OpenLoop[];
  waiting_on: OpenLoop[];
  stale_projects: Project[];
  people_to_reconnect: Person[];
  stats: {
    open_loops: number;
    waiting: number;
    overdue: number;
  };
}
