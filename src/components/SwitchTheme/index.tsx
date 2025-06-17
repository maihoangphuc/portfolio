"use client";

import { Theme } from "@/constants";
import { useThemeContext } from "@/context/AppThemeContext";
import { BsSun, BsMoon } from "react-icons/bs";
import { Box, IconButton, Tooltip } from "@mui/material";

const SwitchTheme = () => {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <Box
      sx={{
        borderRadius: 1,
      }}
    >
      <Tooltip
        title={`Switch to ${mode === Theme.DARK ? "Light" : "Dark"} Mode`}
      >
        <IconButton size="small" color="inherit" onClick={toggleTheme}>
          {mode === Theme.DARK ? (
            <BsSun className="!text-light-text-primary dark:!text-dark-text-primary !text-lg" />
          ) : (
            <BsMoon className="!text-light-text-primary dark:!text-dark-text-primary !text-lg" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default SwitchTheme;
