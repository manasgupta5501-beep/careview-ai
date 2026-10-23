import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareView AI — Smart Hospital TV Assistant for Elderly Patients",
  description:
    "Accessible AI-powered hospital television assistant designed for elderly patients, offering voice and text question answering, hospital directories, and bedside assistance requests.",
  keywords: [
    "CareView AI",
    "Hospital TV Assistant",
    "Elderly Healthcare",
    "Fire TV Hackathon",
    "Accessible Voice Assistant",
    "Bedside Care"
  ],
  authors: [{ name: "CareView AI Team" }]
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#07131e"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#07131e] text-slate-100 flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
