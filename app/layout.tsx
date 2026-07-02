import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MotionProvider from "./components/MotionProvider";

const siteUrl = "https://hanjing.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hanjing Lin | Software Engineering Portfolio",
    template: "%s | Hanjing Lin",
  },
  description:
    "Hanjing Lin is a software engineering student building embedded systems, computer vision projects, intelligent software, and hardware.",
  applicationName: "Hanjing Lin Portfolio",
  authors: [{ name: "Hanjing Lin", url: siteUrl }],
  creator: "Hanjing Lin",
  publisher: "Hanjing Lin",
  keywords: [
    "Hanjing Lin",
    "Hanjing",
    "software engineer",
    "software engineering student",
    "embedded systems",
    "computer vision",
    "portfolio",
    "Western University",
    "London Ontario",
    "Toronto",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: siteUrl,
    siteName: "Hanjing Lin",
    title: "Hanjing Lin | Software Engineering Portfolio",
    description:
      "Embedded systems, computer vision, intelligent software, and hardware projects by Hanjing Lin.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hanjing Lin | Software Engineering Portfolio",
    description:
      "Embedded systems, computer vision, intelligent software, and hardware projects by Hanjing Lin.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Hanjing Lin",
      alternateName: "Hanjing",
      url: siteUrl,
      email: "mailto:hlin389@uwo.ca",
      jobTitle: "Software Engineering Student",
      affiliation: {
        "@type": "CollegeOrUniversity",
        name: "Western University",
        url: "https://www.uwo.ca/",
      },
      sameAs: [
        "https://github.com/hanjing06",
        "https://www.linkedin.com/in/hanjing-lin-790252113/",
      ],
      knowsAbout: [
        "Software Engineering",
        "Embedded Systems",
        "Computer Vision",
        "Machine Learning",
        "PCB Design",
      ],
      homeLocation: {
        "@type": "Place",
        name: "Ontario, Canada",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Hanjing Lin",
      alternateName: "Hanjing's Portfolio",
      inLanguage: "en-CA",
      publisher: {
        "@id": `${siteUrl}/#person`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <MotionProvider>
          <Navbar />

          <div
            className="flex flex-1 flex-col gap-y-20 overflow-x-clip md:gap-y-32"
          >
            {children}
          </div>

          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
