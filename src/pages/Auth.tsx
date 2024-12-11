import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { AuthHeader } from "@/components/auth/AuthHeader";

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const toggleForm = () => setIsSignIn(!isSignIn);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <div className="w-full max-w-md space-y-8">
        <AuthHeader />
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