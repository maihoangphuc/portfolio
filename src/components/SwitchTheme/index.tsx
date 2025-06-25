"use client";

import { Theme } from "@/constants";
import { useThemeContext } from "@/context/AppThemeContext";
import { Box, IconButton } from "@mui/material";
import { BsMoon, BsSun } from "react-icons/bs";

const SwitchTheme = () => {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <Box className="!rounded-full">
      <IconButton
        component="a"
        rel="noopener noreferrer"
        aria-label="Switch Theme"
        onClick={toggleTheme}
      >
        {mode === Theme.DARK ? (
          <BsSun className="!text-light-text-primary dark:!text-dark-text-primary !text-base" />
        ) : (
          <BsMoon className="!text-light-text-primary dark:!text-dark-text-primary !text-base" />
        )}
      </IconButton>
    </Box>
  );
};

export default SwitchTheme;
