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
      <List className="w-full xs:flex-nowrap xs:w-fit !flex !justify-center !items-center xs:!gap-4 !gap-2 p-0 mt-0">
        {menuItems.map((item: MenuItem) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component="a"
              href={item.href}
              disableTouchRipple
              disableGutters
              onClick={handleScroll(item.href)}
              className="!p-0 !m-0 !bg-transparent !text-light-text-primary dark:!text-dark-text-primary hover:!text-light-primary dark:hover:!text-dark-primary"
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
              className="!text-light-text-primary dark:!text-dark-text-primary hover:!text-light-primary dark:hover:!text-dark-primary"
            />
          </Link>
        ))}
      </Box>

      <Box className="!w-full !h-[1px] dark:!bg-dark-divider !bg-light-divider" />

      <Typography
        variant="body2"
        align="center"
        className="!text-light-text-primary dark:!text-dark-text-primary"
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
