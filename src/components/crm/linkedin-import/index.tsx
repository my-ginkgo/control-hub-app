
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
  Loader2, 
  Upload,
  FileSpreadsheet, 
  Linkedin, 
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PreviewTable } from './PreviewTable';
import { MappingConfiguration } from './MappingConfiguration';
import { ImportResults } from './ImportResults';
import { ImportProgressIndicator } from './ImportProgressIndicator';
import { processCSV } from './ImportProcessor';
import { parseCSVRow } from './utils';
import { ImportResult, LinkedInImportProps, ColumnMapping, LEAD_FIELDS, DEFAULT_LINKEDIN_MAPPING } from './types';

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
  const [importError, setImportError] = useState<string | null>(null);
  const [processedRows, setProcessedRows] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

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

  const updateColumnMapping = (csvColumn: string, leadField: string) => {
    setColumnMappings(prevMappings => {
      const filteredMappings = prevMappings.filter(m => m.csvColumn !== csvColumn);
      return [...filteredMappings, { csvColumn, leadField }];
    });
  };

  const getMappingForColumn = (csvColumn: string): string => {
    const mapping = columnMappings.find(m => m.csvColumn === csvColumn);
    return mapping ? mapping.leadField : '';
  };

  const handleProcessCSV = async () => {
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
    setImportError(null);
    setProcessedRows(0);
    
    await processCSV({
      importFile,
      columnMappings,
      onProgress: (processed, total, currentProgress) => {
        setProgress(currentProgress);
      },
      onError: (error) => {
        setImportError(`Errore durante l'importazione: ${error.message}`);
        toast.error(`Errore durante l'importazione: ${error.message}`);
        setIsLoading(false);
      },
      onComplete: (results) => {
        setImportResults(results);
        setProgress(100);
        setIsLoading(false);
        
        const successCount = results.filter(r => r.status === 'success').length;
        const updateCount = results.filter(r => r.status === 'warning').length;
        const errorCount = results.filter(r => r.status === 'error').length;
        
        if (successCount > 0 || updateCount > 0) {
          toast.success(`Importazione completata: ${successCount} nuovi lead, ${updateCount} aggiornati, ${errorCount} errori`);
          onLeadsImported();
        } else if (errorCount > 0) {
          setImportError(`L'importazione ha riscontrato ${errorCount} errori. Controlla i dettagli sotto.`);
          toast.error(`Importazione fallita: ${errorCount} errori`);
        } else {
          toast.error('Nessun lead importato con successo');
        }
      },
      setProcessedRows,
      setTotalRows
    });
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
      setImportError(null);
      setProcessedRows(0);
      setTotalRows(0);
    }
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                  <PreviewTable 
                    headers={headers}
                    previewData={previewData}
                    columnMappings={columnMappings}
                    getMappingForColumn={getMappingForColumn}
                    LEAD_FIELDS={LEAD_FIELDS}
                  />
                </TabsContent>
                
                <TabsContent value="mapping" className="pt-4">
                  <MappingConfiguration 
                    headers={headers}
                    getMappingForColumn={getMappingForColumn}
                    updateColumnMapping={updateColumnMapping}
                    LEAD_FIELDS={LEAD_FIELDS}
                  />
                </TabsContent>
              </Tabs>
            )}

            {isPreviewMode && !importResults.length && (
              <Button 
                onClick={handleProcessCSV}
                className="w-full bg-[#E50914] hover:bg-[#b2070f] text-white border-none"
                disabled={columnMappings.length === 0 || isLoading}
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

            <ImportProgressIndicator 
              isLoading={isLoading}
              progress={progress}
              processedRows={processedRows}
              totalRows={totalRows}
            />

            {importError && (
              <Alert variant="destructive" className="bg-red-950 border-red-800 text-white">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Errore di importazione</AlertTitle>
                <AlertDescription>
                  {importError}
                </AlertDescription>
              </Alert>
            )}

            <ImportResults results={importResults} />
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto bg-[#333333] hover:bg-[#4d4d4d] text-white border-none"
            disabled={isLoading}
          >
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
