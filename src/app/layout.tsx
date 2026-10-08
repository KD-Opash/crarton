import type { Metadata } from "next";
import { Inter, Outfit, DM_Mono, Fraunces } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-kumo",
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Craton Technologies",
  description: "Craton invents, protects, and ships AI-enabled products for regulated, evidence-heavy work.",
  metadataBase: new URL("https://craton.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Craton Technologies",
    description: "Craton invents, protects, and ships AI-enabled products for regulated, evidence-heavy work.",
    url: "https://craton.com",
    siteName: "Craton Technologies",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Craton Technologies",
    description: "Craton invents, protects, and ships AI-enabled products for regulated, evidence-heavy work.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Craton Technologies",
    "url": "https://craton.com",
    "logo": "https://craton.com/logo.png",
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Sheik Ahamed Ali"
    },
    "description": "Craton invents, protects, and ships AI-enabled products for regulated, evidence-heavy work.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Frisco",
      "addressRegion": "TX",
      "addressCountry": "US"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${outfit.variable} ${dmMono.variable} ${fraunces.variable} antialiased selection:bg-copper selection:text-ink`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
