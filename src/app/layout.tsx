import "@/app/globals.css";
import ThemeProviderClient from "@/context/AppThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeMode } from "@/types/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import "animate.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Theme } from "@/constants";

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
    <html lang="en" suppressHydrationWarning data-theme={theme}>
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
