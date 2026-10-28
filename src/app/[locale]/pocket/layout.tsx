import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import PocketNav from "@/components/pocket/PocketNav";

export const metadata:
  Metadata = {
    title:
      "Mathwa Pocket",

    description:
      "Administration mobile privée de Mathwa",

    robots: {
      index: false,
      follow: false,
    },

    manifest:
      "/pocket-manifest.webmanifest",

    appleWebApp: {
      capable: true,
      title: "Mathwa",
      statusBarStyle:
        "black-translucent",
    },
  };

export const dynamic =
  "force-dynamic";

export default async function PocketLayout({
  children,
  params,
}: {
  children:
    ReactNode;

  params:
    Promise<{
      locale: string;
    }>;
}) {
  const {
    locale,
  } =
    await params;

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/${locale}/admin/login`
    );
  }

  const {
    data:
      isAdmin,
  } =
    await supabase.rpc(
      "is_admin"
    );

  if (!isAdmin) {
    redirect(
      `/${locale}`
    );
  }

  return (
    <div className="min-h-screen bg-sand pb-28 text-ink">
      <main className="mx-auto w-full max-w-[520px] px-4 pb-6 pt-5">
        {children}
      </main>

      <PocketNav
        locale={locale}
      />
    </div>
  );
}
