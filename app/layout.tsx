import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/navbar";


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
      
        {/*Nav Bar*/}
        <NavBar />

        {/*Main Content*/}
        {children}
      </body>
    </html>
  );
}
