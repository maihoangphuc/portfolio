"use client";

import Menu from "@/components/Menu";
import SwitchTheme from "@/components/SwitchTheme";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { Images } from "@/images";
import { AppBar, Box, Toolbar } from "@mui/material";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  const scrolled = useScrollPosition();
  const scrollToSection = useScrollToSection();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToSection("home");
  };

  return (
    <AppBar
      aria-label="Header"
      component="header"
      position="fixed"
      elevation={0}
      className={clsx(
        "!h-[64px] !flex !items-center !justify-center !px-4 md:!px-10",
        scrolled
          ? "!bg-light-bg/80 !backdrop-blur-sm dark:!bg-dark-bg/90 !shadow-header"
          : "!bg-transparent"
      )}
    >
      <Box
        sx={{
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Toolbar
          disableGutters
          className="!w-full !flex !items-center !justify-between"
        >
          <Link
            href="#home"
            onClick={handleClick}
            className="!flex !items-center"
          >
            <Box className="!relative !size-[22px] sm:!size-[26px] md:!size-[32px]">
              <Image src={Images.logo} alt="Logo" fill />
            </Box>
          </Link>
          <Box className="!flex !items-center !gap-4 md:!gap-0">
            <Menu className="!ml-auto !mr-6" />
            <SwitchTheme />
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  );
};

export default Header;
