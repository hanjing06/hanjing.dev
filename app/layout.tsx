import type { Metadata } from "next";
import "./globals.css";
import Home from "./page";
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
      <body>
        {/*Theme*/}

        {/*Background*/}

        {/*Nav Bar*/}
        <NavBar />
    
        {/*Main Content*/}
        {children}
      </body>
    </html>
  );
}
