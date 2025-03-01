
export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  job_title?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  source?: string;
  notes?: string;
  last_contact_date?: string;
  company_id?: string;
  company_name?: string; // For display purposes
  user_id?: string;
  created_at?: string;
}
