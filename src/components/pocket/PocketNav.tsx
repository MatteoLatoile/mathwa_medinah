"use client";

import {
  Building2,
  Home,
  MoreHorizontal,
  Plus,
  Users,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

type Props = {
  locale: string;
};

export default function PocketNav({
  locale,
}: Props) {
  const pathname =
    usePathname();

  const homePath =
    `/${locale}/pocket`;

  const items = [
    {
      label: "Accueil",
      href: homePath,
      icon: Home,
      active:
        pathname === homePath,
    },
    {
      label: "Annonces",
      href: `${homePath}/annonces`,
      icon: Building2,
      active:
        pathname.startsWith(
          `${homePath}/annonces`
        ),
    },
    {
      label: "Ajouter",
      href: `/${locale}/admin/annonces/nouvelle`,
      icon: Plus,
      central: true,
      active: false,
    },
    {
      label: "Prospects",
      href: `${homePath}/prospects`,
      icon: Users,
      active:
        pathname.startsWith(
          `${homePath}/prospects`
        ),
    },
    {
      label: "Plus",
      href: `${homePath}/plus`,
      icon: MoreHorizontal,
      active:
        pathname.startsWith(
          `${homePath}/plus`
        ),
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[1000] border-t border-ink/10 bg-paper/95 px-2 pt-2 backdrop-blur-xl"
      style={{
        paddingBottom:
          "max(10px, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto grid max-w-[520px] grid-cols-5 items-end gap-1">
        {items.map((item) => {
          const Icon =
            item.icon;

          if (item.central) {
            return (
              <a
                key={item.label}
                href={item.href}
                className="flex min-h-[58px] flex-col items-center justify-end"
              >
                <span className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full border-4 border-sand bg-green-700 text-paper shadow-[0_8px_24px_rgba(6,57,46,0.28)]">
                  <Icon
                    className="h-6 w-6"
                    strokeWidth={2}
                  />
                </span>

                <span className="mt-1 text-[10px] font-medium text-green-800">
                  {item.label}
                </span>
              </a>
            );
          }

          return (
            <a
              key={item.label}
              href={item.href}
              className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl ${
                item.active
                  ? "text-green-700"
                  : "text-ink-soft"
              }`}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={
                  item.active
                    ? 2.3
                    : 1.8
                }
              />

              <span
                className={`text-[10px] ${
                  item.active
                    ? "font-semibold"
                    : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
