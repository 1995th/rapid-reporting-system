import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Siren } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-12 max-w-3xl mx-auto px-4">
          {/* Logo Section */}
          <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full scale-150" />
              <Siren className="h-16 w-16 text-primary relative z-10" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              Rapid Reporting System
            </h1>
          </div>

          {/* Description */}
          <div className="space-y-6">
            <p className="text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Streamline your incident reporting process with our secure and efficient system designed for law enforcement professionals.
            </p>
            <p className="text-lg text-muted-foreground/80 max-w-xl mx-auto">
              Access comprehensive tools for documenting, managing, and analyzing incident reports in one centralized platform.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
            <Button
              size="lg"
              className="min-w-[200px] text-lg h-12 shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px] text-lg h-12 backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all"
              onClick={() => navigate("/auth?mode=signup")}
            >
              Register
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-sm text-muted-foreground/60">
            <p>Secure • Efficient • Reliable</p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-muted/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default Landing;