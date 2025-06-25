import "@/app/globals.css";
import "@/app/animations.css";
import { Theme } from "@/constants";
import ThemeProviderClient from "@/context/AppThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeMode } from "@/types/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Quicksand } from "next/font/google";

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
          <ThemeProviderClient mode={theme}>
            <InitColorSchemeScript attribute="class" />
            <ToastProvider>{children}</ToastProvider>
          </ThemeProviderClient>
        </AppRouterCacheProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
