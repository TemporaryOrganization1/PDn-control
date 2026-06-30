import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { appName } from "@/lib/constants";
import { SiteFooter } from "@/components/site-footer";
import { BridgeProvider } from "@/components/bridge-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: appName,
  description: appName,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={cn("font-sans", geist.variable)}>
      <body className="antialiased min-h-screen bg-background flex flex-col">
        <BridgeProvider />
        <AuthProvider>
        <Navbar />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster richColors position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
