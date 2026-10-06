// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crypto Invest",
  description: "Crypto investment and trading platform with AI trading, daily profit plans, and multi-wallet management.",
  openGraph: {
    title: "Crypto Invest",
    description: "Crypto investment and trading platform with AI trading, daily profit plans, and multi-wallet management.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("crypto_invest_theme");var d=t==="light"?"light":(t==="dark"?"dark":(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"));var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(d);r.setAttribute("data-theme",d);r.style.colorScheme=d;}catch(e){}})();`,
          }}
        />
      </head>
      <body className="h-full antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}