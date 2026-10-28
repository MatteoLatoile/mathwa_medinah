import {
  Building2,
  ExternalLink,
  Globe2,
  LayoutDashboard,
  Plus,
  Send,
  Smartphone,
} from "lucide-react";

export default async function PocketMorePage({
  params,
}: {
  params:
    Promise<{
      locale: string;
    }>;
}) {
  const {
    locale,
  } =
    await params;

  const links = [
    {
      label:
        "Dashboard complet",
      description:
        "Administration Mathwa classique",
      href:
        `/${locale}/admin`,
      icon:
        LayoutDashboard,
    },
    {
      label:
        "Ajouter un logement",
      description:
        "Créer une nouvelle annonce",
      href:
        `/${locale}/admin/annonces/nouvelle`,
      icon:
        Plus,
    },
    {
      label:
        "Voir Mathwa",
      description:
        "Ouvrir le site public",
      href:
        `/${locale}`,
      icon:
        Globe2,
    },
    {
      label:
        "Chaîne Telegram",
      description:
        "@mathwa_medinah",
      href:
        "https://t.me/mathwa_medinah",
      icon:
        Send,
      external:
        true,
    },
    {
      label:
        "Contact Mathwa",
      description:
        "@Mathwamedina",
      href:
        "https://t.me/Mathwamedina",
      icon:
        Building2,
      external:
        true,
    },
  ];

  return (
    <div>
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-green-700">
          Mathwa Pocket
        </p>

        <h1 className="mt-1 font-display text-3xl text-ink">
          Plus
        </h1>
      </header>

      <div className="mt-6 overflow-hidden rounded-[24px] border border-ink/10 bg-paper">
        {links.map(
          (
            item,
            index
          ) => {
            const Icon =
              item.icon;

            return (
              <a
                key={item.label}
                href={item.href}
                target={
                  item.external
                    ? "_blank"
                    : undefined
                }
                rel={
                  item.external
                    ? "noopener noreferrer"
                    : undefined
                }
                className={`flex min-h-[74px] items-center gap-4 px-4 ${
                  index !==
                  links.length - 1
                    ? "border-b border-ink/5"
                    : ""
                }`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                  <Icon className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">
                    {item.label}
                  </p>

                  <p className="mt-1 truncate text-[11px] text-ink-soft">
                    {item.description}
                  </p>
                </div>

                <ExternalLink className="h-4 w-4 shrink-0 text-ink/25" />
              </a>
            );
          }
        )}
      </div>

      <section className="mt-6 rounded-[24px] bg-green-900 p-5 text-paper">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-paper/10">
          <Smartphone className="h-5 w-5" />
        </div>

        <h2 className="mt-4 font-display text-2xl">
          Installer Mathwa
        </h2>

        <p className="mt-2 text-sm leading-6 text-paper/75">
          Sur iPhone : ouvre cette page dans Safari, touche Partager puis « Sur l&apos;écran d&apos;accueil ».
        </p>

        <p className="mt-3 text-sm leading-6 text-paper/75">
          Sur Android : ouvre Mathwa Pocket dans Chrome puis choisis « Installer l&apos;application » ou « Ajouter à l&apos;écran d&apos;accueil ».
        </p>
      </section>

      <p className="mt-5 text-center text-[10px] leading-5 text-ink-soft">
        Mathwa Pocket est privé et nécessite ton compte administrateur.
      </p>
    </div>
  );
}
