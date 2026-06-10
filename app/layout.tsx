import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "hanjing lin's portfolio",
  description: "hanjing lin's personal portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-background">
        <Navbar />

        {/*Main Content*/}
        <main className="flex flex-1 flex-col gap-y-20 overflow-x-clip md:gap-y-32">
          {children}
        </main>

        <Footer />
      
      </body>
    </html>
  );
}
