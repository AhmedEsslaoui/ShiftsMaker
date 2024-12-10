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
  | 'Break'
  | 'Sick'
  // Morocco Tasks
  | 'Morocco_Chat'
  | 'Morocco_Chat_Appeals'
  | 'Morocco_Chat_Emails'
  | 'Morocco_Emails_Appeals'
  | 'Morocco_Emails_Reviews'
  | 'Morocco_All_Tasks'
  | 'Morocco_Break';

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
  isLocked: boolean;
  isArchived: boolean;
  publishedTo?: 'Egypt' | 'Morocco' | null;
  splitOnTwo?: boolean;
  agents: Agent[];
  senior: string;
}

export const taskTypesByCountry = {
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
    'Chat',
    'Chat/Appeals+Reviews',
    'Chat /Emails+Groups+ Calls',
    'Emails ( New ) + Appeals+ Calls',
    'Emails (Need attention) + Reviews + Groups',
    'All tasks + Calls',
    'Break',
    'Sick'
  ]
} as const;
