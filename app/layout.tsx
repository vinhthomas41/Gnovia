import type { Metadata } from "next";
import { Cinzel, Geist, Geist_Mono, Roboto_Slab } from "next/font/google";
import SiteBackground from "@/app/pageComponents/siteBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gnovia Archive",
  description: "A star-lit Genshin Impact character and material archive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("gnovia-archive-theme");if(t==="elemental"||t==="blue"||t==="teal"||t==="plum")document.documentElement.dataset.archiveTheme=t;else document.documentElement.dataset.archiveTheme="elemental"}catch(e){document.documentElement.dataset.archiveTheme="elemental"}',
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${robotoSlab.variable} antialiased`}
      >
        <SiteBackground />
        <div className="site-content">{children}</div>
      </body>
    </html>
  );
}
