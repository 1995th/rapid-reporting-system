import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, CheckCircle2 } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted">
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in">
                Streamline Your
                <span className="text-primary block mt-2">
                  Incident Reporting
                </span>
              </h1>
              <p className="text-xl text-muted-foreground/80 max-w-xl animate-fade-in delay-200">
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
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in delay-400">
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

          {/* Right column - Visual element */}
          <div className="hidden lg:block">
            <div className="glass-morphism p-8 rounded-2xl relative overflow-hidden animate-fade-in delay-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
              <div className="relative">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-background/50 to-muted/50 p-8 flex items-center justify-center">
                  <Shield className="w-32 h-32 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;