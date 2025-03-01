
import { User, Check } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserSelectProps {
  selectedUserId: string;
  onUserChange: (id: string) => void;
  className?: string;
  label?: string;
}

export function UserSelect({
  selectedUserId,
  onUserChange,
  className,
  label = "Utente Assegnato"
}: UserSelectProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [userSearch, setUserSearch] = useState("");
  const { session } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, email");
      
      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      setUsers(data.map(user => ({
        id: user.user_id,
        email: user.email || user.user_id
      })));
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (!session?.user) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-200">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between text-left font-normal bg-[#1a1b26] border-[#383a5c] text-white hover:bg-[#2a2b3d] h-10", className)}
          >
            {selectedUserId
              ? users.find((u) => u.id === selectedUserId)?.email
              : "Seleziona un utente..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0 bg-[#24253a] border-[#383a5c]"
          style={{ minWidth: "unset" }}
          align="start"
        >
          <Command className="bg-transparent">
            <CommandInput 
              placeholder="Cerca utente..." 
              value={userSearch}
              onValueChange={setUserSearch}
              className="h-9 text-white bg-[#1a1b26] border-b border-[#383a5c]"
            />
            <CommandList>
              <CommandEmpty className="text-gray-400 p-2">
                Nessun utente trovato.
              </CommandEmpty>
              <CommandGroup>
                {filteredUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => {
                      onUserChange(user.id);
                      setOpen(false);
                      setUserSearch("");
                    }}
                    className="flex items-center gap-2 hover:bg-[#2a2b3d] text-white p-2 cursor-pointer"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{user.email}</span>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedUserId === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
