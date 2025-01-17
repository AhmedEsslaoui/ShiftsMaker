export type TaskType =
  // Egypt Tasks
  | 'Chat'
  | 'Appeals/Reviews'
  | 'Appeals/Reviews/Calls'
  | 'Calls'
  | 'Calls /App follow'
  | 'Emails'
  | 'Appeals/Reviews/Calls/App follow'
  | 'App follow'
  // Morocco Tasks
  | 'Chat/Appeals+Reviews'
  | 'Chat /Emails+Groups+ Calls'
  | 'Emails ( New ) + Appeals+ Calls'
  | 'Emails (Need attention) + Reviews + Groups'
  | 'All tasks + Calls'
  // Common Tasks
  | 'Break'
  | 'Sick';

export interface Task {
  type: TaskType;
  additionalNote?: string;
}

export interface Agent {
  name: string;
  tasks: (Task | null)[];
  highlight?: boolean;
}

export type ShiftType = 'Morning' | 'Day' | 'Afternoon' | 'Evening' | 'Night';

export interface ShiftTable {
  id: string;
  country: 'Egypt' | 'Morocco';
  date: string;
  shiftType: ShiftType;
  shifts: Record<ShiftType, string[]>;
  timeSlots: string[];
  isArchived: boolean;
  isDeleted?: boolean;
  publishedTo?: 'Egypt' | 'Morocco' | null;
  splitOnTwo?: boolean;
  agents: Agent[];
  senior: string;
  manuallyUnarchived?: boolean;
}

export const taskTypesByCountry: Record<'Egypt' | 'Morocco', TaskType[]> = {
  Egypt: [
    'Chat',
    'Appeals/Reviews',
    'Appeals/Reviews/Calls',
    'Calls',
    'Calls /App follow',
    'Emails',
    'Appeals/Reviews/Calls/App follow',
    'App follow',
    'Break',
    'Sick'
  ],
  Morocco: [
    'Chat/Appeals+Reviews',
    'Chat /Emails+Groups+ Calls',
    'Emails ( New ) + Appeals+ Calls',
    'Emails (Need attention) + Reviews + Groups',
    'All tasks + Calls',
    'Break',
    'Sick'
  ]
} as const;
