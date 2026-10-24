import type { Metadata, Viewport } from "next";
import { Inter, Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Vocal Forensics // Cybersecurity SER",
  description: "A browser-only interactive concept for real-time acoustic signal visualization and responsible cybercrime call triage.",
  applicationName: "Vocal Forensics",
  keywords: ["cybersecurity", "speech emotion research", "Web Audio API", "3D visualization", "responsible AI"]
};

export const viewport: Viewport = { themeColor: "#000000", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable}`}>
      <body><LenisProvider>{children}</LenisProvider></body>
    </html>
  );
}
