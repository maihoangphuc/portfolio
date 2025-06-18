import { socialLinks } from "@/constants";
import { Box, IconButton } from "@mui/material";
const Social = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        bottom: "35%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        zIndex: 1000,
      }}
      className="!pl-4 md:!pl-10 !hidden sm:!flex"
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
