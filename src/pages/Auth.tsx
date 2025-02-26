
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: `${firstName} ${lastName}`,
              first_name: firstName,
              last_name: lastName,
            },
          },
        });
        if (error) throw error;
        navigate("/profile-setup");
        toast.success("Please complete your profile!");
      } else {
        // Prima verifichiamo se l'utente è disabilitato
        const { data: userRole } = await supabase
          .from("user_roles")
          .select("is_disabled")
          .eq("email", email)
          .maybeSingle();

        if (userRole?.is_disabled) {
          throw new Error("L'account è stato disabilitato. Contatta l'amministratore.");
        }

        // Se l'utente non è disabilitato, procediamo con il login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1b26] px-4">
      <Card className="w-full max-w-md p-6 bg-[#24253a] border-[#383a5c]">
        <div className="flex justify-center mb-6">
          <img src="logo.png" alt="Logo" className="w-20 h-20" />
        </div>
        <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-red-700 to-amber-400 bg-clip-text text-transparent">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required={isSignUp}
                  className="bg-[#1a1b26] border-[#383a5c] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required={isSignUp}
                  className="bg-[#1a1b26] border-[#383a5c] text-white"
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#1a1b26] border-[#383a5c] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#1a1b26] border-[#383a5c] text-white"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-700 to-amber-400 hover:from-red-800 hover:to-amber-600">
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-sm text-gray-400 hover:text-white transition-colors">
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </form>
      </Card>
    </div>
  );
}

