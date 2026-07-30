import type { Metadata } from "next";
import { spaceGrotesk, inter, ibmPlexMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wavy — One Platform. Every Concert. Every Moment.",
  description:
    "Platform marketplace tiket konser yang menghubungkan Event Organizer dengan customer dalam satu ekosistem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable} antialiased`}
    >
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
