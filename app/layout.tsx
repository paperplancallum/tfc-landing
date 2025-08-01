import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { AuthHandler } from "@/components/auth-handler";
import { ConditionalNavbar } from "@/components/conditional-navbar";
import { NavigationProgress } from "@/components/navigation-progress";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tom's Flight Club - Ultra-Cheap Flight Deals",
  description: "Find ultra-cheap flight deals, receive personalized email alerts, and unlock premium deals",
};

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch (error) {
    console.error('Error in layout:', error);
  }

  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <NavigationProgress />
        <Suspense fallback={null}>
          <AuthHandler />
        </Suspense>
        <ConditionalNavbar user={user} />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}