
import { useTheme } from "@/components/ThemeProvider";

export const Logo = () => {
  const { theme } = useTheme();
  
  return (
    <img 
      src="https://gruppo4d.com/favicon.svg"
      alt="Gruppo4D Logo"
      className="h-8 w-auto"
    />
  );
};
