import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

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
      <body className="bg-background">
        <Navbar />

        {/*Main Content*/}
        <main className="flex flex-col gap-y-20 md:gap-y-32 overflow-hidden">{children}</main>
      
      </body>
    </html>
  );
}
