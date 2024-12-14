import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-9 px-0 relative"
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${
        theme === 'dark' ? 'scale-0 rotate-90' : 'scale-100 rotate-0'
      }`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
        theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
      }`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}