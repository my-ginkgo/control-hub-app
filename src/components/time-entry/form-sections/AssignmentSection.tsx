
import { UserSelect } from "../UserSelect";

interface AssignmentSectionProps {
  assignedUser: string;
  setAssignedUser: (userId: string) => void;
}

export function AssignmentSection({
  assignedUser,
  setAssignedUser
}: AssignmentSectionProps) {
  return (
    <UserSelect
      selectedUserId={assignedUser}
      onUserChange={setAssignedUser}
      className="bg-[#1a1b26] border-[#383a5c] text-white"
      label="Assigned To"
    />
  );
}
