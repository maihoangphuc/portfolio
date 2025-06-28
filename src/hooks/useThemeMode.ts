import { Theme } from "@/constants";
import { ThemeModeType } from "@/types/theme";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export const useThemeMode = (initialTheme: ThemeModeType) => {
  const [theme, setTheme] = useState<ThemeModeType>(initialTheme);

  useEffect(() => {
    Cookies.set("theme", theme);

    if (theme === Theme.SYSTEM) {
      document.documentElement.removeAttribute("data-theme");
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    } else {
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.classList.toggle("dark", theme === Theme.DARK);
    }
  }, [theme]);

  useEffect(() => {
    if (theme === Theme.SYSTEM) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(
      (prev) =>
        (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK) as ThemeModeType
    );
  };

  return { theme, toggleTheme };
};
