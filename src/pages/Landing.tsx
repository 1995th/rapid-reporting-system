import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Siren } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        {/* Logo Section */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full scale-125" />
            <Siren className="h-12 w-12 text-primary relative z-10" />
          </div>
          <h1 className="text-4xl font-bold">Rapid Reporting System</h1>
        </div>

        {/* Description */}
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          Streamline your incident reporting process with our secure and efficient system designed for law enforcement professionals.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            size="lg"
            className="min-w-[200px]"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="min-w-[200px]"
            onClick={() => navigate("/auth?mode=signup")}
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;