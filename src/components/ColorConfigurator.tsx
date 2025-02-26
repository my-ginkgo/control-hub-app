
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { colors, darkColors, lightColors, themeColors } from "@/styles/colors";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ColorConfig = typeof lightColors;

export function ColorConfigurator() {
  const [lightConfig, setLightConfig] = useState<ColorConfig>(lightColors);
  const [darkConfig, setDarkConfig] = useState<ColorConfig>(darkColors);

  const downloadConfig = () => {
    const config = {
      light: lightConfig,
      dark: darkConfig,
      gradients: colors.gradients,
      theme: colors.theme
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "theme-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Configurazione scaricata con successo!");
  };

  const updateColor = (theme: "light" | "dark", path: string[], value: string) => {
    const config = theme === "light" ? lightConfig : darkConfig;
    const setConfig = theme === "light" ? setLightConfig : setDarkConfig;
    
    let current: any = {...config};
    const lastKey = path[path.length - 1];
    let pointer = current;
    
    // Navigate to the nested object
    for (let i = 0; i < path.length - 1; i++) {
      if (!pointer[path[i]]) pointer[path[i]] = {};
      pointer = pointer[path[i]];
    }
    
    // Update the value
    pointer[lastKey] = value;
    setConfig(current);
  };

  const renderColorSection = (theme: "light" | "dark", section: string, colors: any, path: string[] = []) => {
    return Object.entries(colors).map(([key, value]: [string, any]) => {
      const currentPath = [...path, key];
      
      if (typeof value === "object" && value !== null) {
        return (
          <div key={key} className="space-y-4 mb-6">
            <h3 className="font-semibold capitalize">{key}</h3>
            <div className="grid gap-4 pl-4">
              {renderColorSection(theme, key, value, currentPath)}
            </div>
          </div>
        );
      }

      return (
        <div key={key} className="grid grid-cols-2 gap-4 items-center">
          <Label className="capitalize">{key}</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={value}
              onChange={(e) => updateColor(theme, currentPath, e.target.value)}
              className="flex-1"
            />
            <div 
              className="w-10 h-10 rounded border"
              style={{ backgroundColor: value }}
            />
          </div>
        </div>
      );
    });
  };

  const ThemeSelector = ({ theme, section }: { theme: "light" | "dark", section: string }) => (
    <div className="mb-4">
      <Label>Predefined {section} Colors</Label>
      <Select onValueChange={(value) => {
        if (section === "time") {
          updateColor(theme, ["primary", "DEFAULT"], themeColors.time[value as keyof typeof themeColors.time]);
        }
      }}>
        <SelectTrigger>
          <SelectValue placeholder="Select a color" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(themeColors[section as keyof typeof themeColors]).map(([key, value]) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: value }} />
                <span className="capitalize">{key}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Theme Configuration</h2>
        <Button onClick={downloadConfig} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Config
        </Button>
      </div>

      <Tabs defaultValue="light" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="light">Light Theme</TabsTrigger>
          <TabsTrigger value="dark">Dark Theme</TabsTrigger>
        </TabsList>
        
        <TabsContent value="light" className="space-y-6">
          <ThemeSelector theme="light" section="time" />
          {renderColorSection("light", "root", lightConfig)}
        </TabsContent>
        
        <TabsContent value="dark" className="space-y-6">
          <ThemeSelector theme="dark" section="time" />
          {renderColorSection("dark", "root", darkConfig)}
        </TabsContent>
      </Tabs>
    </Card>
  );
}

