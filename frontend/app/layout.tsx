import type { Metadata } from "next";
import { Manrope, Fraunces } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrekPal — Your Himalayan destination buddy",
  description:
    "Premium Nepal trek preparation: packing lists, risk checks, weather watch-outs, and trusted guides.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`}>
      <body className="app-shell flex min-h-screen flex-col font-[family-name:var(--font-sans)] text-[var(--foreground)]">
        <AuthProvider>
          <Navbar />
          <main className="w-full flex-1 pt-14 sm:pt-[4.25rem]">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
