import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LaunchForge",
  description: "The project launcher for makers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="font-inter antialiased">
        {children}
      </body>
    </html>
  );
}
