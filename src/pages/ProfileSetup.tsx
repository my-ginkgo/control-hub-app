
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Check if user is authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        toast.error("Please sign in first");
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user.id) throw new Error("No user ID found");

      const { error } = await supabase
        .from("profiles")
        .update({
          bio,
          job_title: jobTitle,
          date_of_birth: dateOfBirth || null,
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1b26] px-4">
      <Card className="w-full max-w-md p-6 bg-[#24253a] border-[#383a5c]">
        <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-red-700 to-amber-400 bg-clip-text text-transparent">
          Complete Your Profile
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="bg-[#1a1b26] border-[#383a5c] text-white"
              placeholder="e.g. Software Developer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="bg-[#1a1b26] border-[#383a5c] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-[#1a1b26] border-[#383a5c] text-white min-h-[100px]"
              placeholder="Tell us about yourself..."
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-700 to-amber-400 hover:from-red-800 hover:to-amber-600">
            {loading ? "Saving..." : "Complete Profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
