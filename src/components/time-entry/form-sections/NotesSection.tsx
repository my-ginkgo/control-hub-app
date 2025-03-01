
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
}

export function NotesSection({
  notes,
  setNotes
}: NotesSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes" className="text-gray-200">Notes</Label>
      <Textarea 
        id="notes" 
        value={notes} 
        onChange={(e) => setNotes(e.target.value)}
        className="bg-[#1a1b26] border-[#383a5c] text-white h-20"
      />
    </div>
  );
}
