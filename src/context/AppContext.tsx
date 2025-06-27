"use client";

import { getAppTheme } from "@/theme/getTheme";
import { ThemeMode } from "@/types/theme";
import {
  CssBaseline,
  InitColorSchemeScript,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material";
import { createContext, useContext } from "react";
import { useThemeMode } from "@/hooks/useThemeMode";
import { ToastProvider } from "@/context/ToastContext";

interface AppContextProps {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within a AppProvider");
  return context;
}

export default function AppProviderClient({
  children,
  themeInit,
}: {
  children: React.ReactNode;
  themeInit: ThemeMode;
}) {
  const { theme, toggleTheme } = useThemeMode(themeInit);
  const muiTheme = getAppTheme(theme);

  return (
    <AppContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        <InitColorSchemeScript attribute="class" />
        <ToastProvider>{children}</ToastProvider>
      </MuiThemeProvider>
    </AppContext.Provider>
  );
}
