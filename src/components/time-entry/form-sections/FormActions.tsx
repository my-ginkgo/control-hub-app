
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
}

export function FormActions({
  isLoading,
  onCancel
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="bg-[#2a2b3d] border-[#383a5c] text-white hover:bg-[#383a5c]"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}
