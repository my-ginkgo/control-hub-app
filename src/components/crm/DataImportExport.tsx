
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
  Download, 
  Upload, 
  FileSpreadsheet 
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImportResult {
  item: string;
  status: 'success' | 'error';
  message: string;
}

interface DataImportExportProps {
  type: 'leads' | 'companies';
  onDataImported: () => void;
}

export const DataImportExport = ({ type, onDataImported }: DataImportExportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    } else {
      setImportFile(null);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      // Get current user ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!userData?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Fetch data from the database
      const { data, error } = await supabase
        .from(type)
        .select('*')
        .eq('user_id', userData.user.id);
      
      if (error) throw error;
      
      // In a real implementation, we would convert data to xlsx
      // For demo purposes, we're just creating a JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`${type === 'leads' ? 'Lead' : 'Aziende'} esportati con successo`);
    } catch (error: any) {
      console.error(`Error exporting ${type}:`, error);
      toast.error(`Errore durante l'esportazione: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Seleziona un file da importare');
      return;
    }

    setIsLoading(true);
    setImportResults([]);

    try {
      // Get current user ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!userData?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      // In a real implementation, we would parse the xlsx file
      // For demo purposes, we're just reading the file as text
      const fileContent = await importFile.text();
      let data;
      try {
        data = JSON.parse(fileContent);
      } catch (e) {
        throw new Error('Formato file non valido. Assicurati di importare un file JSON corretto.');
      }
      
      if (!Array.isArray(data)) {
        throw new Error('Il file deve contenere un array di dati');
      }
      
      // Process each item with basic validation
      const results: ImportResult[] = [];
      
      for (const item of data) {
        try {
          if (type === 'leads') {
            // Validate required fields for leads
            if (!item.first_name || !item.last_name) {
              results.push({
                item: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Sconosciuto',
                status: 'error',
                message: 'Nome e cognome sono obbligatori'
              });
              continue;
            }
          } else {
            // Validate required fields for companies
            if (!item.name) {
              results.push({
                item: item.name || 'Azienda sconosciuta',
                status: 'error',
                message: 'Il nome dell\'azienda è obbligatorio'
              });
              continue;
            }
          }
          
          // Add user_id to each item
          const itemWithUserId = {
            ...item,
            user_id: userData.user.id
          };
          
          // If the item has an id, update it; otherwise, insert it
          let operation;
          if (item.id) {
            operation = supabase
              .from(type)
              .update(itemWithUserId)
              .eq('id', item.id);
          } else {
            operation = supabase
              .from(type)
              .insert(itemWithUserId);
          }
          
          const { error: opError } = await operation;
          
          if (opError) {
            results.push({
              item: type === 'leads' 
                ? `${item.first_name || ''} ${item.last_name || ''}`.trim()
                : item.name || 'Sconosciuto',
              status: 'error',
              message: opError.message
            });
          } else {
            results.push({
              item: type === 'leads' 
                ? `${item.first_name || ''} ${item.last_name || ''}`.trim()
                : item.name || 'Sconosciuto',
              status: 'success',
              message: 'Importato con successo'
            });
          }
        } catch (error: any) {
          results.push({
            item: type === 'leads' 
              ? `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Sconosciuto'
              : item.name || 'Sconosciuto',
            status: 'error',
            message: error.message
          });
        }
      }
      
      setImportResults(results);
      
      const successCount = results.filter(r => r.status === 'success').length;
      if (successCount > 0) {
        toast.success(`Importati con successo ${successCount} ${type === 'leads' ? 'lead' : 'aziende'}`);
        onDataImported();
      }
    } catch (error: any) {
      console.error(`Error importing ${type}:`, error);
      toast.error(`Errore durante l'importazione: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when closing
      setImportFile(null);
      setImportResults([]);
      setActiveTab('import');
    }
  };

  const title = type === 'leads' ? 'Lead' : 'Aziende';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-emerald-700 hover:bg-emerald-800 text-white">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Importa/Esporta {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass">
        <DialogHeader>
          <DialogTitle>Importa/Esporta {title}</DialogTitle>
          <DialogDescription>
            Importa o esporta i tuoi {title.toLowerCase()} in formato JSON.
            In futuro sarà disponibile anche il formato XLSX.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'import' | 'export')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importa
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Esporta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="col-span-3"
                />
                <p className="text-xs text-muted-foreground">
                  Nota: Al momento è supportato solo il formato JSON. Il supporto per XLSX sarà disponibile in futuro.
                </p>
              </div>

              {importResults.length > 0 && (
                <div className="mt-4 max-h-[200px] overflow-y-auto border rounded-md p-2">
                  <h3 className="font-medium mb-2">Risultati dell'importazione:</h3>
                  <ul className="space-y-2">
                    {importResults.map((result, index) => (
                      <li 
                        key={index} 
                        className={`flex items-center gap-2 text-sm p-2 rounded-md ${
                          result.status === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}
                      >
                        {result.status === 'success' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span>{result.item}: </span>
                        <span className="text-muted-foreground">{result.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                onClick={handleImport} 
                disabled={isLoading || !importFile}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importazione in corso...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importa {title}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4 py-4">
            <div className="grid gap-4">
              <p>
                Esporta tutti i tuoi {title.toLowerCase()} in un file JSON.
              </p>

              <Button 
                onClick={handleExport} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Esportazione in corso...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Esporta {title}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto"
          >
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
