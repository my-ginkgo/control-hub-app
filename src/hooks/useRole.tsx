
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export type UserRole = "ADMIN" | "DIPENDENTE";

export function useRole() {
  const { session } = useAuth();

  const { data: role, isLoading } = useQuery({
    queryKey: ["role", session?.user?.id],
    queryFn: async (): Promise<UserRole> => {
      if (!session?.user?.id) throw new Error("No user ID");

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;
      return data?.role || "DIPENDENTE";
    },
    enabled: !!session?.user?.id,
  });

  return { role, isLoading };
}
