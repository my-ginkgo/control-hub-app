
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
  linkedin_url?: string; // Added LinkedIn profile
  twitter_url?: string; // Added Twitter profile
  interests?: string; // Added interests
  budget?: string; // Added budget information
  decision_timeline?: string; // Added decision timeline
  communication_preference?: 'email' | 'phone' | 'in-person' | 'video'; // Added communication preference
  lead_score?: number; // Added lead scoring (1-100)
  tags?: string[]; // Added tags for better organization
  user_id?: string;
  created_at?: string;
}
