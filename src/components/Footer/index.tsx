"use client";

import SectionContainer from "@/components/SectionContainer";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { menuItems, socialLinks } from "@/mockdata";
import { SocialLink } from "@/types/contact";
import { MenuItem } from "@/types/home";
import {
  Box,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import clsx from "clsx";

const Footer = () => {
  const scrollToSection = useScrollToSection();

  const handleScroll = (href: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    const targetId = href.replace("#", "");
    scrollToSection(targetId);
  };

  return (
    <SectionContainer
      title="MHP"
      component="footer"
      showWave={{ top: true, bottom: false }}
      className="!flex !flex-col !min-h-[240px]"
      classChildren="!flex !flex-col !gap-4 !justify-center"
    >
      <List className="!grid !grid-cols-3 xs:!flex xs:w-fit !justify-center !items-center xs:!gap-4 !gap-2 p-0 mt-0">
        {menuItems.map((item: MenuItem) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component="a"
              href={item.href}
              disableTouchRipple
              disableGutters
              onClick={handleScroll(item.href)}
              className="!p-0 !m-0 !bg-transparent !font-medium !text-light-secondary dark:!text-dark-secondary hover:!text-light-primary dark:hover:!text-dark-primary"
            >
              <ListItemText
                primary={item.text}
                className="!p-0 !m-0"
                sx={{
                  "& .MuiTypography-root": {
                    fontWeight: "medium",
                    textTransform: "capitalize",
                    fontSize: {
                      xs: "14px",
                      md: "16px",
                    },
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box className="!flex !flex-row !gap-4">
        {socialLinks.map((link: SocialLink, index: number) => (
          <Link
            key={index}
            href={link.href}
            target={link.target}
            rel="noopener noreferrer"
            aria-label={link.name}
          >
            <link.icon
              size={16}
              className={clsx(
                "!text-light-secondary dark:!text-dark-secondary",
                link.name === "Linkedin" && "hover:!text-linkedin",
                link.name === "Email" && "hover:!text-email",
                link.name === "Github" && "hover:!text-github"
              )}
            />
          </Link>
        ))}
      </Box>

      <Box className="!w-full !h-[1px] dark:!bg-dark-divider !bg-light-divider" />

      <Typography
        variant="body2"
        align="center"
        className="!text-light-secondary dark:!text-dark-secondary !font-medium"
      >
        © 2025 Design by{" "}
        <Link href="#" className=" !no-underline hover:!text-gray-300">
          <Typography
            component="span"
            className="!text-light-primary dark:!text-dark-primary !font-medium"
          >
            maihoangphuc
          </Typography>
        </Link>
      </Typography>
    </SectionContainer>
  );
};

export default Footer;
