
import { useState } from 'react';
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
  Linkedin 
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

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

export const LinkedInImport = ({ onLeadsImported, triggerId }: LinkedInImportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      // Reset previous results
      setImportResults([]);
      setPreviewData([]);
      setIsPreviewMode(false);
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
      
      // Parse the header row to get column names
      const headers = parseCSVRow(rows[0]);
      
      // Preview just a few rows for performance
      const previewRows = rows.slice(1, Math.min(6, rows.length)).map(row => {
        const values = parseCSVRow(row);
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {} as Record<string, string>);
      });
      
      setPreviewData(previewRows);
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
    
    // Add the last value
    values.push(currentValue);
    
    return values;
  };

  const processCSV = async () => {
    if (!importFile) {
      toast.error('Seleziona un file da importare');
      return;
    }

    setIsLoading(true);
    setImportResults([]);
    setProgress(0);
    
    try {
      // Get current user ID
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
      
      // Parse the header row to get column names
      const headers = parseCSVRow(rows[0]);
      
      // Check for required columns
      const requiredColumns = ['firstName', 'lastName', 'uniqueLeadId'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        throw new Error(`Colonne obbligatorie mancanti: ${missingColumns.join(', ')}`);
      }
      
      const results: ImportResult[] = [];
      const dataRows = rows.slice(1); // Skip header row
      
      for (let i = 0; i < dataRows.length; i++) {
        try {
          const row = dataRows[i];
          if (!row.trim()) continue; // Skip empty rows
          
          const values = parseCSVRow(row);
          
          // Map CSV data to lead object
          const leadData: any = headers.reduce((obj, header, index) => {
            let value = values[index] || '';
            
            // Skip empty values
            if (value === '' || value.toLowerCase() === 'nan') {
              return obj;
            }
            
            // Map LinkedIn data fields to our Lead model
            switch (header) {
              case 'firstName':
                obj.first_name = value;
                break;
              case 'lastName':
                obj.last_name = value;
                break;
              case 'businessEmail':
              case 'email':
                // Use businessEmail if available, otherwise use email
                if (!obj.email || header === 'businessEmail') {
                  obj.email = value;
                }
                break;
              case 'phone':
                obj.phone = value;
                break;
              case 'occupation':
                obj.job_title = value;
                break;
              case 'profileUrl':
                obj.linkedin_url = value;
                break;
              case 'twitter':
                obj.twitter_url = value;
                break;
              case 'leadTags':
                // Convert comma-separated tags to array
                obj.tags = value.split(',').map((tag: string) => tag.trim());
                break;
              case 'currentCompany':
                obj.company_name = value; // Will handle company linking later
                break;
              case '_status':
                // Map LinkedIn status to our lead status
                if (value.toLowerCase() === 'accepted') {
                  obj.status = 'contacted';
                } else if (value.toLowerCase() === 'pending') {
                  obj.status = 'new';
                } else if (value.toLowerCase().includes('qualified')) {
                  obj.status = 'qualified';
                }
                break;
              case 'lastStepExecution':
                if (value) {
                  try {
                    // Parse date if possible
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                      obj.last_contact_date = date.toISOString();
                    }
                  } catch (e) {
                    // Ignore date parsing errors
                  }
                }
                break;
              case 'leadConversation':
                obj.notes = value;
                break;
              case 'campaignName':
                // Add campaign name to notes
                obj.notes = obj.notes 
                  ? `${obj.notes}\n\nCampaign: ${value}`
                  : `Campaign: ${value}`;
                break;
            }
            
            return obj;
          }, {} as Record<string, any>);
          
          // Add user_id 
          leadData.user_id = userData.user.id;
          
          // Set lead score based on interaction state
          const acceptedConnection = values[headers.indexOf('isConnectionAcceptedDetected')]?.toLowerCase() === 'yes';
          if (acceptedConnection) {
            leadData.lead_score = 70; // Higher score for accepted connections
          } else {
            leadData.lead_score = 30; // Lower score for pending/discovered
          }
          
          // Set source
          leadData.source = 'linkedin';
          
          // Set communication preference
          leadData.communication_preference = 'in-person';
          
          // Check if this lead exists (using uniqueLeadId stored in notes)
          const uniqueLeadId = values[headers.indexOf('uniqueLeadId')];
          const { data: existingLeads } = await supabase
            .from('leads')
            .select('id, notes')
            .like('notes', `%LinkedIn ID: ${uniqueLeadId}%`);
          
          // Add LinkedIn ID to notes
          leadData.notes = leadData.notes 
            ? `${leadData.notes}\n\nLinkedIn ID: ${uniqueLeadId}` 
            : `LinkedIn ID: ${uniqueLeadId}`;
          
          let result;
          
          if (existingLeads && existingLeads.length > 0) {
            // Update existing lead
            const { error } = await supabase
              .from('leads')
              .update(leadData)
              .eq('id', existingLeads[0].id);
            
            if (error) throw error;
            
            result = {
              firstName: leadData.first_name,
              lastName: leadData.last_name,
              status: 'warning' as const,
              message: 'Lead aggiornato'
            };
          } else {
            // Insert new lead
            const { error } = await supabase
              .from('leads')
              .insert(leadData);
            
            if (error) throw error;
            
            result = {
              firstName: leadData.first_name,
              lastName: leadData.last_name,
              status: 'success' as const,
              message: 'Lead inserito con successo'
            };
          }
          
          results.push(result);
        } catch (error: any) {
          console.error('Error processing row:', error);
          
          // Add error result
          results.push({
            firstName: values?.[headers.indexOf('firstName')] || 'Unknown',
            lastName: values?.[headers.indexOf('lastName')] || 'Unknown',
            status: 'error',
            message: `Errore: ${error.message}`
          });
        }
        
        // Update progress
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
      // Reset state when closing
      setImportFile(null);
      setImportResults([]);
      setProgress(0);
      setPreviewData([]);
      setIsPreviewMode(false);
    }
  };

  const renderPreview = () => {
    if (!previewData.length) return null;
    
    const keys = Object.keys(previewData[0]).slice(0, 5); // Show only first 5 columns for preview
    
    return (
      <div className="mt-4 border rounded overflow-hidden">
        <ScrollArea className="h-[200px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                {keys.map(key => (
                  <th key={key} className="p-2 text-left font-medium">{key}</th>
                ))}
                <th className="p-2 text-left font-medium">...</th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, i) => (
                <tr key={i} className="border-t">
                  {keys.map(key => (
                    <td key={key} className="p-2 truncate max-w-[200px]">{row[key]}</td>
                  ))}
                  <td className="p-2">...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
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
      <DialogContent className="sm:max-w-[600px] bg-[#141414] border border-[#333333] text-white">
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
                    Anteprima File
                  </>
                )}
              </Button>
            )}

            {renderPreview()}

            {isPreviewMode && !importResults.length && (
              <Button 
                onClick={processCSV}
                className="w-full bg-[#E50914] hover:bg-[#b2070f] text-white border-none"
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
