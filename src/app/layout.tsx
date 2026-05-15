import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "@/app/globals.css";
import "@/app/animations.css";

const roboto = Roboto({
  weight: "variable",
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const SITE_NAME = "Hoang Phuc — Frontend Developer";
const SITE_DESCRIPTION =
  "Frontend Developer passionate about technology and crafting intuitive, visually appealing user interfaces. Interactive 3D web experiences built with Three.js, React, and Next.js.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: SITE_NAME,
    template: "%s · Hoang Phuc",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Hoang Phuc Portfolio",
  authors: [{ name: "Hoang Phuc Mai" }],
  creator: "Hoang Phuc Mai",
  keywords: [
    "Hoang Phuc",
    "MHP",
    "Frontend Developer",
    "Portfolio",
    "Three.js",
    "WebGL",
    "Next.js",
    "React",
    "Interactive 3D",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_US",
    images: [{ url: "/text-bg.webp", width: 1774, height: 887, alt: "Hoang Phuc" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/text-bg.webp"],
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${roboto.className} h-full antialiased experience-loading`}
    >
      <head>
        {/* Kick off GLB downloads in parallel with JS bundle parsing — they're
            the bottleneck for LCP because the intro text reveal is gated on
            them. Without these, the browser only learns about the GLBs after
            startExperience() runs. */}
        <link rel="preload" as="fetch" href="/3d.glb" crossOrigin="anonymous" />
        <link rel="preload" as="fetch" href="/rock.glb" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
