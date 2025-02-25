
import { useTheme } from "@/components/ThemeProvider";

export const Logo = () => {
  const { theme } = useTheme();
  
  return (
    <img 
      src={theme === 'dark' 
        ? '/lovable-uploads/fd769773-3c7e-4b8d-a4c0-72ccea092638.png'  // white text version
        : '/lovable-uploads/5a264502-242c-4208-bc1c-609fbce297f1.png'  // black text version
      }
      alt="Gruppo4D Logo"
      className="h-8 w-auto"
    />
  );
};
