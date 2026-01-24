import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/navbar";
import Projects from "./projects/page";
import About from "./about/page";


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
        {children}
      </body>
    </html>
  );
}
