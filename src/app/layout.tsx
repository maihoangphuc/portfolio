import type { Metadata, Viewport } from "next";
import { Fredoka, Roboto } from "next/font/google";
import "@/app/globals.css";
import "@/app/animations.css";
import { SOCIAL_LINKS } from "@/constants/socialLinks";

const roboto = Roboto({
  weight: "variable",
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

// Only used to draw the wavy loader-letter mask — chunky geometric rounded
// sans, the closest match to the brand font theyearofgreta.com renders its
// preloader "g" with (thick circular bowl, flat-cut stems).
const fredoka = Fredoka({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-loader-glyph",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = "Hoang Phuc — Frontend Developer";
const SITE_DESCRIPTION =
  "Frontend Developer passionate about technology and crafting intuitive, visually appealing user interfaces. Interactive 3D web experiences built with Three.js, React, and Next.js.";

// Person + WebSite structured data for rich results. sameAs links the verified
// social profiles, which strengthens entity recognition.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: "Hoang Phuc Mai",
      url: SITE_URL,
      jobTitle: "Frontend Developer",
      description: SITE_DESCRIPTION,
      knowsAbout: ["Three.js", "WebGL", "React", "Next.js", "Frontend Development"],
      sameAs: SOCIAL_LINKS.map((link) => link.href),
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
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
      className={`${roboto.variable} ${roboto.className} ${fredoka.variable} h-full antialiased experience-loading`}
    >
      <head>
        {/* Kick off GLB downloads in parallel with JS bundle parsing — they're
            the bottleneck for LCP because the intro text reveal is gated on
            them. Without these, the browser only learns about the GLBs after
            startExperience() runs. */}
        <link rel="preload" as="fetch" href="/3d.glb" crossOrigin="anonymous" />
        <link rel="preload" as="fetch" href="/rock.glb" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
