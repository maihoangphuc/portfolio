import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Social from "@/components/Social";
import { Box } from "@mui/material";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Header />
      <Box
        component="main"
        sx={{
          pt: "64px",
          width: "100%",
          height: "100%",
        }}
        className="!px-4 md:!px-10"
      >
        {children}
        <Social />
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;
