import {
  notFound,
} from "next/navigation";

import {
  setRequestLocale,
} from "next-intl/server";

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
  Navigation,
  Package,
  ShieldCheck,
  ShieldQuestion,
  Sofa,
  Sparkles,
  Users,
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
import RiyalIcon from "@/components/RiyalIcon";

import {
  WhatsappIcon,
  ArchBullet,
} from "@/components/icons";

import {
  Link,
} from "@/i18n/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  whatsappLink,
} from "@/lib/site";

import {
  getR2PublicUrl,
} from "@/lib/r2";

type PageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

const words = {
  fr: {
    back:
      "Retour aux appartements",

    month:
      "par mois",

    year:
      "par an",

    rent:
      "Loyer",

    deposit:
      "Caution",

    bedrooms:
      "Chambres",

    bathrooms:
      "Salles de bain",

    livingRooms:
      "Salons",

    floor:
      "Étage",

    area:
      "Surface",

    furnishing:
      "Ameublement",

    furnished:
      "Meublé",

    unfurnished:
      "Non meublé",

    propertyType:
      "Type de bien",

    propertyTypes: {
      apartment:
        "Appartement",

      studio:
        "Studio",

      villa:
        "Villa",

      house:
        "Maison",

      room:
        "Chambre",
    },

    occupancy:
      "Type de location",

    occupancyTypes: {
      private:
        "Logement entier",

      shared_women:
        "Colocation femmes",

      shared_men:
        "Colocation hommes",
    },

    distance:
      "Distance du Masjid Nabawi",

    km:
      "km",

    included:
      "Inclus dans le loyer",

    equipment:
      "Équipements",

    water:
      "Eau",

    electricity:
      "Électricité",

    internet:
      "Internet",

    cleaning:
      "Ménage",

    airConditioning:
      "Climatisation",

    elevator:
      "Ascenseur",

    parking:
      "Parking",

    kitchen:
      "Cuisine équipée",

    verified:
      "Logement vérifié",

    notVerified:
      "Non vérifié",

    description:
      "À propos du logement",

    contact:
      "Demander une visite",

    reference:
      "Référence",

    location:
      "Quartier",

    photos: {
      viewAll:
        (
          n: number
        ) =>
          `Voir les ${n} photos`,

      viewAllMedia:
        (
          n: number
        ) =>
          `Voir les ${n} médias`,

      close:
        "Fermer",

      previous:
        "Média précédent",

      next:
        "Média suivant",

      video:
        "Visite vidéo",

      playVideo:
        "Lire la visite vidéo",
    },
  },

  en: {
    back:
      "Back to apartments",

    month:
      "per month",

    year:
      "per year",

    rent:
      "Rent",

    deposit:
      "Deposit",

    bedrooms:
      "Bedrooms",

    bathrooms:
      "Bathrooms",

    livingRooms:
      "Living rooms",

    floor:
      "Floor",

    area:
      "Area",

    furnishing:
      "Furnishing",

    furnished:
      "Furnished",

    unfurnished:
      "Unfurnished",

    propertyType:
      "Property type",

    propertyTypes: {
      apartment:
        "Apartment",

      studio:
        "Studio",

      villa:
        "Villa",

      house:
        "House",

      room:
        "Room",
    },

    occupancy:
      "Rental type",

    occupancyTypes: {
      private:
        "Entire property",

      shared_women:
        "Women only shared accommodation",

      shared_men:
        "Men only shared accommodation",
    },

    distance:
      "Distance from Masjid Nabawi",

    km:
      "km",

    included:
      "Included in the rent",

    equipment:
      "Amenities",

    water:
      "Water",

    electricity:
      "Electricity",

    internet:
      "Internet",

    cleaning:
      "Cleaning",

    airConditioning:
      "Air conditioning",

    elevator:
      "Elevator",

    parking:
      "Parking",

    kitchen:
      "Equipped kitchen",

    verified:
      "Verified property",

    notVerified:
      "Not verified",

    description:
      "About the property",

    contact:
      "Request a viewing",

    reference:
      "Reference",

    location:
      "District",

    photos: {
      viewAll:
        (
          n: number
        ) =>
          `View all ${n} photos`,

      viewAllMedia:
        (
          n: number
        ) =>
          `View all ${n} media`,

      close:
        "Close",

      previous:
        "Previous media",

      next:
        "Next media",

      video:
        "Video tour",

      playVideo:
        "Play video tour",
    },
  },

  ar: {
    back:
      "العودة إلى الشقق",

    month:
      "شهريًا",

    year:
      "سنويًا",

    rent:
      "الإيجار",

    deposit:
      "التأمين",

    bedrooms:
      "غرف النوم",

    bathrooms:
      "دورات المياه",

    livingRooms:
      "الصالات",

    floor:
      "الطابق",

    area:
      "المساحة",

    furnishing:
      "الفرش",

    furnished:
      "مفروش",

    unfurnished:
      "غير مفروش",

    propertyType:
      "نوع العقار",

    propertyTypes: {
      apartment:
        "شقة",

      studio:
        "استوديو",

      villa:
        "فيلا",

      house:
        "منزل",

      room:
        "غرفة",
    },

    occupancy:
      "نوع السكن",

    occupancyTypes: {
      private:
        "سكن كامل",

      shared_women:
        "سكن مشترك للنساء",

      shared_men:
        "سكن مشترك للرجال",
    },

    distance:
      "المسافة عن المسجد النبوي",

    km:
      "كم",

    included:
      "مشمول في الإيجار",

    equipment:
      "التجهيزات",

    water:
      "الماء",

    electricity:
      "الكهرباء",

    internet:
      "الإنترنت",

    cleaning:
      "التنظيف",

    airConditioning:
      "التكييف",

    elevator:
      "المصعد",

    parking:
      "موقف سيارة",

    kitchen:
      "مطبخ مجهز",

    verified:
      "سكن موثّق",

    notVerified:
      "غير موثّق",

    description:
      "عن السكن",

    contact:
      "طلب معاينة",

    reference:
      "رقم الإعلان",

    location:
      "الحي",

    photos: {
      viewAll:
        (
          n: number
        ) =>
          `عرض جميع الصور (${n})`,

      viewAllMedia:
        (
          n: number
        ) =>
          `عرض جميع الوسائط (${n})`,

      close:
        "إغلاق",

      previous:
        "الوسائط السابقة",

      next:
        "الوسائط التالية",

      video:
        "جولة بالفيديو",

      playVideo:
        "تشغيل جولة الفيديو",
    },
  },

  ru: {
    back:
      "Назад к квартирам",

    month:
      "в месяц",

    year:
      "в год",

    rent:
      "Аренда",

    deposit:
      "Депозит",

    bedrooms:
      "Спальни",

    bathrooms:
      "Ванные",

    livingRooms:
      "Гостиные",

    floor:
      "Этаж",

    area:
      "Площадь",

    furnishing:
      "Меблировка",

    furnished:
      "С мебелью",

    unfurnished:
      "Без мебели",

    propertyType:
      "Тип жилья",

    propertyTypes: {
      apartment:
        "Квартира",

      studio:
        "Студия",

      villa:
        "Вилла",

      house:
        "Дом",

      room:
        "Комната",
    },

    occupancy:
      "Тип аренды",

    occupancyTypes: {
      private:
        "Отдельное жильё",

      shared_women:
        "Совместное жильё для женщин",

      shared_men:
        "Совместное жильё для мужчин",
    },

    distance:
      "Расстояние до Масджид ан-Набави",

    km:
      "км",

    included:
      "Включено в аренду",

    equipment:
      "Оснащение",

    water:
      "Вода",

    electricity:
      "Электричество",

    internet:
      "Интернет",

    cleaning:
      "Уборка",

    airConditioning:
      "Кондиционер",

    elevator:
      "Лифт",

    parking:
      "Парковка",

    kitchen:
      "Оборудованная кухня",

    verified:
      "Проверенное жильё",

    notVerified:
      "Не проверено",

    description:
      "О жилье",

    contact:
      "Запросить просмотр",

    reference:
      "Номер объявления",

    location:
      "Район",

    photos: {
      viewAll:
        (
          n: number
        ) =>
          `Показать все фото (${n})`,

      viewAllMedia:
        (
          n: number
        ) =>
          `Показать все медиа (${n})`,

      close:
        "Закрыть",

      previous:
        "Предыдущее медиа",

      next:
        "Следующее медиа",

      video:
        "Видеообзор",

      playVideo:
        "Воспроизвести видеообзор",
    },
  },
};

export default async function ListingPage({
  params,
}: PageProps) {
  const {
    locale,
    id,
  } =
    await params;

  setRequestLocale(
    locale
  );

  const supabase =
    await createClient();

  const {
    data:
      listing,
    error,
  } =
    await supabase
      .from(
        "listings"
      )
      .select(
        `
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

        property_type,
        occupancy_type,
        nabawi_distance_km,

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

        video_path,

        listing_images (
          storage_path,
          position,
          is_cover
        )
      `
      )
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

  const title =
    locale ===
    "ar"
      ? listing.title_ar ||
        listing.title_fr
      : locale ===
          "en"
        ? listing.title_en ||
          listing.title_fr
        : locale ===
            "ru"
          ? listing.title_ru ||
            listing.title_fr
          : listing.title_fr;

  const description =
    locale ===
    "ar"
      ? listing.description_ar ||
        listing.description_fr
      : locale ===
          "en"
        ? listing.description_en ||
          listing.description_fr
        : locale ===
            "ru"
          ? listing.description_ru ||
            listing.description_fr
          : listing.description_fr;

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

  const videoUrl =
    listing.video_path
      ? getR2PublicUrl(
          listing.video_path
        )
      : null;

  const mediaCount =
    photos.length +
    (
      videoUrl
        ? 1
        : 0
    );

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
    locale ===
    "fr"
      ? "fr-FR"
      : locale ===
          "ar"
        ? "ar-SA"
        : locale ===
            "ru"
          ? "ru-RU"
          : "en-US";

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

  const occupancyLabel =
    (
      text.occupancyTypes as Record<
        string,
        string
      >
    )[
      listing.occupancy_type ??
      "private"
    ] ??
    listing.occupancy_type ??
    text.occupancyTypes.private;

  const includedItems: {
    label:
      string;
    on:
      boolean;
    icon:
      LucideIcon;
  }[] = [
    {
      label:
        text.water,
      on:
        listing.water_included,
      icon:
        Droplet,
    },

    {
      label:
        text.electricity,
      on:
        listing.electricity_included,
      icon:
        Zap,
    },

    {
      label:
        text.internet,
      on:
        listing.internet_included,
      icon:
        Wifi,
    },

    {
      label:
        text.cleaning,
      on:
        listing.cleaning_included,
      icon:
        Sparkles,
    },
  ];

  const equipmentItems: {
    label:
      string;
    on:
      boolean;
    icon:
      LucideIcon;
  }[] = [
    {
      label:
        text.airConditioning,
      on:
        listing.air_conditioning,
      icon:
        Wind,
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
      icon:
        Car,
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

  const infoCells: {
    icon:
      LucideIcon;
    label:
      string;
    value:
      string |
      number;
  }[] = [
    {
      icon:
        Bed,
      label:
        text.bedrooms,
      value:
        listing.bedrooms,
    },

    {
      icon:
        Bath,
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
      icon:
        Layers,
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

  infoCells.push({
    icon:
      Users,

    label:
      text.occupancy,

    value:
      occupancyLabel,
  });

  if (
    listing.nabawi_distance_km !==
    null
  ) {
    infoCells.push({
      icon:
        Navigation,

      label:
        text.distance,

      value:
        `${Number(
          listing.nabawi_distance_km
        ).toLocaleString(
          localeFormat,
          {
            maximumFractionDigits:
              2,
          }
        )} ${text.km}`,
    });
  }

  const whatsappMessage =
    locale ===
    "ar"
      ? `السلام عليكم، أنا مهتم بالإعلان ${listing.reference} على موقع Mathwa. هل يمكنني الحصول على مزيد من المعلومات وتحديد موعد للمعاينة؟`
      : locale ===
          "en"
        ? `Hello, I am interested in listing ${listing.reference} on Mathwa. I would like more information and to arrange a viewing.`
        : locale ===
            "ru"
          ? `Здравствуйте, меня интересует объявление ${listing.reference} на Mathwa. Я хотел(а) бы получить дополнительную информацию и договориться о просмотре.`
          : `Bonjour, je suis intéressé(e) par l'annonce ${listing.reference} sur Mathwa. J'aimerais avoir plus d'informations et organiser une visite.`;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-sand px-5 pb-24 pt-28 sm:px-8 sm:pt-32">

        <div className="mx-auto max-w-6xl">

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

            {
              text.back
            }

          </Link>

          <section className="mt-6">

            <ListingGallery
              photos={
                photos
              }
              videoUrl={
                videoUrl
              }
              alt={
                title ??
                ""
              }
              labels={{
                viewAllLabel:
                  videoUrl
                    ? text.photos.viewAllMedia(
                        mediaCount
                      )
                    : text.photos.viewAll(
                        photos.length
                      ),

                close:
                  text.photos.close,

                previous:
                  text.photos.previous,

                next:
                  text.photos.next,

                video:
                  text.photos.video,

                playVideo:
                  text.photos.playVideo,
              }}
            />

          </section>

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

                  {
                    listing.district
                  }

                </p>

              </Reveal>

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

                      <RiyalIcon className="me-1 h-[0.82em] w-[0.82em] align-[-0.05em]" />

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

                        <span className="inline-flex items-center font-medium text-ink">

                          <RiyalIcon className="me-1 h-[0.9em] w-[0.9em]" />

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
                          {
                            listing.district
                          }
                        </span>

                      </span>

                    </p>

                    <a
                      href={
                        whatsappLink(
                          whatsappMessage
                        )
                      }
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
  icon:
    LucideIcon;
  label:
    string;
  value:
    string |
    number;
}) {
  return (
    <div className="flex flex-col gap-2.5 bg-paper p-5">

      <Icon
        className="h-[18px] w-[18px] text-green-700"
        aria-hidden="true"
      />

      <div>

        <p className="text-xs text-ink-soft">
          {
            label
          }
        </p>

        <p className="mt-0.5 font-medium text-ink">
          {
            value
          }
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
  icon:
    LucideIcon;
  label:
    string;
  on:
    boolean;
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

      {
        label
      }

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
  icon:
    LucideIcon;
  label:
    string;
  on:
    boolean;
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
        {
          label
        }
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