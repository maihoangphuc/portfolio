import "@/app/animations.css";
import "@/app/globals.css";
import "keen-slider/keen-slider.min.css";
import "animate.css";
import { Theme } from "@/constants";
import AppProviderClient from "@/context/AppContext";
import { ThemeMode } from "@/types/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { cookies } from "next/headers";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "MHP",
  description: "Portfolio of MHP",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme =
    ((await cookies()).get("theme")?.value as ThemeMode) || Theme.DARK;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme={theme}
      className={quicksand.variable}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <AppProviderClient themeInit={theme}>{children}</AppProviderClient>
        </AppRouterCacheProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
