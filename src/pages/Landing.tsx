import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Siren } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="absolute h-full w-full">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-50 animate-pulse delay-1000" />
      </div>
      
      {/* Content */}
      I'll help update the landing page with a cleaner glassmorphism design and reduce the text content while maintaining the professional look.

<lov-code>
Let's update the Landing page and add glassmorphism utilities to the Tailwind config:

<lov-write file_path="src/pages/Landing.tsx">
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Siren } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted">
      {/* Gradient orbs for visual interest */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-morphism p-8 rounded-2xl max-w-2xl mx-auto">
          {/* Logo Section */}
          <div className="flex items-center justify-center gap-4 mb-12 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full scale-150" />
              <Siren className="h-16 w-16 text-primary relative z-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Rapid Reporting System
            </h1>
          </div>

          {/* Description - Reduced text */}
          <p className="text-xl text-muted-foreground/80 max-w-xl mx-auto mb-12">
            Secure and efficient incident reporting system for law enforcement professionals.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="min-w-[200px] text-lg h-12 shadow-lg hover:shadow-xl transition-all glass-button"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px] text-lg h-12 glass-morphism hover:bg-background/80 transition-all"
              onClick={() => navigate("/auth?mode=signup")}
            >
              Register
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;