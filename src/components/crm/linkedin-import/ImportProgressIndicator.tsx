
import { Progress } from '@/components/ui/progress';

interface ImportProgressIndicatorProps {
  isLoading: boolean;
  progress: number;
  processedRows: number;
  totalRows: number;
}

export const ImportProgressIndicator = ({ 
  isLoading, 
  progress, 
  processedRows, 
  totalRows 
}: ImportProgressIndicatorProps) => {
  if (!isLoading) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Processando riga {processedRows} di {totalRows}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};
