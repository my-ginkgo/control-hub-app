import React, { useState, useEffect } from 'react';
import { Lead } from '@/types/Lead';
import { Company } from '@/types/Company';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FilterPanel, Filters, FilterOption } from './FilterPanel';
import { format, isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import { LeadDetails } from './LeadDetails';
import { LeadListItem } from './LeadListItem';
import { LeadFilterControls } from './LeadFilterControls';
import { EmptyLeadsState } from './EmptyLeadsState';
import { TablePagination } from './TablePagination';

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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginatedLeads, setPaginatedLeads] = useState<Lead[]>([]);

  const statusOptions = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
  const sourceOptions = ['website', 'referral', 'social media', 'event', 'cold call', 'email campaign', 'other'];
  const communicationOptions = ['email', 'phone', 'in-person', 'video'];

  const filterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Stato',
      type: 'select',
      options: statusOptions
    },
    {
      id: 'source',
      label: 'Fonte',
      type: 'select',
      options: sourceOptions
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
  }, [refresh]);

  useEffect(() => {
    applyFilters();
  }, [leads, filters]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredLeads.length);
    setPaginatedLeads(filteredLeads.slice(startIndex, endIndex));
  }, [filteredLeads, currentPage, itemsPerPage]);

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
          tags: Array.isArray(lead.tags) ? lead.tags : [],
          user_id: lead.user_id,
          created_at: lead.created_at
        };
        return typedLead;
      }) || [];
      
      setLeads(transformedLeads);
      setFilteredLeads(transformedLeads);
      
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
    
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(lead => 
        lead.tags && filters.tags.some((tag: string) => lead.tags?.includes(tag))
      );
    }
    
    setFilteredLeads(result);
    setCurrentPage(1);
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

  const handleTagsUpdated = (uniqueTags: string[]) => {
    setAllTags(uniqueTags);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const companyOptions = companies.map(c => c.name);

  if (loading) {
    return <div className="text-center py-4">Loading leads...</div>;
  }

  return (
    <div className="space-y-4">
      <LeadFilterControls 
        filterOptions={filterOptions}
        onFilterChange={setFilters}
        onRefresh={refreshLeadsData}
        isRefreshing={refreshing}
      />
      
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
              {paginatedLeads.length === 0 ? (
                <EmptyLeadsState hasLeads={leads.length > 0} />
              ) : (
                paginatedLeads.map((lead) => (
                  <React.Fragment key={lead.id}>
                    <LeadListItem 
                      lead={lead}
                      isExpanded={!!expandedLeads[lead.id]}
                      onToggleDetails={() => toggleLeadDetails(lead.id)}
                      onEdit={onEdit}
                      onDelete={deleteLead}
                    />
                    
                    {expandedLeads[lead.id] && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0 border-t-0">
                          <LeadDetails 
                            lead={lead}
                            companyOptions={companyOptions}
                            statusOptions={statusOptions}
                            sourceOptions={sourceOptions}
                            communicationOptions={communicationOptions}
                            allTags={allTags}
                            onTagsUpdated={handleTagsUpdated}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredLeads.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredLeads.length / itemsPerPage)}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalItems={filteredLeads.length}
          />
        )}
      </div>
    </div>
  );
};
