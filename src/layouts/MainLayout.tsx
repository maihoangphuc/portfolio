"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
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
      <Box
        component="main"
        sx={{
          pt: "64px",
          width: "100%",
          height: "100%",
        }}
      >
        <Header />
        {children}
        {/* <Social /> */}
        <Footer />
      </Box>
    </Box>
  );
};

export default MainLayout;
