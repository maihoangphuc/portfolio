import { Theme } from "@/constants";
import { ThemeOptions, createTheme } from "@mui/material/styles";
import lightTheme from "@/theme/lightTheme";
import darkTheme from "@/theme/darkTheme";
import { ThemeModeType } from "@/types/theme";

export function getAppTheme(mode: ThemeModeType) {
  const baseTheme: ThemeOptions = mode === Theme.LIGHT ? lightTheme : darkTheme;

  return createTheme({
    ...baseTheme,
    typography: {
      fontFamily: "var(--font-quicksand)",
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
    components: {
      MuiCssBaseline: {
        defaultProps: {
          enableColorScheme: true,
        },
      },
    },
  });
}
