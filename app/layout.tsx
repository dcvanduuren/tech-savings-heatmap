import type { Metadata } from "next";
import { Space_Grotesk, Source_Code_Pro } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans-primary",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-mono-primary",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechSavings Europe",
  description: "Phase 1: Discovery Heatmap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${sourceCodePro.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
