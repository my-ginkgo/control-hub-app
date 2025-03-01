
import { useState, useEffect } from 'react';
import { Lead } from '@/types/Lead';
import { Company } from '@/types/Company';
import { supabase } from '@/integrations/supabase/client';
import { EditableCell } from './EditableCell';
import { toast } from 'sonner';
import { Trash, UserRound, ChevronDown, ChevronUp, Phone, Mail, Building, Star, Calendar, Tag as TagIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FilterPanel, Filters, FilterOption } from './FilterPanel';
import { format, isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import { TagInput } from './TagInput';
import { Badge } from '@/components/ui/badge';

interface LeadsTableProps {
  onEdit: (lead: Lead) => void;
  refresh?: number; // Add refresh counter prop
}

export const LeadsTable = ({ onEdit, refresh = 0 }: LeadsTableProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLeads, setExpandedLeads] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<Filters>({});
  const [allTags, setAllTags] = useState<string[]>([]);

  const filterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Stato',
      type: 'select',
      options: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']
    },
    {
      id: 'source',
      label: 'Fonte',
      type: 'select',
      options: ['website', 'referral', 'social media', 'event', 'cold call', 'email campaign', 'other']
    },
    {
      id: 'lead_score',
      label: 'Punteggio minimo',
      type: 'number',
      min: 1,
      max: 100
    },
    {
      id: 'last_contact_date',
      label: 'Contatto dopo',
      type: 'date'
    },
    {
      id: 'company',
      label: 'Azienda',
      type: 'text'
    },
    {
      id: 'tags',
      label: 'Tag',
      type: 'tag',
      tagOptions: allTags
    }
  ];

  useEffect(() => {
    fetchLeads();
    fetchCompanies();
  }, [refresh]); // Add refresh to dependencies

  useEffect(() => {
    applyFilters();
  }, [leads, filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          companies (
            id,
            name
          )
        `)
        .order('last_name');
      
      if (error) throw error;
      
      const transformedLeads = data?.map(lead => {
        const typedLead: Lead = {
          id: lead.id,
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email || undefined,
          phone: lead.phone || undefined,
          job_title: lead.job_title || undefined,
          status: (lead.status as Lead['status']) || 'new',
          source: lead.source || undefined,
          notes: lead.notes || undefined,
          last_contact_date: lead.last_contact_date || undefined,
          company_id: lead.company_id || undefined,
          company_name: lead.companies?.name || undefined,
          linkedin_url: lead.linkedin_url || undefined,
          twitter_url: lead.twitter_url || undefined,
          interests: lead.interests || undefined,
          budget: lead.budget || undefined,
          decision_timeline: lead.decision_timeline || undefined,
          communication_preference: lead.communication_preference as Lead['communication_preference'] || undefined,
          lead_score: lead.lead_score || undefined,
          tags: lead.tags || [],
          user_id: lead.user_id,
          created_at: lead.created_at
        };
        return typedLead;
      }) || [];
      
      setLeads(transformedLeads);
      setFilteredLeads(transformedLeads);
      
      // Extract all unique tags for the filter options
      const uniqueTags = Array.from(
        new Set(
          transformedLeads
            .filter(lead => lead.tags && lead.tags.length > 0)
            .flatMap(lead => lead.tags as string[])
        )
      );
      setAllTags(uniqueTags);
    } catch (error: any) {
      toast.error(`Error loading leads: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshLeadsData = async () => {
    setRefreshing(true);
    await fetchLeads();
    setRefreshing(false);
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      toast.error(`Error loading companies: ${error.message}`);
    }
  };

  const applyFilters = () => {
    let result = [...leads];
    
    if (filters.status && filters.status !== "_all") {
      result = result.filter(lead => lead.status === filters.status);
    }
    
    if (filters.source && filters.source !== "_all") {
      result = result.filter(lead => lead.source === filters.source);
    }
    
    if (filters.lead_score) {
      const minScore = parseInt(filters.lead_score);
      result = result.filter(lead => 
        lead.lead_score !== undefined && lead.lead_score >= minScore
      );
    }
    
    if (filters.last_contact_date) {
      const filterDate = new Date(filters.last_contact_date);
      result = result.filter(lead => {
        if (!lead.last_contact_date) return false;
        const contactDate = typeof lead.last_contact_date === 'string' 
          ? parseISO(lead.last_contact_date)
          : new Date(lead.last_contact_date);
        
        return isAfter(contactDate, filterDate) || isEqual(contactDate, filterDate);
      });
    }
    
    if (filters.company) {
      const searchTerm = filters.company.toLowerCase();
      result = result.filter(lead => 
        lead.company_name?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by tags if selected
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(lead => 
        lead.tags && filters.tags.some((tag: string) => lead.tags?.includes(tag))
      );
    }
    
    setFilteredLeads(result);
  };

  const updateLeadField = async (lead: Lead, field: string, value: any) => {
    if (field === 'company_name') {
      const companyId = value ? companies.find(c => c.name === value)?.id : null;
      if (value && !companyId) {
        return toast.error('Invalid company selected');
      }
      
      const { error } = await supabase
        .from('leads')
        .update({ company_id: companyId })
        .eq('id', lead.id);
      
      if (error) throw error;
      
      setLeads(leads.map(l => 
        l.id === lead.id ? { ...l, company_id: companyId, company_name: value } : l
      ));
    } else {
      const { error } = await supabase
        .from('leads')
        .update({ [field]: value })
        .eq('id', lead.id);
      
      if (error) throw error;
      
      setLeads(leads.map(l => 
        l.id === lead.id ? { ...l, [field]: value } : l
      ));
    }
    
    toast.success('Lead updated');
  };

  const updateLeadTags = async (lead: Lead, tags: string[]) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ tags: tags })
        .eq('id', lead.id);
      
      if (error) throw error;
      
      // Update the leads state
      setLeads(leads.map(l => 
        l.id === lead.id ? { ...l, tags } : l
      ));
      
      // Update the all tags collection
      const uniqueTags = Array.from(
        new Set([
          ...allTags,
          ...tags
        ])
      );
      setAllTags(uniqueTags);
      
      toast.success('Tags updated');
    } catch (error: any) {
      toast.error(`Error updating tags: ${error.message}`);
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setLeads(leads.filter(l => l.id !== id));
      toast.success('Lead deleted');
    } catch (error: any) {
      toast.error(`Error deleting lead: ${error.message}`);
    }
  };

  const toggleLeadDetails = (id: string) => {
    setExpandedLeads(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getLeadScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return <div className="text-center py-4">Loading leads...</div>;
  }

  const statusOptions = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
  const sourceOptions = ['website', 'referral', 'social media', 'event', 'cold call', 'email campaign', 'other'];
  const companyOptions = companies.map(c => c.name);
  const communicationOptions = ['email', 'phone', 'in-person', 'video'];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FilterPanel 
          filterOptions={filterOptions} 
          onFilterChange={setFilters}
        />
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshLeadsData}
          disabled={refreshing}
          className="h-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Aggiornamento...' : 'Aggiorna'}
        </Button>
      </div>
      
      <div className="rounded-md border bg-card text-card-foreground shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Score</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {leads.length === 0 
                      ? "No leads found. Add your first lead to get started."
                      : "No leads match your current filters."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <>
                    <TableRow key={lead.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleLeadDetails(lead.id)}
                          title={expandedLeads[lead.id] ? "Hide details" : "Show details"}
                        >
                          {expandedLeads[lead.id] ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {`${lead.first_name} ${lead.last_name}`}
                        </div>
                        {lead.job_title && (
                          <div className="text-sm text-muted-foreground">
                            {lead.job_title}
                          </div>
                        )}
                        {lead.tags && lead.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {lead.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                <TagIcon className="h-2 w-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {lead.email ? (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{lead.email}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {lead.company_name ? (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-muted-foreground" />
                            <span>{lead.company_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          lead.status === 'closed-won' ? 'bg-green-100 text-green-800' :
                          lead.status === 'closed-lost' ? 'bg-red-100 text-red-800' :
                          lead.status === 'negotiation' ? 'bg-purple-100 text-purple-800' :
                          lead.status === 'proposal' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'qualified' ? 'bg-yellow-100 text-yellow-800' :
                          lead.status === 'contacted' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status ? lead.status.replace('-', ' ') : 'new'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {lead.lead_score ? (
                          <div className="flex items-center gap-1">
                            <Star className={`h-3 w-3 ${getLeadScoreColor(lead.lead_score)}`} />
                            <span className={getLeadScoreColor(lead.lead_score)}>{lead.lead_score}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Not scored</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onEdit(lead)} 
                            title="Edit lead"
                          >
                            <UserRound className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteLead(lead.id)} 
                            title="Delete lead"
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {expandedLeads[lead.id] && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0 border-t-0">
                          <div className="p-4 bg-muted/30">
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="contact-info">
                                <AccordionTrigger className="text-sm font-medium">
                                  Contact Information
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
                                    <div>
                                      <p className="text-sm font-medium">Email</p>
                                      <EditableCell
                                        value={lead.email || ''}
                                        row={lead}
                                        column="email"
                                        onUpdate={updateLeadField}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Phone</p>
                                      <EditableCell
                                        value={lead.phone || ''}
                                        row={lead}
                                        column="phone"
                                        onUpdate={updateLeadField}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Communication Preference</p>
                                      <EditableCell
                                        value={lead.communication_preference || ''}
                                        row={lead}
                                        column="communication_preference"
                                        onUpdate={updateLeadField}
                                        type="select"
                                        options={communicationOptions}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">LinkedIn</p>
                                      <EditableCell
                                        value={lead.linkedin_url || ''}
                                        row={lead}
                                        column="linkedin_url"
                                        onUpdate={updateLeadField}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Twitter</p>
                                      <EditableCell
                                        value={lead.twitter_url || ''}
                                        row={lead}
                                        column="twitter_url"
                                        onUpdate={updateLeadField}
                                      />
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="lead-details">
                                <AccordionTrigger className="text-sm font-medium">
                                  Lead Details
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
                                    <div>
                                      <p className="text-sm font-medium">Status</p>
                                      <EditableCell
                                        value={lead.status || 'new'}
                                        row={lead}
                                        column="status"
                                        onUpdate={updateLeadField}
                                        type="select"
                                        options={statusOptions}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Source</p>
                                      <EditableCell
                                        value={lead.source || ''}
                                        row={lead}
                                        column="source"
                                        onUpdate={updateLeadField}
                                        type="select"
                                        options={sourceOptions}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Lead Score</p>
                                      <EditableCell
                                        value={lead.lead_score?.toString() || ''}
                                        row={lead}
                                        column="lead_score"
                                        onUpdate={(lead, column, value) => 
                                          updateLeadField(lead, column, value ? parseInt(value) : null)
                                        }
                                        type="number"
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Company</p>
                                      <EditableCell
                                        value={lead.company_name || ''}
                                        row={lead}
                                        column="company_name"
                                        onUpdate={updateLeadField}
                                        type="select"
                                        options={companyOptions}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Last Contact</p>
                                      <EditableCell
                                        value={lead.last_contact_date || ''}
                                        row={lead}
                                        column="last_contact_date"
                                        onUpdate={updateLeadField}
                                        type="date"
                                      />
                                    </div>
                                    <div className="md:col-span-2">
                                      <p className="text-sm font-medium">Tags</p>
                                      <TagInput 
                                        tags={lead.tags || []} 
                                        onChange={(tags) => updateLeadTags(lead, tags)}
                                        placeholder="Aggiungi tag..."
                                      />
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="opportunity-details">
                                <AccordionTrigger className="text-sm font-medium">
                                  Opportunity Details
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                                    <div>
                                      <p className="text-sm font-medium">Budget</p>
                                      <EditableCell
                                        value={lead.budget || ''}
                                        row={lead}
                                        column="budget"
                                        onUpdate={updateLeadField}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Decision Timeline</p>
                                      <EditableCell
                                        value={lead.decision_timeline || ''}
                                        row={lead}
                                        column="decision_timeline"
                                        onUpdate={updateLeadField}
                                      />
                                    </div>
                                    <div className="md:col-span-2">
                                      <p className="text-sm font-medium">Interests</p>
                                      <EditableCell
                                        value={lead.interests || ''}
                                        row={lead}
                                        column="interests"
                                        onUpdate={updateLeadField}
                                      />
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="notes">
                                <AccordionTrigger className="text-sm font-medium">
                                  Notes
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="py-2">
                                    <EditableCell
                                      value={lead.notes || ''}
                                      row={lead}
                                      column="notes"
                                      onUpdate={updateLeadField}
                                    />
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
