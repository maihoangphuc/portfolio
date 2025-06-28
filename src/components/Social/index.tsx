import { socialLinks } from "@/mockdata";
import { SocialLinkType } from "@/types/contact";
import { Box, IconButton } from "@mui/material";
const Social = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        zIndex: 1000,
      }}
      className="!hidden md:!flex"
    >
      {socialLinks.map((link: SocialLinkType, index: number) => {
        const Icon = link.icon;
        return (
          <IconButton
            key={index}
            component="a"
            href={link.href}
            target={link.target}
            rel="noopener noreferrer"
            aria-label={link.name}
          >
            <Icon className="!text-lg !text-secondary" />
          </IconButton>
        );
      })}
    </Box>
  );
};

export default Social;
