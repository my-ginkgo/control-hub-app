
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EditableCell } from '@/components/crm/EditableCell';
import { Lead } from '@/types/Lead';
import { Company } from '@/types/Company';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LeadForm } from '@/components/crm/LeadForm';
import { Trash2, Plus, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const LeadsTable = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);

  useEffect(() => {
    fetchLeads();
    fetchCompanies();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*, companies(name)')
        .order('last_name');
      
      if (error) throw error;
      
      const formattedLeads = data?.map(lead => ({
        ...lead,
        company_name: lead.companies?.name
      })) || [];
      
      setLeads(formattedLeads);
    } catch (error: any) {
      toast.error(`Error fetching leads: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name');
      
      if (error) throw error;
      
      const companyMap: Record<string, string> = {};
      data?.forEach(company => {
        companyMap[company.id] = company.name;
      });
      
      setCompanies(companyMap);
    } catch (error: any) {
      toast.error(`Error fetching companies: ${error.message}`);
    }
  };

  const updateLeadCell = async (lead: Lead, column: string, value: any) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ [column]: value })
        .eq('id', lead.id);
      
      if (error) throw error;
      
      setLeads(prev => 
        prev.map(l => l.id === lead.id ? { ...l, [column]: value } : l)
      );
    } catch (error: any) {
      toast.error(`Failed to update: ${error.message}`);
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success('Lead deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredLeads = leads.filter(lead => 
    `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setShowAddForm(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'new': 'bg-blue-500',
      'contacted': 'bg-purple-500',
      'qualified': 'bg-yellow-500',
      'proposal': 'bg-orange-500',
      'negotiation': 'bg-indigo-500',
      'closed-won': 'bg-green-500',
      'closed-lost': 'bg-red-500'
    };
    
    return (
      <Badge className={`${statusColors[status] || 'bg-gray-500'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    );
  };

  return (
    <div className="glass p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6" />
          Leads
        </h2>
        <Button onClick={() => { setEditingLead(undefined); setShowAddForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Lead
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          className="pl-10"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Loading leads...</TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {searchTerm ? 'No leads match your search' : 'No leads found. Add your first lead!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map(lead => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <div 
                      className="cursor-pointer hover:underline" 
                      onClick={() => handleEditLead(lead)}
                    >
                      {lead.first_name} {lead.last_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={lead.email || ''}
                      row={lead}
                      column="email"
                      onUpdate={updateLeadCell}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={lead.phone || ''}
                      row={lead}
                      column="phone"
                      onUpdate={updateLeadCell}
                    />
                  </TableCell>
                  <TableCell>
                    {lead.company_name || '-'}
                  </TableCell>
                  <TableCell>
                    {lead.status && getStatusBadge(lead.status)}
                  </TableCell>
                  <TableCell>
                    {lead.last_contact_date 
                      ? new Date(lead.last_contact_date).toLocaleDateString() 
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLead(lead.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <LeadForm 
        open={showAddForm} 
        onOpenChange={setShowAddForm}
        lead={editingLead}
        onLeadAdded={fetchLeads}
      />
    </div>
  );
};
