import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MotionProvider from "./components/MotionProvider";

export const metadata: Metadata = {
  title: {
    default: "hanjing lin's portfolio",
    template: "%s | Hanjing Lin",
  },
  description: "hanjing lin's personal portfolio",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-background">
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
