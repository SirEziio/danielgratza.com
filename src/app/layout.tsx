import type { Metadata } from "next";
import { Jost, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

// Closest free web match to Futura PT
const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-futura",
  display: "swap",
});

// Closest free web match to Big Caslon CC Black Italic
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["700"],
  style: ["italic"],
  variable: "--font-caslon",
  display: "swap",
});

export const viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e1dfd8" },
    { media: "(prefers-color-scheme: dark)",  color: "#242424" },
  ],
};

export const metadata: Metadata = {
  title: "Daniel Gratza — UX Designer",
  description:
    "Portfolio of Daniel Gratza — a designer who thinks like a psychologist and works like a builder.",
  icons: {
    icon: "/images/home-Logo.png",
    shortcut: "/images/home-Logo.png",
    apple: "/images/home-Logo.png",
  },
  openGraph: {
    title: "Daniel Gratza — UX Designer",
    description: "UX design portfolio",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
