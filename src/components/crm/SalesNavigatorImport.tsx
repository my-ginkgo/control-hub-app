
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
  AlertCircle, 
  Linkedin 
} from 'lucide-react';
import { toast } from 'sonner';

interface ImportResult {
  lead: string;
  status: 'success' | 'error';
  message: string;
}

interface SalesNavigatorImportProps {
  onLeadsImported: () => void;
}

export const SalesNavigatorImport = ({ onLeadsImported }: SalesNavigatorImportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [linkedinToken, setLinkedinToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);

  const handleImport = async () => {
    if (!linkedinToken) {
      toast.error('Please enter your LinkedIn Sales Navigator token');
      return;
    }

    setIsLoading(true);
    setImportResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('salesNavigatorImport', {
        body: { linkedinToken },
      });

      if (error) throw error;

      setImportResults(data.imported);
      
      const successCount = data.imported.filter((r: ImportResult) => r.status === 'success').length;
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} leads`);
        onLeadsImported();
      }
    } catch (error: any) {
      console.error('Error importing leads:', error);
      toast.error(`Error importing leads: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when closing
      setLinkedinToken('');
      setImportResults([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-[#0077b5] hover:bg-[#0077b5]/90 text-white">
          <Linkedin className="mr-2 h-4 w-4" />
          Import from Sales Navigator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass">
        <DialogHeader>
          <DialogTitle>Import Leads from LinkedIn Sales Navigator</DialogTitle>
          <DialogDescription>
            Enter your Sales Navigator access token to import your saved leads.
            This will add them to your CRM database.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              id="linkedin-token"
              placeholder="LinkedIn Sales Navigator token"
              value={linkedinToken}
              onChange={(e) => setLinkedinToken(e.target.value)}
              className="col-span-3"
            />
            <p className="text-xs text-muted-foreground">
              Note: In a production environment, this would use LinkedIn's OAuth flow.
              For demo purposes, any text in the field will simulate an import.
            </p>
          </div>

          {importResults.length > 0 && (
            <div className="mt-4 max-h-[200px] overflow-y-auto border rounded-md p-2">
              <h3 className="font-medium mb-2">Import Results:</h3>
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
                    <span>{result.lead}: </span>
                    <span className="text-muted-foreground">{result.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={isLoading || !linkedinToken}
            className="bg-[#0077b5] hover:bg-[#0077b5]/90 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Import Leads
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
