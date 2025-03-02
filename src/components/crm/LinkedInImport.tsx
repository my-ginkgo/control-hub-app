
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Check, 
  X, 
  Loader2, 
  Upload,
  FileSpreadsheet, 
  Linkedin, 
  ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImportResult {
  firstName: string;
  lastName: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

interface LinkedInImportProps {
  onLeadsImported: () => void;
  triggerId?: string;
}

interface ColumnMapping {
  csvColumn: string;
  leadField: string;
}

// Lead fields available for mapping
const LEAD_FIELDS = [
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

// Default mapping for LinkedIn CSV
const DEFAULT_LINKEDIN_MAPPING: ColumnMapping[] = [
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

export const LinkedInImport = ({ onLeadsImported, triggerId }: LinkedInImportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);

  // Reset configurations when file changes
  useEffect(() => {
    if (importFile) {
      setColumnMappings([]);
      setHeaders([]);
      setPreviewData([]);
    }
  }, [importFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportResults([]);
      setPreviewData([]);
      setIsPreviewMode(false);
      setActiveTab('preview');
    } else {
      setImportFile(null);
    }
  };

  const previewCSV = async () => {
    if (!importFile) {
      toast.error('Seleziona un file da importare');
      return;
    }

    setIsLoading(true);
    setIsPreviewMode(true);
    
    try {
      const text = await importFile.text();
      const rows = text.split('\n');
      
      if (rows.length < 2) {
        throw new Error('Il file non contiene dati validi.');
      }
      
      const fileHeaders = parseCSVRow(rows[0]);
      setHeaders(fileHeaders);
      
      const previewRows = rows.slice(1, Math.min(6, rows.length)).map(row => {
        const values = parseCSVRow(row);
        return fileHeaders.reduce((obj, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {} as Record<string, string>);
      });
      
      setPreviewData(previewRows);
      
      // Auto-populate mappings based on LinkedIn defaults
      const initialMappings: ColumnMapping[] = [];
      fileHeaders.forEach(header => {
        const defaultMapping = DEFAULT_LINKEDIN_MAPPING.find(m => m.csvColumn === header);
        if (defaultMapping) {
          initialMappings.push(defaultMapping);
        }
      });
      
      setColumnMappings(initialMappings);
    } catch (error: any) {
      console.error('Error previewing CSV:', error);
      toast.error(`Errore durante l'anteprima: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const parseCSVRow = (row: string): string[] => {
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    values.push(currentValue);
    
    return values;
  };

  // Update a specific column mapping
  const updateColumnMapping = (csvColumn: string, leadField: string) => {
    setColumnMappings(prevMappings => {
      // Remove any existing mapping for this CSV column
      const filteredMappings = prevMappings.filter(m => m.csvColumn !== csvColumn);
      
      // Add the new mapping
      return [...filteredMappings, { csvColumn, leadField }];
    });
  };

  // Check if a mapping exists for a column
  const getMappingForColumn = (csvColumn: string): string => {
    const mapping = columnMappings.find(m => m.csvColumn === csvColumn);
    return mapping ? mapping.leadField : '';
  };

  const processCSV = async () => {
    if (!importFile) {
      toast.error('Seleziona un file da importare');
      return;
    }

    if (columnMappings.length === 0) {
      toast.error('Configura almeno una mappatura delle colonne prima di importare');
      return;
    }

    setIsLoading(true);
    setImportResults([]);
    setProgress(0);
    
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!userData?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      const text = await importFile.text();
      const rows = text.split('\n');
      
      if (rows.length < 2) {
        throw new Error('Il file non contiene dati validi.');
      }
      
      const fileHeaders = parseCSVRow(rows[0]);
      
      // Ensure we have uniqueLeadId or some identifier
      if (!fileHeaders.includes('uniqueLeadId') && !fileHeaders.includes('profileUrl')) {
        throw new Error('Il file deve contenere un identificatore univoco (uniqueLeadId o profileUrl)');
      }
      
      const results: ImportResult[] = [];
      const dataRows = rows.slice(1);
      
      for (let i = 0; i < dataRows.length; i++) {
        try {
          const row = dataRows[i];
          if (!row.trim()) continue;
          
          const values = parseCSVRow(row);
          
          const leadData: any = {
            user_id: userData.user.id,
            source: 'linkedin'
          };
          
          // Apply custom mappings based on configuration
          columnMappings.forEach(mapping => {
            const columnIndex = fileHeaders.indexOf(mapping.csvColumn);
            if (columnIndex !== -1) {
              let value = values[columnIndex] || '';
              
              if (value === '' || value.toLowerCase() === 'nan') {
                return;
              }
              
              switch (mapping.leadField) {
                case 'tags':
                  leadData.tags = value.split(',').map((tag: string) => tag.trim());
                  break;
                case 'status':
                  if (value.toLowerCase() === 'accepted') {
                    leadData.status = 'contacted';
                  } else if (value.toLowerCase() === 'pending') {
                    leadData.status = 'new';
                  } else if (value.toLowerCase().includes('qualified')) {
                    leadData.status = 'qualified';
                  }
                  break;
                case 'last_contact_date':
                  if (value) {
                    try {
                      const date = new Date(value);
                      if (!isNaN(date.getTime())) {
                        leadData.last_contact_date = date.toISOString();
                      }
                    } catch (e) {
                      // Ignore date parsing errors
                    }
                  }
                  break;
                default:
                  leadData[mapping.leadField] = value;
                  break;
              }
            }
          });
          
          // Handle special fields not in standard mapping
          const uniqueLeadId = values[fileHeaders.indexOf('uniqueLeadId')] || 
                              values[fileHeaders.indexOf('profileUrl')] || '';
                              
          // Check for accepted connection
          const connectionColumnIndex = fileHeaders.indexOf('isConnectionAcceptedDetected');
          if (connectionColumnIndex !== -1) {
            const acceptedConnection = values[connectionColumnIndex]?.toLowerCase() === 'yes';
            if (acceptedConnection) {
              leadData.lead_score = 70;
            } else {
              leadData.lead_score = 30;
            }
          }
          
          // Add the LinkedIn ID to notes for tracking
          leadData.notes = leadData.notes 
            ? `${leadData.notes}\n\nLinkedIn ID: ${uniqueLeadId}`
            : `LinkedIn ID: ${uniqueLeadId}`;
          
          // Add campaign name if available
          const campaignColumnIndex = fileHeaders.indexOf('campaignName');
          if (campaignColumnIndex !== -1 && values[campaignColumnIndex]) {
            leadData.notes = leadData.notes 
              ? `${leadData.notes}\n\nCampaign: ${values[campaignColumnIndex]}`
              : `Campaign: ${values[campaignColumnIndex]}`;
          }
          
          // Set default communication preference if not mapped
          if (!leadData.communication_preference) {
            leadData.communication_preference = 'in-person';
          }
          
          // Check if lead already exists
          const { data: existingLeads } = await supabase
            .from('leads')
            .select('id, notes')
            .like('notes', `%LinkedIn ID: ${uniqueLeadId}%`);
          
          let result;
          
          if (existingLeads && existingLeads.length > 0) {
            const { error } = await supabase
              .from('leads')
              .update(leadData)
              .eq('id', existingLeads[0].id);
            
            if (error) throw error;
            
            result = {
              firstName: leadData.first_name || 'Unknown',
              lastName: leadData.last_name || 'Unknown',
              status: 'warning' as const,
              message: 'Lead aggiornato'
            };
          } else {
            const { error } = await supabase
              .from('leads')
              .insert(leadData);
            
            if (error) throw error;
            
            result = {
              firstName: leadData.first_name || 'Unknown',
              lastName: leadData.last_name || 'Unknown',
              status: 'success' as const,
              message: 'Lead inserito con successo'
            };
          }
          
          results.push(result);
        } catch (error: any) {
          console.error('Error processing row:', error);
          
          const currentValues = parseCSVRow(dataRows[i]);
          const firstNameIdx = fileHeaders.indexOf('firstName');
          const lastNameIdx = fileHeaders.indexOf('lastName');
          
          results.push({
            firstName: firstNameIdx !== -1 ? currentValues[firstNameIdx] || 'Unknown' : 'Unknown',
            lastName: lastNameIdx !== -1 ? currentValues[lastNameIdx] || 'Unknown' : 'Unknown',
            status: 'error',
            message: `Errore: ${error.message}`
          });
        }
        
        setProgress(Math.floor(((i + 1) / dataRows.length) * 100));
      }
      
      setImportResults(results);
      
      const successCount = results.filter(r => r.status === 'success').length;
      const updateCount = results.filter(r => r.status === 'warning').length;
      
      if (successCount > 0 || updateCount > 0) {
        toast.success(`Importazione completata: ${successCount} nuovi lead, ${updateCount} aggiornati`);
        onLeadsImported();
      } else {
        toast.error('Nessun lead importato con successo');
      }
    } catch (error: any) {
      console.error('Error importing leads:', error);
      toast.error(`Errore durante l'importazione: ${error.message}`);
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setImportFile(null);
      setImportResults([]);
      setProgress(0);
      setPreviewData([]);
      setIsPreviewMode(false);
      setActiveTab('preview');
      setColumnMappings([]);
    }
  };

  const renderPreview = () => {
    if (!previewData.length) return null;
    
    return (
      <div className="mt-4 border rounded overflow-hidden">
        <ScrollArea className="h-[200px]">
          <div className="overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  {headers.map(header => (
                    <th key={header} className="p-2 text-left font-medium border-b whitespace-nowrap">
                      {header}
                      {columnMappings.some(m => m.csvColumn === header) && (
                        <div className="text-xs text-green-500 font-normal">
                          ↳ {LEAD_FIELDS.find(f => f.value === getMappingForColumn(header))?.label || ''}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} className="border-t">
                    {headers.map(header => (
                      <td key={`${i}-${header}`} className="p-2 border-b whitespace-nowrap max-w-[200px] truncate">
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderMapping = () => {
    if (!headers.length) return null;
    
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Configura la mappatura tra le colonne del CSV e i campi dell'anagrafica lead
        </p>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {headers.map(header => (
            <div key={header} className="flex items-center gap-2">
              <div className="w-1/3 text-sm font-medium truncate" title={header}>
                {header}
              </div>
              
              <ArrowRight className="h-4 w-4 text-gray-400" />
              
              <div className="flex-1">
                <Select
                  value={getMappingForColumn(header)}
                  onValueChange={(value) => updateColumnMapping(header, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona campo lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Non mappare</SelectItem>
                    {LEAD_FIELDS.map(field => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          id={triggerId}
          variant="outline" 
          className="hidden"
        >
          <Linkedin className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-[#141414] border border-[#333333] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <Linkedin className="h-5 w-5" /> 
            Importa Lead da LinkedIn Sales Navigator
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Importa i tuoi lead da un'esportazione CSV di LinkedIn Sales Navigator o Skylead.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Input
                id="import-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="col-span-3 bg-[#333333] border-none text-white"
              />
              <p className="text-xs text-gray-400">
                Il file deve essere in formato CSV e contenere le colonne necessarie come uniqueLeadId, 
                firstName, lastName, ecc.
              </p>
            </div>

            {importFile && !isPreviewMode && !importResults.length && (
              <Button 
                onClick={previewCSV}
                className="w-full bg-[#333333] hover:bg-[#4d4d4d] text-white border-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisi in corso...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Analizza File
                  </>
                )}
              </Button>
            )}

            {isPreviewMode && !importResults.length && (
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-[#333333] text-gray-400">
                  <TabsTrigger 
                    value="preview" 
                    className="data-[state=active]:bg-[#4d4d4d] data-[state=active]:text-white"
                  >
                    Anteprima Dati
                  </TabsTrigger>
                  <TabsTrigger 
                    value="mapping" 
                    className="data-[state=active]:bg-[#4d4d4d] data-[state=active]:text-white"
                  >
                    Configurazione Mappatura
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="pt-4">
                  {renderPreview()}
                </TabsContent>
                
                <TabsContent value="mapping" className="pt-4">
                  {renderMapping()}
                </TabsContent>
              </Tabs>
            )}

            {isPreviewMode && !importResults.length && (
              <Button 
                onClick={processCSV}
                className="w-full bg-[#E50914] hover:bg-[#b2070f] text-white border-none"
                disabled={columnMappings.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importazione in corso...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importa Lead
                  </>
                )}
              </Button>
            )}

            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-gray-400">
                  {progress}% completato
                </p>
              </div>
            )}

            {importResults.length > 0 && (
              <div className="mt-4 max-h-[200px] overflow-y-auto border border-[#333333] rounded-md p-2">
                <h3 className="font-medium mb-2 text-white">Risultati dell'importazione:</h3>
                <ScrollArea className="h-[200px]">
                  <ul className="space-y-2">
                    {importResults.map((result, index) => (
                      <li 
                        key={index} 
                        className={`flex items-center gap-2 text-sm p-2 rounded-md ${
                          result.status === 'success' ? 'bg-green-500/10' : 
                          result.status === 'warning' ? 'bg-yellow-500/10' : 
                          'bg-red-500/10'
                        }`}
                      >
                        {result.status === 'success' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : result.status === 'warning' ? (
                          <Check className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span>{result.firstName} {result.lastName}: </span>
                        <span className="text-gray-400">{result.message}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto bg-[#333333] hover:bg-[#4d4d4d] text-white border-none"
          >
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
