export type TaskType = 'Chat' | 'Emails' | 'All tasks' | 'All tasks/Chat assist';

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
  date: string;
  senior: string;
  shiftType: ShiftType;
  timeSlots: string[];
  agents: Agent[];
  isLocked: boolean;
  isArchived: boolean;
  publishedTo: 'Egypt' | 'Morocco' | null;
}
