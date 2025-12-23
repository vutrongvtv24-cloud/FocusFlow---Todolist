export interface Task {
  id: string;
  content: string;
  isCompleted: boolean;
  date: string; // YYYY-MM-DD
  userId: string;
  createdAt: number;
  order: number; // For drag and drop priority
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export type TimerMode = 'focus' | 'break';

export interface CalendarDayStatus {
  date: string;
  total: number;
  completed: number;
}