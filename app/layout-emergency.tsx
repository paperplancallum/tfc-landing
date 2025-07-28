import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tom's Flight Club - Ultra-Cheap Flight Deals",
  description: "Find ultra-cheap flight deals, receive personalized email alerts, and unlock premium deals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <div>Emergency Layout Active</div>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}