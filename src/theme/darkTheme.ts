import { Theme } from "@/constants";
import { PaletteMode, ThemeOptions } from "@mui/material/styles";

const darkTheme: ThemeOptions = {
  palette: {
    mode: Theme.DARK as PaletteMode,
    background: {
      default: "#1e2023",
    },
  },
};

export default darkTheme;
