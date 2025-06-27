"use client";

import { Theme } from "@/constants";
import { useAppContext } from "@/context/AppContext";
import { Box, IconButton } from "@mui/material";
import { BsMoon, BsSun } from "react-icons/bs";

const SwitchTheme = () => {
  const { theme, toggleTheme } = useAppContext();

  return (
    <Box className="!rounded-full">
      <IconButton
        component="a"
        rel="noopener noreferrer"
        aria-label="Switch Theme"
        onClick={toggleTheme}
      >
        {theme === Theme.DARK ? (
          <BsSun className="!text-light-primary dark:!text-dark-primary !text-base" />
        ) : (
          <BsMoon className="!text-light-primary dark:!text-dark-primary !text-base" />
        )}
      </IconButton>
    </Box>
  );
};

export default SwitchTheme;
