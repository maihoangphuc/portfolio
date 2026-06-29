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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://maihoangphuc.click";
const SITE_NAME = "Mai Hoang Phuc — Frontend Developer";
const SITE_DESCRIPTION =
  "Frontend Developer with nearly 4 years of experience in React.js and Vue.js, building performant admin systems and internal tools while leveraging AI-assisted workflows to accelerate delivery.";

// Person + WebSite structured data for rich results. sameAs links the verified
// social profiles, which strengthens entity recognition.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: "Mai Hoang Phuc",
      url: SITE_URL,
      jobTitle: "Frontend Developer",
      description: SITE_DESCRIPTION,
      email: "mailto:maihoangphuc9x@gmail.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Tan Binh",
        addressRegion: "Ho Chi Minh City",
        addressCountry: "VN",
      },
      knowsAbout: [
        "ReactJS",
        "Next.js",
        "Vue 3",
        "TypeScript",
        "Three.js",
        "WebGL",
        "Tailwind CSS",
        "Frontend Development",
      ],
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
    template: "%s · Mai Hoang Phuc",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Mai Hoang Phuc Portfolio",
  authors: [{ name: "Mai Hoang Phuc" }],
  creator: "Mai Hoang Phuc",
  keywords: [
    "Mai Hoang Phuc",
    "Hoang Phuc",
    "MHP",
    "Frontend Developer",
    "Portfolio",
    "ReactJS",
    "Next.js",
    "Vue 3",
    "TypeScript",
    "Three.js",
    "WebGL",
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
