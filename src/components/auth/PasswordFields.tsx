import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

type PasswordFieldsProps = {
  form: UseFormReturn<any>;
};

const passwordRequirements = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "At least one uppercase letter" },
  { regex: /[a-z]/, label: "At least one lowercase letter" },
  { regex: /[0-9]/, label: "At least one number" },
  { regex: /[^A-Za-z0-9]/, label: "At least one special character" },
];

export const PasswordFields = ({ form }: PasswordFieldsProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const calculateMatchPercentage = () => {
    if (!password || !confirmPassword) return 0;
    let matchCount = 0;
    const maxLength = Math.max(password.length, confirmPassword.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (password[i] === confirmPassword[i]) {
        matchCount++;
      }
    }
    
    return Math.floor((matchCount / maxLength) * 100);
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input 
                type="password" 
                placeholder="••••••••" 
                {...field} 
                onChange={(e) => {
                  field.onChange(e);
                  setPassword(e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <Input 
                type="password" 
                placeholder="••••••••" 
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  setConfirmPassword(e.target.value);
                }}
              />
            </FormControl>
            <div className="mt-2">
              <Progress value={calculateMatchPercentage()} className="h-2" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};