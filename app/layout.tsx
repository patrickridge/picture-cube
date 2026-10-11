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

const title = "Picture cube solver";
const description = "Photograph a Rubik's cube printed with pictures and get the moves to solve it, with every centre the right way up.";

export const metadata: Metadata = {
  metadataBase: new URL("https://picture-cube.vercel.app"),
  title,
  description,
  openGraph: { title, description, siteName: title, type: "website", locale: "en_GB" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
