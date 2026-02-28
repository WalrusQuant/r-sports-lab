import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "R Sports Lab",
  description: "Learn to build NFL prediction models with R — right in your browser. No installs, no setup, just code.",
  metadataBase: new URL("https://rsportslab.com"),
  openGraph: {
    title: "R Sports Lab",
    description: "Learn to build NFL prediction models with R — right in your browser.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "R Sports Lab",
    description: "Learn to build NFL prediction models with R — right in your browser.",
  },
  other: {
    "theme-color": "#0f172a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
