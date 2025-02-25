
export interface TimeEntry {
  hours: number;
  billableHours: number;
  project: string;
  notes?: string;
  date: string;
  assignedUserId: string;
  userId: string;
  startDate: string;
  endDate: string;
  assignedUserEmail?: string;
  userEmail?: string;
}
