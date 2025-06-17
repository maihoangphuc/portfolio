import React from "react";
import { Box, IconButton } from "@mui/material";
import { FiLinkedin, FiMail, FiGithub } from "react-icons/fi";

const socialLinks = [
  {
    icon: FiLinkedin,
    href: "https://www.linkedin.com/in/maihoangphuc",
    target: "_blank",
  },
  {
    icon: FiMail,
    href: "mailto:maihoangphuc9x@gmail.com",
  },
  {
    icon: FiGithub,
    href: "https://github.com/maihoangphuc",
    target: "_blank",
  },
];

const Social = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
      className="!pl-4 md:!pl-10 !hidden xs:!flex"
    >
      {socialLinks.map((link, index) => {
        const Icon = link.icon;
        return (
          <IconButton
            key={index}
            component="a"
            href={link.href}
            target={link.target}
          >
            <Icon className="!text-lg !text-light-text-primary dark:!text-dark-text-primary" />
          </IconButton>
        );
      })}
    </Box>
  );
};

export default Social;
