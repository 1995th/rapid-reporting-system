import { Shield } from "lucide-react";

export const AuthHeader = () => (
  <>
    <Shield className="h-8 w-8 text-primary mb-6" />
    <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
    <p className="text-sm text-muted-foreground">
      Sign in to your account or create a new one
    </p>
  </>
);