
import { useState, useEffect } from 'react';
import { Lead } from '@/types/Lead';
import { Company } from '@/types/Company';
import { supabase } from '@/integrations/supabase/client';
import { EditableCell } from './EditableCell';
import { toast } from 'sonner';
import { Trash, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadsTableProps {
  onEdit: (lead: Lead) => void;
}

export const LeadsTable = ({ onEdit }: LeadsTableProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
    fetchCompanies();
  }, []);

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
      
      // Transform data to include company_name
      const transformedLeads = data?.map(lead => ({
        ...lead,
        company_name: lead.companies?.name || null
      })) || [];
      
      setLeads(transformedLeads);
    } catch (error: any) {
      toast.error(`Error loading leads: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

  const updateLeadField = async (lead: Lead, field: string, value: any) => {
    try {
      // If updating company, we need to use company_id
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
    } catch (error: any) {
      toast.error(`Error updating lead: ${error.message}`);
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

  if (loading) {
    return <div className="text-center py-4">Loading leads...</div>;
  }

  const statusOptions = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
  const sourceOptions = ['website', 'referral', 'social media', 'event', 'cold call', 'email campaign', 'other'];
  const companyOptions = companies.map(c => c.name);

  return (
    <div className="rounded-md border bg-card text-card-foreground shadow">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Company</th>
              <th className="px-4 py-3 text-left font-medium">Source</th>
              <th className="px-4 py-3 text-left font-medium">Last Contact</th>
              <th className="px-4 py-3 text-right font-medium w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                  No leads found. Add your first lead to get started.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-2">
                    {`${lead.first_name} ${lead.last_name}`}
                  </td>
                  <td className="px-4 py-2">
                    <EditableCell
                      value={lead.email || ''}
                      row={lead}
                      column="email"
                      onUpdate={updateLeadField}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <EditableCell
                      value={lead.phone || ''}
                      row={lead}
                      column="phone"
                      onUpdate={updateLeadField}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <EditableCell
                      value={lead.status || 'new'}
                      row={lead}
                      column="status"
                      onUpdate={updateLeadField}
                      type="select"
                      options={statusOptions}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <EditableCell
                      value={lead.company_name || ''}
                      row={lead}
                      column="company_name"
                      onUpdate={updateLeadField}
                      type="select"
                      options={companyOptions}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <EditableCell
                      value={lead.source || ''}
                      row={lead}
                      column="source"
                      onUpdate={updateLeadField}
                      type="select"
                      options={sourceOptions}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <EditableCell
                      value={lead.last_contact_date || ''}
                      row={lead}
                      column="last_contact_date"
                      onUpdate={updateLeadField}
                      type="date"
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
