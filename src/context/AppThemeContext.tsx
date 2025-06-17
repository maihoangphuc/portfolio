"use client";

import { Theme } from "@/constants";
import { getAppTheme } from "@/theme/getTheme";
import { ThemeMode } from "@/types/theme";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import Cookies from "js-cookie";
import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextProps {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useThemeContext must be used within a ThemeProvider");
  return context;
}

export default function ThemeProviderClient({
  children,
  mode: initialMode,
}: {
  children: React.ReactNode;
  mode: ThemeMode;
}) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  useEffect(() => {
    Cookies.set("theme", mode);

    if (mode === Theme.SYSTEM) {
      document.documentElement.removeAttribute("data-theme");
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    } else {
      document.documentElement.setAttribute("data-theme", mode);
      document.documentElement.classList.toggle("dark", mode === Theme.DARK);
    }
  }, [mode]);

  useEffect(() => {
    if (mode === Theme.SYSTEM) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode(
      (prev) => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK) as ThemeMode
    );
  };

  const theme = getAppTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
