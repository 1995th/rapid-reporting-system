import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();

    // Listen for auth state changes
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

        <Card>
          <CardContent className="pt-6">
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
                      inputBackground: 'transparent',
                      inputBorder: 'hsl(var(--border))',
                      inputBorderHover: 'hsl(var(--border))',
                      inputBorderFocus: 'hsl(var(--ring))',
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
                  input: 'w-full bg-background border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  anchor: 'text-sm text-primary hover:text-primary/80',
                }
              }}
              providers={[]}
              redirectTo={`${window.location.origin}/auth/callback`}
              additionalData={{
                first_name: '',
                last_name: '',
              }}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;