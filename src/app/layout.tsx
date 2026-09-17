import type { ReactNode } from "react";
import { Rubik, Cormorant_Garamond } from "next/font/google";

import "./globals.css";

const rubik = Rubik({
  subsets: ["latin", "cyrillic", "arabic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-rubik",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${rubik.variable} ${cormorant.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}