
export interface ImportResult {
  firstName: string;
  lastName: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  rowNumber?: number;
}

export interface LinkedInImportProps {
  onLeadsImported: () => void;
  triggerId?: string;
}

export interface ColumnMapping {
  csvColumn: string;
  leadField: string;
}

export const LEAD_FIELDS = [
  { value: 'first_name', label: 'Nome' },
  { value: 'last_name', label: 'Cognome' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Telefono' },
  { value: 'job_title', label: 'Ruolo' },
  { value: 'company_name', label: 'Azienda' },
  { value: 'linkedin_url', label: 'URL LinkedIn' },
  { value: 'twitter_url', label: 'URL Twitter' },
  { value: 'notes', label: 'Note' },
  { value: 'status', label: 'Stato' },
  { value: 'source', label: 'Fonte' },
  { value: 'lead_score', label: 'Score' },
  { value: 'tags', label: 'Tag' },
  { value: 'last_contact_date', label: 'Ultima Contatto' },
  { value: 'communication_preference', label: 'Preferenza Comunicazione' },
  { value: 'interests', label: 'Interessi' },
];

export const DEFAULT_LINKEDIN_MAPPING: ColumnMapping[] = [
  { csvColumn: 'firstName', leadField: 'first_name' },
  { csvColumn: 'lastName', leadField: 'last_name' },
  { csvColumn: 'businessEmail', leadField: 'email' },
  { csvColumn: 'phone', leadField: 'phone' },
  { csvColumn: 'occupation', leadField: 'job_title' },
  { csvColumn: 'currentCompany', leadField: 'company_name' },
  { csvColumn: 'profileUrl', leadField: 'linkedin_url' },
  { csvColumn: 'twitter', leadField: 'twitter_url' },
  { csvColumn: 'leadConversation', leadField: 'notes' },
  { csvColumn: '_status', leadField: 'status' },
  { csvColumn: 'leadTags', leadField: 'tags' },
  { csvColumn: 'lastStepExecution', leadField: 'last_contact_date' },
];
