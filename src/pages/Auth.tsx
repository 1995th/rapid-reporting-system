import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Siren } from "lucide-react";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [isSignIn, setIsSignIn] = useState(searchParams.get("mode") !== "signup");
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const toggleForm = () => setIsSignIn(!isSignIn);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full" />
              <Siren className="h-8 w-8 text-primary relative z-10" />
            </div>
            <h1 className="text-2xl font-bold">Rapid Reporting System</h1>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {isSignIn ? (
            <SignInForm onToggle={toggleForm} />
          ) : (
            <SignUpForm onToggle={toggleForm} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;