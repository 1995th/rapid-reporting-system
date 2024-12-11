import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Welcome</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account or create a new one
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#000000',
                  brandAccent: '#666666',
                }
              }
            }
          }}
          providers={[]}
          localization={{
            variables: {
              sign_up: {
                email_label: "Email",
                password_label: "Password",
                email_input_placeholder: "Your email",
                password_input_placeholder: "Your password",
                button_label: "Sign up",
                loading_button_label: "Signing up ...",
                social_provider_text: "Sign in with {{provider}}",
                link_text: "Don't have an account? Sign up",
                confirmation_text: "Check your email for the confirmation link",
              },
            },
          }}
          redirectTo={`${window.location.origin}/auth/callback`}
          additionalData={{
            first_name: '',
            last_name: '',
          }}
        />
      </div>
    </div>
  );
};

export default AuthPage;