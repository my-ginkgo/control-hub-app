
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Settings } from "lucide-react";

export const ColorWidget = () => {
  const [colors, setColors] = useState({
    primary: "#9b87f5",
    secondary: "#7E69AB",
    accent: "#6E59A5",
    background: "#1A1F2C",
  });

  const handleColorChange = (colorKey: string, value: string) => {
    setColors((prev) => ({ ...prev, [colorKey]: value }));
    document.documentElement.style.setProperty(`--${colorKey}`, value);
    localStorage.setItem(`theme-${colorKey}`, value);
  };

  const resetColors = () => {
    const defaultColors = {
      primary: "#9b87f5",
      secondary: "#7E69AB",
      accent: "#6E59A5",
      background: "#1A1F2C",
    };

    Object.entries(defaultColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
      localStorage.removeItem(`theme-${key}`);
    });

    setColors(defaultColors);
    toast.success("Colori reimpostati ai valori predefiniti");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="ml-2">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Apri impostazioni colori</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizza Colori</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <Label htmlFor={key} className="w-24 capitalize">
                {key}
              </Label>
              <div className="flex-1 flex gap-4">
                <Input
                  type="color"
                  id={key}
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-16 h-8 p-1"
                />
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="flex-1"
                  placeholder={`Inserisci il codice colore per ${key}`}
                />
              </div>
            </div>
          ))}
          <Button onClick={resetColors} variant="outline" className="w-full mt-4">
            Reimposta Colori Predefiniti
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
