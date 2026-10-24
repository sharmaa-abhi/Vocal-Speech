import type { Metadata, Viewport } from "next";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";

export const metadata: Metadata = {
  title: "Vocal Forensics // Cybersecurity SER",
  description: "A browser-only interactive concept for real-time acoustic signal visualization and responsible cybercrime call triage.",
  applicationName: "Vocal Forensics",
  keywords: ["cybersecurity", "speech emotion research", "Web Audio API", "3D visualization", "responsible AI"]
};

export const viewport: Viewport = { themeColor: "#000000", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><LenisProvider>{children}</LenisProvider></body>
    </html>
  );
}
