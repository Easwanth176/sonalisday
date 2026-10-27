import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const railey = localFont({ src: "./fonts/railey.woff", variable: "--font-railey" });
const pony = localFont({ src: "./fonts/ponyclub.woff", variable: "--font-pony" });
const lazy = localFont({ src: "./fonts/lazydog.woff", variable: "--font-lazy" });
const crafty = localFont({ src: "./fonts/craftygirls.woff", variable: "--font-crafty" });
const anaktoria = localFont({ src: "./fonts/anaktoria.woff", variable: "--font-anaktoria" });
const arimo = localFont({ src: "./fonts/arimo.woff", variable: "--font-arimo" });

export const metadata: Metadata = {
  title: "Happiest Birthday, Sonali",
  description: "Happiest Birthday, Sonali",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${railey.variable} ${pony.variable} ${lazy.variable} ${crafty.variable} ${anaktoria.variable} ${arimo.variable}`}>
        {children}
      </body>
    </html>
  );
}
