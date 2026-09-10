import type { ReactNode } from "react";

// Le vrai layout (html/body) vit dans [locale]/layout.tsx,
// car la langue et la direction dépendent de la locale.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
