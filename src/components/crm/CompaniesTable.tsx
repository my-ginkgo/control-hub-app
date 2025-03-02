import { useState, useEffect } from 'react';
import { Company } from '@/types/Company';
import { supabase } from '@/integrations/supabase/client';
import { EditableCell } from './EditableCell';
import { toast } from 'sonner';
import { Building, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterPanel, Filters, FilterOption } from './FilterPanel';
import { TablePagination } from './TablePagination';

interface CompaniesTableProps {
  onEdit: (company: Company) => void;
  refresh?: number; // Add a refresh counter prop to trigger refetching
}

export const CompaniesTable = ({ onEdit, refresh = 0 }: CompaniesTableProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginatedCompanies, setPaginatedCompanies] = useState<Company[]>([]);

  // Define filter options
  const filterOptions: FilterOption[] = [
    {
      id: 'industry',
      label: 'Industria',
      type: 'text'
    },
    {
      id: 'country',
      label: 'Paese',
      type: 'text'
    },
    {
      id: 'city',
      label: 'Città',
      type: 'text'
    },
    {
      id: 'employee_count',
      label: 'Numero dipendenti minimo',
      type: 'number',
      min: 1
    }
  ];

  // Update the dependency array to include the refresh counter
  useEffect(() => {
    fetchCompanies();
  }, [refresh]);

  useEffect(() => {
    applyFilters();
  }, [companies, filters]);

  useEffect(() => {
    // Apply pagination to filtered companies
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredCompanies.length);
    setPaginatedCompanies(filteredCompanies.slice(startIndex, endIndex));
  }, [filteredCompanies, currentPage, itemsPerPage]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCompanies(data || []);
      setFilteredCompanies(data || []);
    } catch (error: any) {
      toast.error(`Error loading companies: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...companies];
    
    // Apply each filter
    if (filters.industry) {
      const searchTerm = filters.industry.toLowerCase();
      result = result.filter(company => 
        company.industry?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.country) {
      const searchTerm = filters.country.toLowerCase();
      result = result.filter(company => 
        company.country?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.city) {
      const searchTerm = filters.city.toLowerCase();
      result = result.filter(company => 
        company.city?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.employee_count) {
      const minCount = parseInt(filters.employee_count);
      result = result.filter(company => 
        company.employee_count !== null && company.employee_count >= minCount
      );
    }
    
    setFilteredCompanies(result);
  };

  const updateCompanyField = async (company: Company, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ [field]: value })
        .eq('id', company.id);
      
      if (error) throw error;
      
      setCompanies(companies.map(c => 
        c.id === company.id ? { ...c, [field]: value } : c
      ));
      toast.success('Company updated');
    } catch (error: any) {
      toast.error(`Error updating company: ${error.message}`);
    }
  };

  const deleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    
    try {
      // First check if there are any leads associated with this company
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('company_id', id)
        .limit(1);
      
      if (leadError) throw leadError;
      
      if (leadData && leadData.length > 0) {
        return toast.error('Cannot delete company with associated leads. Please remove leads first.');
      }
      
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCompanies(companies.filter(c => c.id !== id));
      toast.success('Company deleted');
    } catch (error: any) {
      toast.error(`Error deleting company: ${error.message}`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  if (loading) {
    return <div className="text-center py-4">Loading companies...</div>;
  }

  return (
    <div className="space-y-4">
      <FilterPanel 
        filterOptions={filterOptions} 
        onFilterChange={setFilters}
        className="mb-4"
      />
      
      <div className="rounded-md border bg-card text-card-foreground shadow">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="hidden md:table-cell px-4 py-3 text-left font-medium">Industry</th>
                <th className="hidden md:table-cell px-4 py-3 text-left font-medium">Phone</th>
                <th className="hidden md:table-cell px-4 py-3 text-left font-medium">Email</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left font-medium">Website</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left font-medium">City</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left font-medium">Country</th>
                <th className="px-4 py-3 text-right font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCompanies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                    {companies.length === 0 
                      ? "No companies found. Add your first company to get started."
                      : "No companies match your current filters."}
                  </td>
                </tr>
              ) : (
                paginatedCompanies.map((company) => (
                  <tr key={company.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-2">
                      <EditableCell
                        value={company.name}
                        row={company}
                        column="name"
                        onUpdate={updateCompanyField}
                      />
                    </td>
                    <td className="hidden md:table-cell px-4 py-2">
                      <EditableCell
                        value={company.industry || ''}
                        row={company}
                        column="industry"
                        onUpdate={updateCompanyField}
                      />
                    </td>
                    <td className="hidden md:table-cell px-4 py-2">
                      <EditableCell
                        value={company.phone || ''}
                        row={company}
                        column="phone"
                        onUpdate={updateCompanyField}
                      />
                    </td>
                    <td className="hidden md:table-cell px-4 py-2">
                      <EditableCell
                        value={company.email || ''}
                        row={company}
                        column="email"
                        onUpdate={updateCompanyField}
                        type="text"
                      />
                    </td>
                    <td className="hidden lg:table-cell px-4 py-2">
                      <EditableCell
                        value={company.website || ''}
                        row={company}
                        column="website"
                        onUpdate={updateCompanyField}
                      />
                    </td>
                    <td className="hidden lg:table-cell px-4 py-2">
                      <EditableCell
                        value={company.city || ''}
                        row={company}
                        column="city"
                        onUpdate={updateCompanyField}
                      />
                    </td>
                    <td className="hidden lg:table-cell px-4 py-2">
                      <EditableCell
                        value={company.country || ''}
                        row={company}
                        column="country"
                        onUpdate={updateCompanyField}
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEdit(company)} 
                          title="Edit company"
                        >
                          <Building className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteCompany(company.id)} 
                          title="Delete company"
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
        
        {filteredCompanies.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredCompanies.length / itemsPerPage)}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalItems={filteredCompanies.length}
          />
        )}
      </div>
    </div>
  );
};
