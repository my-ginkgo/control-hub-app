
import { supabase } from '@/integrations/supabase/client';
import { ColumnMapping, ImportResult } from './types';
import { parseCSVRow } from './utils';

export interface ProcessCSVParams {
  importFile: File;
  columnMappings: ColumnMapping[];
  onProgress: (processed: number, total: number, progress: number) => void;
  onError: (error: Error) => void;
  onComplete: (results: ImportResult[]) => void;
  setProcessedRows: (value: number) => void;
  setTotalRows: (value: number) => void;
}

export const processCSV = async ({
  importFile,
  columnMappings,
  onProgress,
  onError,
  onComplete,
  setProcessedRows,
  setTotalRows
}: ProcessCSVParams) => {
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
    
    if (!fileHeaders.includes('uniqueLeadId') && !fileHeaders.includes('profileUrl')) {
      throw new Error('Il file deve contenere un identificatore univoco (uniqueLeadId o profileUrl)');
    }
    
    const results: ImportResult[] = [];
    const dataRows = rows.slice(1);
    setTotalRows(dataRows.length);
    
    for (let i = 0; i < dataRows.length; i++) {
      try {
        const row = dataRows[i];
        if (!row.trim()) {
          setProcessedRows(prev => prev + 1);
          continue;
        }
        
        const values = parseCSVRow(row);
        
        const leadData: any = {
          user_id: userData.user.id,
          source: 'linkedin'
        };
        
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
        
        const uniqueLeadId = values[fileHeaders.indexOf('uniqueLeadId')] || 
                            values[fileHeaders.indexOf('profileUrl')] || '';
                            
        if (values[fileHeaders.indexOf('isConnectionAcceptedDetected')]) {
          const acceptedConnection = values[fileHeaders.indexOf('isConnectionAcceptedDetected')].toLowerCase() === 'yes';
          if (acceptedConnection) {
            leadData.lead_score = 70;
          } else {
            leadData.lead_score = 30;
          }
        }
        
        leadData.notes = leadData.notes 
          ? `${leadData.notes}\n\nLinkedIn ID: ${uniqueLeadId}`
          : `LinkedIn ID: ${uniqueLeadId}`;
        
        const campaignColumnIndex = fileHeaders.indexOf('campaignName');
        if (campaignColumnIndex !== -1 && values[campaignColumnIndex]) {
          leadData.notes = leadData.notes 
            ? `${leadData.notes}\n\nCampaign: ${values[campaignColumnIndex]}`
            : `Campaign: ${values[campaignColumnIndex]}`;
        }
        
        if (!leadData.communication_preference) {
          leadData.communication_preference = 'in-person';
        }
        
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
            message: 'Lead aggiornato',
            rowNumber: i + 1
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
            message: 'Lead inserito con successo',
            rowNumber: i + 1
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
          message: `Errore: ${error.message}`,
          rowNumber: i + 1
        });
      }
      
      setProcessedRows(prev => prev + 1);
      const currentProgress = Math.floor(((i + 1) / dataRows.length) * 100);
      onProgress(i + 1, dataRows.length, currentProgress);
    }
    
    onComplete(results);
    
  } catch (error: any) {
    console.error('Error importing leads:', error);
    onError(error);
  }
};
