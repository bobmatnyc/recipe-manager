import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ChefHat, BookOpen, Sparkles, Plus, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { Toaster } from "sonner";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recipe Manager",
  description: "AI-powered recipe generator and meal planning app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {/* Navigation Header */}
        <header className="border-b bg-background">
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                <ChefHat className="h-6 w-6 text-primary" />
                Recipe Manager
              </Link>

              <div className="flex items-center gap-2">
                <Link href="/recipes">
                  <Button variant="ghost" size="sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    My Recipes
                  </Button>
                </Link>
                <Link href="/shared">
                  <Button variant="ghost" size="sm">
                    <Globe className="h-4 w-4 mr-2" />
                    Shared
                  </Button>
                </Link>
                <Link href="/discover">
                  <Button variant="ghost" size="sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Discover
                  </Button>
                </Link>
                <Link href="/recipes/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Recipe
                  </Button>
                </Link>
                <AuthButtons />
              </div>
            </nav>
          </div>
        </header>

        <main className="min-h-screen">
          {children}
        </main>
        <Toaster position="bottom-right" richColors />
        </body>
      </html>
    </AuthProvider>
  );
}
