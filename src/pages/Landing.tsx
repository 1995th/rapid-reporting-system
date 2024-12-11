import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted">
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col items-center justify-center">
        {/* Logo and text at the top */}
        <div className="mb-12 animate-fade-in text-center">
          <div className="glass-morphism p-6 rounded-full inline-flex flex-col items-center">
            <h1 className="text-2xl font-bold text-primary">IncidentFlow</h1>
            <p className="text-sm text-muted-foreground mt-2">Incident Management System</p>
          </div>
        </div>

        <div className="space-y-8 text-center max-w-3xl">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in">
              Streamline Your
              <span className="text-primary block mt-2">
                Incident Reporting
              </span>
            </h1>
            <p className="text-xl text-muted-foreground/80 animate-fade-in delay-200">
              Modern, efficient, and secure reporting system designed for law enforcement professionals.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4 animate-fade-in delay-300">
            {[
              "Real-time incident tracking",
              "Secure data management",
              "Advanced analytics dashboard"
            ].map((feature, index) => (
              <div key={index} className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in delay-400">
            <Button
              size="lg"
              className="glass-button text-lg gap-2 group"
              onClick={() => navigate("/auth")}
            >
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="glass-morphism text-lg"
              onClick={() => navigate("/auth?mode=signup")}
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;