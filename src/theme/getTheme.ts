import { createTheme, PaletteMode, ThemeOptions } from "@mui/material";
import lightTheme from "@/theme/lightTheme";
import darkTheme from "@/theme/darkTheme";
import { ThemeMode } from "@/types/theme";
import { Theme } from "@/constants";

export function getAppTheme(mode: ThemeMode) {
  const paletteMode: PaletteMode =
    mode === Theme.SYSTEM ? "light" : (mode as PaletteMode);

  const baseTheme: ThemeOptions = mode === Theme.LIGHT ? lightTheme : darkTheme;

  return createTheme({
    palette: { mode: paletteMode },
    ...baseTheme,
    typography: {
      fontFamily: "Quicksand, sans-serif",
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
    },
    breakpoints: {
      values: {
        xs: 480,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
      },
    },
  });
}
