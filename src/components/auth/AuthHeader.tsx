import { Shield } from "lucide-react";

export const AuthHeader = () => (
  <div className="flex flex-col items-center text-center">
    <div className="rounded-full bg-primary/10 p-3 mb-3">
      <Shield className="h-6 w-6 text-primary" />
    </div>
    <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
    <p className="text-sm text-muted-foreground">
      Sign in to your account or create a new one
    </p>
  </div>
);