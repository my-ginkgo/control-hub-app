
import { Button } from "@/components/ui/button";
import { LogOut, Save } from "lucide-react";

interface ProfileActionsProps {
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onSignOut: () => void;
  isSaving: boolean;
}

export const ProfileActions = ({
  isEditing,
  onSave,
  onCancel,
  onEdit,
  onSignOut,
  isSaving,
}: ProfileActionsProps) => {
  return (
    <div className="pt-4 space-y-3">
      {isEditing ? (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onSave}
            className="w-full border-[#383a5c] text-white hover:bg-[#2a2b3d]"
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Salva
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full border-[#383a5c] text-white hover:bg-[#2a2b3d]"
          >
            Annulla
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={onEdit}
          className="w-full border-[#383a5c] text-white hover:bg-[#2a2b3d]"
        >
          Modifica Profilo
        </Button>
      )}
      
      <Button
        variant="outline"
        onClick={onSignOut}
        className="w-full border-[#383a5c] text-white hover:bg-[#2a2b3d]"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
};
