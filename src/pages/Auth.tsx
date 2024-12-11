import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

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
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-3">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                    brandButtonText: 'hsl(var(--primary-foreground))',
                    defaultButtonBackground: 'hsl(var(--secondary))',
                    defaultButtonBackgroundHover: 'hsl(var(--secondary))',
                    inputBackground: theme === 'dark' ? 'hsl(var(--muted))' : 'transparent',
                    inputBorder: 'hsl(var(--border))',
                    inputBorderHover: 'hsl(var(--border))',
                    inputBorderFocus: 'hsl(var(--ring))',
                    inputText: theme === 'dark' ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))',
                    inputPlaceholder: theme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))',
                  },
                  space: {
                    spaceSmall: '4px',
                    spaceMedium: '8px',
                    spaceLarge: '12px',
                    labelBottomMargin: '8px',
                    anchorBottomMargin: '4px',
                    emailInputSpacing: '4px',
                    socialAuthSpacing: '4px',
                    buttonPadding: '8px',
                    inputPadding: '8px',
                  },
                  fonts: {
                    bodyFontFamily: `var(--font-sans)`,
                    buttonFontFamily: `var(--font-sans)`,
                    inputFontFamily: `var(--font-sans)`,
                    labelFontFamily: `var(--font-sans)`,
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '6px',
                    buttonBorderRadius: '6px',
                    inputBorderRadius: '6px',
                  },
                },
              },
              className: {
                container: 'w-full',
                label: 'text-sm font-medium text-foreground',
                button: 'w-full font-medium shadow-sm',
                input: `w-full px-3 py-2 text-sm ring-offset-background 
                  ${theme === 'dark' ? 'bg-muted text-foreground placeholder:text-muted-foreground' : 'bg-background text-foreground placeholder:text-muted-foreground'} 
                  border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`,
                anchor: 'text-sm text-primary hover:text-primary/80',
              }
            }}
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