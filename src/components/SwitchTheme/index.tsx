"use client";

import { Theme } from "@/constants";
import { useThemeContext } from "@/context/AppThemeContext";
import { Box, IconButton } from "@mui/material";
import { BsMoon, BsSun } from "react-icons/bs";

const SwitchTheme = () => {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <Box
      sx={{
        borderRadius: 1,
      }}
    >
      <IconButton size="small" color="inherit" onClick={toggleTheme}>
        {mode === Theme.DARK ? (
          <BsSun className="!text-light-text-primary dark:!text-dark-text-primary !text-lg" />
        ) : (
          <BsMoon className="!text-light-text-primary dark:!text-dark-text-primary !text-lg" />
        )}
      </IconButton>
    </Box>
  );
};

export default SwitchTheme;
