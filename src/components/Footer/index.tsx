"use client";

import SectionContainer from "@/components/SectionContainer";
import { menuItems, socialLinks } from "@/constants";
import { useScrollToSection } from "@/hooks/useScrollToSection";
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
      <List className="!grid !grid-cols-3 xs:!flex !gap-x-1 xs:!gap-4 !p-0 !m-0">
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component="a"
              href={item.href}
              disableTouchRipple
              onClick={handleScroll(item.href)}
              className="!bg-transparent !p-0 !text-light-text-primary dark:!text-dark-text-primary hover:!text-primary"
            >
              <ListItemText
                primary={item.text}
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
        {socialLinks.map((link, index) => (
          <Link key={index} href={link.href}>
            <link.icon
              size={16}
              className="!text-light-text-primary dark:!text-dark-text-primary hover:!text-primary"
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
          <Typography component="span" className="!text-primary">
            maihoangphuc
          </Typography>
        </Link>
      </Typography>
    </SectionContainer>
  );
};

export default Footer;
