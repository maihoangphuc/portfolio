import { Theme } from "@/constants";
import { PaletteMode, ThemeOptions } from "@mui/material/styles";

const lightTheme: ThemeOptions = {
  palette: {
    mode: Theme.LIGHT as PaletteMode,
    background: {
      default: "#ffffff",
    },
  },
};

export default lightTheme;
