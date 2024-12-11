import { ThemeSupa } from "@supabase/auth-ui-shared";

export const getAuthTheme = (theme: string) => ({
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
});