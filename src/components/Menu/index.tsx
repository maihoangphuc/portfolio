"use client";

import { useActiveSection } from "@/hooks/useActiveSection";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { menuItems } from "@/mockdata";
import { MenuItem } from "@/types/home";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import clsx from "clsx";
import { useState } from "react";
import { BiMenuAltRight } from "react-icons/bi";
import { VscClose } from "react-icons/vsc";
import Logo from "@/components/Icons/Logo";

interface MenuProps {
  className?: string;
  children?: React.ReactNode;
}

const Menu = ({ className, children }: MenuProps) => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const activeSection = useActiveSection();
  const scrollToSection = useScrollToSection();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleScroll = (href: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    const targetId = href.replace("#", "");
    scrollToSection(targetId);

    if (mobileOpen) handleDrawerToggle();
  };

  const isActive = (href: string) => {
    const sectionId = href.replace("#", "");
    return activeSection === sectionId;
  };

  const drawer = (
    <Box
      className="!h-full !p-4 !bg-light-bg dark:!bg-dark-bg"
      role="navigation"
      aria-label="Mobile menu"
    >
      <Box className="!flex !items-center !justify-between">
        <a
          href="#home"
          className="!flex !items-center"
          onClick={handleScroll("#home")}
          aria-label="Go to homepage"
        >
          <Box className="!relative">
            <Logo className="size-[24px] lg:!size-[26px] md:!size-[30px] !object-contain !text-light-primary dark:!text-dark-primary" />
          </Box>
        </a>
        <IconButton
          onClick={handleDrawerToggle}
          className="!text-light-primary dark:!text-dark-primary"
          aria-label="Close menu"
        >
          <VscClose />
        </IconButton>
      </Box>

      <List>
        {menuItems.map((item: MenuItem) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component="a"
              href={item.href}
              disableTouchRipple
              onClick={handleScroll(item.href)}
              className={clsx(
                "!rounded-lg !p-0 !py-2 !bg-transparent",
                isActive(item.href)
                  ? "!text-light-primary dark:!text-dark-primary"
                  : "!text-light-secondary/80 dark:!text-dark-secondary/80 hover:!text-light-primary dark:hover:!text-dark-primary"
              )}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <ListItemText
                primary={item.text}
                sx={{
                  "& .MuiTypography-root": {
                    fontWeight: "bold",
                    textTransform: "capitalize",
                    fontSize: "16px",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop menu */}
      <Box
        className={`!hidden md:!flex !gap-6 ${className}`}
        role="navigation"
        aria-label="Desktop menu"
      >
        <List className="!flex !gap-7 !p-0">
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component="a"
                disableTouchRipple
                href={item.href}
                onClick={handleScroll(item.href)}
                className={clsx(
                  "!rounded-lg !size-fit !p-0 !bg-transparent",
                  isActive(item.href)
                    ? "!text-light-primary dark:!text-dark-primary"
                    : "!text-light-secondary/80 dark:!text-dark-secondary/80 hover:!text-light-primary dark:hover:!text-dark-primary"
                )}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                <ListItemText
                  primary={item.text}
                  sx={{
                    "& .MuiTypography-root": {
                      fontWeight: "bold",
                      textTransform: "capitalize",
                      fontSize: "16px",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Mobile controls */}
      <Box className="!items-center !gap-2 !ml-auto !flex md:!hidden">
        {children}
        <IconButton
          color="inherit"
          aria-label="Open menu"
          edge="end"
          onClick={handleDrawerToggle}
          className="!text-light-secondary dark:!text-dark-secondary hover:!text-light-secondary/80 dark:hover:!text-dark-secondary/80"
        >
          <BiMenuAltRight className="!text-2xl !text-light-primary dark:!text-dark-primary" />
        </IconButton>
      </Box>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        className="!block md:!hidden"
        slotProps={{
          paper: {
            className: "!w-full md:!w-[280px]",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Menu;
