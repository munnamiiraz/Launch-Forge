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
import { QueryProvider } from "@/src/provider/QueryProvider";

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
    <html lang="en" className={`${outfit.variable} ${inter.variable}`} suppressHydrationWarning={true}>
      <body className="font-inter antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
