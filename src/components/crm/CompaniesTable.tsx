
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EditableCell } from '@/components/crm/EditableCell';
import { Company } from '@/types/Company';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CompanyForm } from '@/components/crm/CompanyForm';
import { Trash2, Plus, Search, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const CompaniesTable = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>(undefined);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      toast.error(`Error fetching companies: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompanyCell = async (company: Company, column: string, value: any) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ [column]: value })
        .eq('id', company.id);
      
      if (error) throw error;
      
      setCompanies(prev => 
        prev.map(c => c.id === company.id ? { ...c, [column]: value } : c)
      );
    } catch (error: any) {
      toast.error(`Failed to update: ${error.message}`);
    }
  };

  const deleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company? This will remove all associated leads.')) {
      return;
    }
    
    try {
      // First, update leads to remove reference to this company
      const { error: leadsError } = await supabase
        .from('leads')
        .update({ company_id: null })
        .eq('company_id', id);
      
      if (leadsError) throw leadsError;
      
      // Then delete the company
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCompanies(prev => prev.filter(c => c.id !== id));
      toast.success('Company deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCompanies = companies.filter(company => 
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setShowAddForm(true);
  };

  return (
    <div className="glass p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Building className="h-6 w-6" />
          Companies
        </h2>
        <Button onClick={() => { setEditingCompany(undefined); setShowAddForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Company
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          className="pl-10"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Loading companies...</TableCell>
              </TableRow>
            ) : filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {searchTerm ? 'No companies match your search' : 'No companies found. Add your first company!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map(company => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <div 
                      className="cursor-pointer hover:underline" 
                      onClick={() => handleEditCompany(company)}
                    >
                      {company.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={company.industry || ''}
                      row={company}
                      column="industry"
                      onUpdate={updateCompanyCell}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={company.employee_count?.toString() || ''}
                      row={company}
                      column="employee_count"
                      type="number"
                      onUpdate={updateCompanyCell}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={company.website || ''}
                      row={company}
                      column="website"
                      onUpdate={updateCompanyCell}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={company.city || ''}
                      row={company}
                      column="city"
                      onUpdate={updateCompanyCell}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={company.country || ''}
                      row={company}
                      column="country"
                      onUpdate={updateCompanyCell}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCompany(company.id)}
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
      
      <CompanyForm 
        open={showAddForm} 
        onOpenChange={setShowAddForm}
        company={editingCompany}
        onCompanyAdded={fetchCompanies}
      />
    </div>
  );
};
