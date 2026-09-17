import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import {
  Armchair,
  ArrowUpDown as ArrowUpDownIcon,
  Banknote,
  Bath,
  Bed,
  Building2,
  Car,
  Check as CheckIcon,
  ChevronLeft as ChevronLeftIcon,
  Droplet,
  Hash,
  Layers,
  MapPin,
  Maximize2,
  Package,
  Pencil,
  ShieldCheck,
  ShieldQuestion,
  Sofa,
  Sparkles,
  UtensilsCrossed,
  Wifi,
  Wind,
  X as XIcon,
  Zap,
  type LucideIcon,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import ListingGallery from "@/components/ListingGallery";

import {
  WhatsappIcon,
  ArchBullet,
} from "@/components/icons";

import { Link } from "@/i18n/navigation";

import { createClient } from "@/lib/supabase/server";
import { whatsappLink } from "@/lib/site";

type PageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

const words = {
  fr: {
    back: "Retour aux appartements",
    month: "par mois",
    year: "par an",
    rent: "Loyer",
    deposit: "Caution",
    bedrooms: "Chambres",
    bathrooms: "Salles de bain",
    livingRooms: "Salons",
    floor: "Étage",
    area: "Surface",
    furnishing: "Ameublement",
    furnished: "Meublé",
    unfurnished: "Non meublé",
    propertyType: "Type de bien",

    propertyTypes: {
      apartment: "Appartement",
      studio: "Studio",
      villa: "Villa",
    },

    included: "Inclus dans le loyer",
    equipment: "Équipements",
    water: "Eau",
    electricity: "Électricité",
    internet: "Internet",
    cleaning: "Ménage",
    airConditioning: "Climatisation",
    elevator: "Ascenseur",
    parking: "Parking",
    kitchen: "Cuisine équipée",
    verified: "Logement vérifié",
    notVerified: "Non vérifié",
    description: "À propos du logement",
    contact: "Demander une visite",
    reference: "Référence",
    location: "Localisation",
    edit: "Modifier l’annonce",

    photos: {
      viewAll: (n: number) =>
        `Voir les ${n} photos`,
      close: "Fermer",
      previous: "Photo précédente",
      next: "Photo suivante",
    },
  },

  en: {
    back: "Back to apartments",
    month: "per month",
    year: "per year",
    rent: "Rent",
    deposit: "Deposit",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    livingRooms: "Living rooms",
    floor: "Floor",
    area: "Area",
    furnishing: "Furnishing",
    furnished: "Furnished",
    unfurnished: "Unfurnished",
    propertyType: "Property type",

    propertyTypes: {
      apartment: "Apartment",
      studio: "Studio",
      villa: "Villa",
    },

    included: "Included in the rent",
    equipment: "Amenities",
    water: "Water",
    electricity: "Electricity",
    internet: "Internet",
    cleaning: "Cleaning",
    airConditioning: "Air conditioning",
    elevator: "Elevator",
    parking: "Parking",
    kitchen: "Equipped kitchen",
    verified: "Verified property",
    notVerified: "Not verified",
    description: "About the property",
    contact: "Request a viewing",
    reference: "Reference",
    location: "Location",
    edit: "Edit listing",

    photos: {
      viewAll: (n: number) =>
        `View all ${n} photos`,
      close: "Close",
      previous: "Previous photo",
      next: "Next photo",
    },
  },

  ar: {
    back: "العودة إلى الشقق",
    month: "شهريًا",
    year: "سنويًا",
    rent: "الإيجار",
    deposit: "التأمين",
    bedrooms: "غرف النوم",
    bathrooms: "دورات المياه",
    livingRooms: "الصالات",
    floor: "الطابق",
    area: "المساحة",
    furnishing: "الفرش",
    furnished: "مفروش",
    unfurnished: "غير مفروش",
    propertyType: "نوع العقار",

    propertyTypes: {
      apartment: "شقة",
      studio: "استوديو",
      villa: "فيلا",
    },

    included: "مشمول في الإيجار",
    equipment: "التجهيزات",
    water: "الماء",
    electricity: "الكهرباء",
    internet: "الإنترنت",
    cleaning: "التنظيف",
    airConditioning: "التكييف",
    elevator: "المصعد",
    parking: "موقف سيارة",
    kitchen: "مطبخ مجهز",
    verified: "سكن موثّق",
    notVerified: "غير موثّق",
    description: "عن السكن",
    contact: "طلب معاينة",
    reference: "رقم الإعلان",
    location: "الموقع",
    edit: "تعديل الإعلان",

    photos: {
      viewAll: (n: number) =>
        `عرض جميع الصور (${n})`,
      close: "إغلاق",
      previous: "الصورة السابقة",
      next: "الصورة التالية",
    },
  },

  ru: {
    back: "Назад к квартирам",
    month: "в месяц",
    year: "в год",
    rent: "Аренда",
    deposit: "Депозит",
    bedrooms: "Спальни",
    bathrooms: "Ванные",
    livingRooms: "Гостиные",
    floor: "Этаж",
    area: "Площадь",
    furnishing: "Меблировка",
    furnished: "С мебелью",
    unfurnished: "Без мебели",
    propertyType: "Тип жилья",

    propertyTypes: {
      apartment: "Квартира",
      studio: "Студия",
      villa: "Вилла",
    },

    included: "Включено в аренду",
    equipment: "Оснащение",
    water: "Вода",
    electricity: "Электричество",
    internet: "Интернет",
    cleaning: "Уборка",
    airConditioning: "Кондиционер",
    elevator: "Лифт",
    parking: "Парковка",
    kitchen: "Оборудованная кухня",
    verified: "Проверенное жильё",
    notVerified: "Не проверено",
    description: "О жилье",
    contact: "Запросить просмотр",
    reference: "Объявление",
    location: "Расположение",
    edit: "Редактировать",

    photos: {
      viewAll: (n: number) =>
        `Показать все фото (${n})`,
      close: "Закрыть",
      previous: "Предыдущее фото",
      next: "Следующее фото",
    },
  },
};

export default async function ListingPage({
  params,
}: PageProps) {
  const {
    locale,
    id,
  } = await params;

  setRequestLocale(
    locale
  );

  const supabase =
    await createClient();

  /* ===============================
     ADMIN CONNECTÉ ?
  =============================== */

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const {
      data,
    } =
      await supabase.rpc(
        "is_admin"
      );

    isAdmin =
      Boolean(data);
  }

  /* ===============================
     ANNONCE
  =============================== */

  const {
    data: listing,
    error,
  } =
    await supabase
      .from("listings")
      .select(`
        id,
        reference,

        title_fr,
        title_ar,
        title_en,
        title_ru,

        description_fr,
        description_ar,
        description_en,
        description_ru,

        district,
        location_label,

        property_type,
        bedrooms,
        bathrooms,
        living_rooms,
        floor,
        area_m2,

        furnished,

        monthly_price,
        yearly_price,
        deposit,

        water_included,
        electricity_included,
        internet_included,
        cleaning_included,

        air_conditioning,
        elevator,
        parking,
        kitchen,

        verified,

        listing_images (
          storage_path,
          position,
          is_cover
        )
      `)
      .eq(
        "id",
        id
      )
      .eq(
        "status",
        "published"
      )
      .single();

  if (
    error ||
    !listing
  ) {
    notFound();
  }

  const text =
    words[
      locale as keyof typeof words
    ] ??
    words.fr;

  const rtl =
    locale ===
    "ar";

  /* ===============================
     TEXTE
  =============================== */

  const title =
    locale === "ar"
      ? listing.title_ar ||
        listing.title_fr
      : locale === "en"
        ? listing.title_en ||
          listing.title_fr
        : locale === "ru"
          ? listing.title_ru ||
            listing.title_fr
          : listing.title_fr;

  const description =
    locale === "ar"
      ? listing.description_ar ||
        listing.description_fr
      : locale === "en"
        ? listing.description_en ||
          listing.description_fr
        : locale === "ru"
          ? listing.description_ru ||
            listing.description_fr
          : listing.description_fr;

  /* ===============================
     PHOTOS
  =============================== */

  const images =
    [
      ...(
        listing.listing_images ??
        []
      ),
    ].sort(
      (
        a,
        b
      ) => {
        if (
          a.is_cover &&
          !b.is_cover
        ) {
          return -1;
        }

        if (
          !a.is_cover &&
          b.is_cover
        ) {
          return 1;
        }

        return (
          a.position -
          b.position
        );
      }
    );

  const photos =
    images.map(
      (
        image
      ) => {
        const {
          data,
        } =
          supabase.storage
            .from(
              "listing-images"
            )
            .getPublicUrl(
              image.storage_path
            );

        return data.publicUrl;
      }
    );

  /* ===============================
     PRIX
  =============================== */

  const monthly =
    listing.monthly_price !==
    null;

  const price =
    monthly
      ? Number(
          listing.monthly_price
        )
      : Number(
          listing.yearly_price ??
            0
        );

  const localeFormat =
    locale === "fr"
      ? "fr-FR"
      : locale === "ar"
        ? "ar-SA"
        : locale === "ru"
          ? "ru-RU"
          : "en-US";

  /* ===============================
     TYPE
  =============================== */

  const propertyTypeLabel =
    listing.property_type
      ? (
          text.propertyTypes as Record<
            string,
            string
          >
        )[
          listing.property_type
        ] ??
        listing.property_type
      : null;

  /* ===============================
     INCLUS
  =============================== */

  const includedItems: {
    label: string;
    on: boolean;
    icon: LucideIcon;
  }[] = [
    {
      label: text.water,
      on:
        listing.water_included,
      icon: Droplet,
    },
    {
      label:
        text.electricity,
      on:
        listing.electricity_included,
      icon: Zap,
    },
    {
      label:
        text.internet,
      on:
        listing.internet_included,
      icon: Wifi,
    },
    {
      label:
        text.cleaning,
      on:
        listing.cleaning_included,
      icon: Sparkles,
    },
  ];

  /* ===============================
     ÉQUIPEMENTS
  =============================== */

  const equipmentItems: {
    label: string;
    on: boolean;
    icon: LucideIcon;
  }[] = [
    {
      label:
        text.airConditioning,
      on:
        listing.air_conditioning,
      icon: Wind,
    },
    {
      label:
        text.elevator,
      on:
        listing.elevator,
      icon:
        ArrowUpDownIcon,
    },
    {
      label:
        text.parking,
      on:
        listing.parking,
      icon: Car,
    },
    {
      label:
        text.kitchen,
      on:
        listing.kitchen,
      icon:
        UtensilsCrossed,
    },
  ];

  /* ===============================
     INFORMATIONS
  =============================== */

  const infoCells: {
    icon: LucideIcon;
    label: string;
    value:
      | string
      | number;
  }[] = [
    {
      icon: Bed,
      label:
        text.bedrooms,
      value:
        listing.bedrooms,
    },
    {
      icon: Bath,
      label:
        text.bathrooms,
      value:
        listing.bathrooms,
    },
    {
      icon:
        Armchair,
      label:
        text.livingRooms,
      value:
        listing.living_rooms,
    },
    {
      icon: Layers,
      label:
        text.floor,
      value:
        listing.floor ===
        null
          ? "—"
          : listing.floor,
    },
  ];

  if (
    listing.area_m2 !==
    null
  ) {
    infoCells.push({
      icon:
        Maximize2,
      label:
        text.area,
      value:
        `${listing.area_m2} m²`,
    });
  }

  infoCells.push({
    icon:
      listing.furnished
        ? Sofa
        : Package,
    label:
      text.furnishing,
    value:
      listing.furnished
        ? text.furnished
        : text.unfurnished,
  });

  if (
    propertyTypeLabel
  ) {
    infoCells.push({
      icon:
        Building2,
      label:
        text.propertyType,
      value:
        propertyTypeLabel,
    });
  }

  /* ===============================
     WHATSAPP
  =============================== */

  const whatsappMessage =
    locale === "ar"
      ? `السلام عليكم، أنا مهتم بالإعلان ${listing.reference} على موقع Mathwa. هل يمكنني الحصول على مزيد من المعلومات وتحديد موعد للمعاينة؟`
      : locale === "en"
        ? `Hello, I am interested in listing ${listing.reference} on Mathwa. I would like more information and to arrange a viewing.`
        : locale === "ru"
          ? `Здравствуйте, меня интересует объявление ${listing.reference} на Mathwa. Я хотел(а) бы получить дополнительную информацию и договориться о просмотре.`
          : `Bonjour, je suis intéressé(e) par l'annonce ${listing.reference} sur Mathwa. J'aimerais avoir plus d'informations et organiser une visite.`;

  return (
    <>
      <Header />

      {/* ===============================
          GROS BOUTON ADMIN
      =============================== */}

      {isAdmin && (
        <a
          href={`/${locale}/admin/annonces/${listing.id}`}
          className="fixed bottom-6 end-6 z-[99999] flex items-center gap-3 rounded-full border border-white/20 bg-green-700 px-7 py-4 text-sm font-semibold text-paper shadow-[0_18px_55px_rgba(6,57,46,0.40)] transition duration-200 hover:-translate-y-1 hover:bg-green-800 hover:shadow-[0_22px_65px_rgba(6,57,46,0.48)]"
        >
          <Pencil
            className="h-5 w-5"
            aria-hidden="true"
          />

          {text.edit}
        </a>
      )}

      <main className="min-h-screen bg-sand px-5 pb-24 pt-28 sm:px-8 sm:pt-32">

        <div className="mx-auto max-w-6xl">

          {/* RETOUR */}

          <Link
            href="/annonces"
            className="group inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-green-700"
          >
            <ChevronLeftIcon
              className={`h-4 w-4 transition-transform group-hover:-translate-x-0.5 ${
                rtl
                  ? "rotate-180"
                  : ""
              }`}
              aria-hidden="true"
            />

            {text.back}
          </Link>

          {/* ===============================
              PHOTOS
          =============================== */}

          <section className="mt-6">

            <ListingGallery
              photos={
                photos
              }
              alt={
                title ??
                ""
              }
              labels={{
                viewAllLabel:
                  text.photos.viewAll(
                    photos.length
                  ),
                close:
                  text.photos.close,
                previous:
                  text.photos.previous,
                next:
                  text.photos.next,
              }}
            />

          </section>

          {/* ===============================
              CONTENU
          =============================== */}

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">

            <div>

              <Reveal>

                <div className="flex flex-wrap items-center gap-3">

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium ${
                      listing.verified
                        ? "bg-green-100 text-green-800"
                        : "bg-paper text-ink-soft"
                    }`}
                  >

                    {listing.verified ? (
                      <ShieldCheck
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    ) : (
                      <ShieldQuestion
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    )}

                    {listing.verified
                      ? text.verified
                      : text.notVerified}

                  </span>

                  <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">

                    <Hash
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />

                    {
                      listing.reference
                    }

                  </span>

                </div>

                <h1 className="mt-5 font-display text-[clamp(2.4rem,6vw,4rem)] font-light leading-[1.05] text-ink">
                  {title}
                </h1>

                <p className="mt-4 inline-flex items-center gap-1.5 text-base text-ink-soft">

                  <MapPin
                    className="h-4 w-4 shrink-0 text-green-700"
                    aria-hidden="true"
                  />

                  {listing.location_label ||
                    listing.district}

                </p>

              </Reveal>

              {/* INFOS */}

              <Reveal
                delay={
                  60
                }
              >

                <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-4">

                  {infoCells.map(
                    (
                      cell
                    ) => (
                      <InfoCell
                        key={
                          cell.label
                        }
                        {...cell}
                      />
                    )
                  )}

                </div>

              </Reveal>

              {/* DESCRIPTION */}

              {description && (
                <Reveal
                  delay={
                    100
                  }
                >

                  <section className="mt-12">

                    <h2 className="font-display text-3xl font-light text-ink">
                      {
                        text.description
                      }
                    </h2>

                    <p className="mt-5 whitespace-pre-line text-[0.95rem] leading-7 text-ink-soft">
                      {
                        description
                      }
                    </p>

                  </section>

                </Reveal>
              )}

              {/* INCLUS */}

              <Reveal
                delay={
                  140
                }
              >

                <section className="mt-12">

                  <h2 className="font-display text-3xl font-light text-ink">
                    {
                      text.included
                    }
                  </h2>

                  <div className="mt-5 flex flex-wrap gap-2.5">

                    {includedItems.map(
                      (
                        item
                      ) => (
                        <ChecklistPill
                          key={
                            item.label
                          }
                          {...item}
                        />
                      )
                    )}

                  </div>

                </section>

              </Reveal>

              {/* ÉQUIPEMENTS */}

              <Reveal
                delay={
                  180
                }
              >

                <section className="mt-12">

                  <h2 className="font-display text-3xl font-light text-ink">
                    {
                      text.equipment
                    }
                  </h2>

                  <div className="mt-5 grid gap-2.5 sm:grid-cols-2">

                    {equipmentItems.map(
                      (
                        item
                      ) => (
                        <ChecklistRow
                          key={
                            item.label
                          }
                          {...item}
                        />
                      )
                    )}

                  </div>

                </section>

              </Reveal>

            </div>

            {/* ===============================
                CARTE CONTACT
            =============================== */}

            <aside>

              <Reveal
                delay={
                  80
                }
              >

                <div className="sticky top-28 overflow-hidden rounded-3xl border border-ink/10 bg-paper shadow-[0_12px_40px_rgba(18,33,28,0.06)]">

                  <ArchBullet
                    className="pointer-events-none absolute -right-4 -top-8 h-32 w-20 text-green-700/5 rtl:-left-4 rtl:right-auto"
                    aria-hidden="true"
                  />

                  <div className="relative p-7">

                    <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                      {
                        text.rent
                      }
                    </p>

                    <p className="mt-1.5 font-display text-4xl font-medium text-green-700">

                      <span aria-hidden="true">
                        {"\u20C1"}
                      </span>

                      {" "}

                      {price.toLocaleString(
                        localeFormat
                      )}

                      <span className="ms-1.5 font-sans text-sm font-normal text-ink-soft">
                        {monthly
                          ? text.month
                          : text.year}
                      </span>

                    </p>

                    {listing.deposit !==
                      null && (
                      <p className="mt-4 flex items-center gap-2 text-sm text-ink-soft">

                        <Banknote
                          className="h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />

                        {
                          text.deposit
                        }

                        <span className="font-medium text-ink">
                          {"\u20C1"}{" "}
                          {Number(
                            listing.deposit
                          ).toLocaleString(
                            localeFormat
                          )}
                        </span>

                      </p>
                    )}

                    <div className="my-7 h-px bg-ink/10" />

                    <p className="flex items-start gap-2 text-sm text-ink-soft">

                      <MapPin
                        className="mt-0.5 h-4 w-4 shrink-0 text-green-700"
                        aria-hidden="true"
                      />

                      <span>

                        {
                          text.location
                        }

                        <br />

                        <span className="font-medium text-ink">
                          {listing.location_label ||
                            listing.district}
                        </span>

                      </span>

                    </p>

                    <a
                      href={whatsappLink(
                        whatsappMessage
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-green-700 px-6 py-4 text-sm font-medium text-paper transition-colors hover:bg-green-800"
                    >

                      <WhatsappIcon className="h-5 w-5" />

                      {
                        text.contact
                      }

                    </a>

                    <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">

                      <Hash
                        className="h-3 w-3"
                        aria-hidden="true"
                      />

                      {
                        listing.reference
                      }

                    </p>

                  </div>

                </div>

              </Reveal>

            </aside>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}

function InfoCell({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value:
    | string
    | number;
}) {
  return (
    <div className="flex flex-col gap-2.5 bg-paper p-5">

      <Icon
        className="h-[18px] w-[18px] text-green-700"
        aria-hidden="true"
      />

      <div>

        <p className="text-xs text-ink-soft">
          {label}
        </p>

        <p className="mt-0.5 font-medium text-ink">
          {value}
        </p>

      </div>

    </div>
  );
}

function ChecklistPill({
  icon: Icon,
  label,
  on,
}: {
  icon: LucideIcon;
  label: string;
  on: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
        on
          ? "border-green-700/15 bg-green-100 text-green-800"
          : "border-ink/10 bg-sand text-ink-soft/70"
      }`}
    >

      <Icon
        className="h-3.5 w-3.5 shrink-0"
        aria-hidden="true"
      />

      {label}

      {on ? (
        <CheckIcon
          className="h-3.5 w-3.5 shrink-0"
          aria-hidden="true"
        />
      ) : (
        <XIcon
          className="h-3.5 w-3.5 shrink-0 opacity-50"
          aria-hidden="true"
        />
      )}

    </span>
  );
}

function ChecklistRow({
  icon: Icon,
  label,
  on,
}: {
  icon: LucideIcon;
  label: string;
  on: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm ${
        on
          ? "border-ink/10 bg-paper text-ink"
          : "border-ink/10 bg-paper/50 text-ink-soft/60"
      }`}
    >

      <Icon
        className={`h-4 w-4 shrink-0 ${
          on
            ? "text-green-700"
            : "text-ink-soft/40"
        }`}
        aria-hidden="true"
      />

      <span className="flex-1">
        {label}
      </span>

      {on ? (
        <CheckIcon
          className="h-4 w-4 shrink-0 text-green-700"
          aria-hidden="true"
        />
      ) : (
        <XIcon
          className="h-4 w-4 shrink-0 opacity-40"
          aria-hidden="true"
        />
      )}

    </div>
  );
}