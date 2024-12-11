import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { getAuthTheme } from "@/components/auth/AuthThemeConfig";

const AuthPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <div className="w-full max-w-md space-y-8">
        <AuthHeader />
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Auth
            supabaseClient={supabase}
            appearance={getAuthTheme(theme)}
            providers={[]}
            redirectTo={`${window.location.origin}/auth/callback`}
            view="sign_up"
            localization={{
              variables: {
                sign_up: {
                  email_label: "Email",
                  password_label: "Password",
                  button_label: "Sign up",
                  loading_button_label: "Creating account...",
                  social_provider_text: "Continue with {{provider}}",
                  link_text: "Don't have an account? Sign up",
                  confirmation_text: "Check your email for the confirmation link",
                },
                sign_in: {
                  email_label: "Email",
                  password_label: "Password",
                  button_label: "Sign in",
                  loading_button_label: "Signing in...",
                  social_provider_text: "Continue with {{provider}}",
                  link_text: "Already have an account? Sign in",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;