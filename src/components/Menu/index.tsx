"use client";

import { useActiveSection } from "@/hooks/useActiveSection";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { Images } from "@/media/images";
import { BiMenuAltRight } from "react-icons/bi";
import { VscClose } from "react-icons/vsc";
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
import Image from "next/image";
import { useState } from "react";
import { menuItems } from "@/mockdata";
import { MenuItem } from "@/types/home";

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
    <Box className="!h-full !p-4" role="navigation" aria-label="Mobile menu">
      <Box className="!flex !items-center !justify-between">
        <a
          href="#home"
          className="!flex !items-center"
          onClick={handleScroll("#home")}
          aria-label="Go to homepage"
        >
          <Box className="!relative">
            <Image
              src={Images.logo}
              alt="Logo"
              width={32}
              height={32}
              quality={90}
              className="!w-[24px] xs:!w-full !h-full !object-contain"
              sizes="(max-width: 640px) 24px, (max-width: 768px) 26px, 28px"
            />
          </Box>
        </a>
        <IconButton
          onClick={handleDrawerToggle}
          className="!text-primary"
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
                "!rounded-lg !p-0 !py-2",
                isActive(item.href)
                  ? "!text-primary"
                  : "!text-light-text-primary dark:!text-dark-text-primary hover:!text-primary"
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
                    ? "!text-primary"
                    : "!text-light-text-primary dark:!text-dark-text-primary hover:!text-primary"
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
          className="!text-secondary hover:!text-primary"
        >
          <BiMenuAltRight className="!text-2xl !text-light-text-primary dark:!text-dark-text-primary" />
        </IconButton>
      </Box>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
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
