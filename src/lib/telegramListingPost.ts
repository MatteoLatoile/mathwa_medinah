import "server-only";

import {
  escapeTelegramHtml,
} from "@/lib/telegram";

export type TelegramLocale =
  | "fr"
  | "ar"
  | "en"
  | "ru";

export type TelegramListing = {
  id: string;
  reference:
    | string
    | null;

  district:
    | string
    | null;

  property_type:
    | string
    | null;

  bedrooms:
    | number
    | null;

  bathrooms:
    | number
    | null;

  living_rooms:
    | number
    | null;

  floor:
    | number
    | null;

  area_m2:
    | number
    | null;

  furnished:
    | boolean
    | null;

  monthly_price:
    | number
    | null;

  yearly_price:
    | number
    | null;

  water_included:
    | boolean
    | null;

  electricity_included:
    | boolean
    | null;

  internet_included:
    | boolean
    | null;

  air_conditioning:
    | boolean
    | null;

  elevator:
    | boolean
    | null;

  parking:
    | boolean
    | null;

  kitchen:
    | boolean
    | null;

  nabawi_distance_km:
    | number
    | null;

  title_fr:
    | string
    | null;

  title_ar:
    | string
    | null;

  title_en:
    | string
    | null;

  title_ru:
    | string
    | null;
};

const SITE_URL =
  (
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    "https://www.mathwa-medinah.com"
  ).replace(
    /\/$/,
    ""
  );

const TELEGRAM_CONTACT =
  "@Mathwamedina";

function formatNumber(
  value: number,
  locale:
    TelegramLocale
) {
  return new Intl.NumberFormat(
    locale === "ar"
      ? "ar-SA"
      : locale === "ru"
        ? "ru-RU"
        : locale === "en"
          ? "en-US"
          : "fr-FR",
    {
      maximumFractionDigits:
        2,
    }
  ).format(
    value
  );
}

function getTitle(
  listing:
    TelegramListing,
  locale:
    TelegramLocale
) {
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

  return (
    title ||
    listing.reference ||
    "Mathwa"
  );
}

function getListingUrl(
  listingId: string,
  locale:
    TelegramLocale
) {
  return `${SITE_URL}/${locale}/annonces/${listingId}`;
}

function buildFrench(
  listing:
    TelegramListing
) {
  const lines:
    string[] =
    [];

  lines.push(
    `🏠 <b>${escapeTelegramHtml(
      getTitle(
        listing,
        "fr"
      )
    )}</b>`
  );

  if (
    listing.district
  ) {
    lines.push(
      `📍 ${escapeTelegramHtml(
        listing.district
      )} – Médine`
    );
  }

  if (
    listing.bedrooms !==
    null &&
    listing.bedrooms >
      0
  ) {
    lines.push(
      `🛏 ${listing.bedrooms} chambre${listing.bedrooms > 1 ? "s" : ""}`
    );
  }

  if (
    listing.living_rooms !==
    null &&
    listing.living_rooms >
      0
  ) {
    lines.push(
      `🛋 ${listing.living_rooms} salon${listing.living_rooms > 1 ? "s" : ""}`
    );
  }

  if (
    listing.bathrooms !==
    null &&
    listing.bathrooms >
      0
  ) {
    lines.push(
      `🚿 ${listing.bathrooms} salle${listing.bathrooms > 1 ? "s" : ""} de bain`
    );
  }

  if (
    listing.kitchen
  ) {
    lines.push(
      "🍳 Cuisine"
    );
  }

  if (
    listing.furnished
  ) {
    lines.push(
      "🪑 Meublé"
    );
  }

  if (
    listing.air_conditioning
  ) {
    lines.push(
      "❄️ Climatisation"
    );
  }

  if (
    listing.water_included
  ) {
    lines.push(
      "💧 Eau incluse"
    );
  }

  if (
    listing.electricity_included
  ) {
    lines.push(
      "⚡ Électricité incluse"
    );
  }

  if (
    listing.internet_included
  ) {
    lines.push(
      "🌐 Internet inclus"
    );
  }

  if (
    listing.nabawi_distance_km !==
    null
  ) {
    lines.push(
      `🕌 À environ ${formatNumber(
        listing.nabawi_distance_km,
        "fr"
      )} km du Masjid Nabawi`
    );
  }

  lines.push(
    ""
  );

  if (
    listing.monthly_price !==
    null
  ) {
    lines.push(
      `💰 <b>${formatNumber(
        listing.monthly_price,
        "fr"
      )} SAR / mois</b>`
    );
  }

  if (
    listing.yearly_price !==
    null
  ) {
    lines.push(
      `💰 <b>${formatNumber(
        listing.yearly_price,
        "fr"
      )} SAR / an</b>`
    );
  }

  lines.push(
    ""
  );

  lines.push(
    `🔎 <a href="${getListingUrl(
      listing.id,
      "fr"
    )}">Voir l'annonce complète sur Mathwa</a>`
  );

  lines.push(
    `💬 Contact Telegram : ${TELEGRAM_CONTACT}`
  );

  return lines.join(
    "\n"
  );
}

function buildArabic(
  listing:
    TelegramListing
) {
  const lines:
    string[] =
    [];

  lines.push(
    `🏠 <b>${escapeTelegramHtml(
      getTitle(
        listing,
        "ar"
      )
    )}</b>`
  );

  if (
    listing.district
  ) {
    lines.push(
      `📍 ${escapeTelegramHtml(
        listing.district
      )} – المدينة المنورة`
    );
  }

  if (
    listing.bedrooms !==
    null &&
    listing.bedrooms >
      0
  ) {
    lines.push(
      `🛏 ${formatNumber(
        listing.bedrooms,
        "ar"
      )} غرف`
    );
  }

  if (
    listing.living_rooms !==
    null &&
    listing.living_rooms >
      0
  ) {
    lines.push(
      `🛋 ${formatNumber(
        listing.living_rooms,
        "ar"
      )} صالة`
    );
  }

  if (
    listing.bathrooms !==
    null &&
    listing.bathrooms >
      0
  ) {
    lines.push(
      `🚿 ${formatNumber(
        listing.bathrooms,
        "ar"
      )} دورات مياه`
    );
  }

  if (
    listing.kitchen
  ) {
    lines.push(
      "🍳 مطبخ"
    );
  }

  if (
    listing.furnished
  ) {
    lines.push(
      "🪑 مفروشة"
    );
  }

  if (
    listing.air_conditioning
  ) {
    lines.push(
      "❄️ مكيفات"
    );
  }

  if (
    listing.water_included
  ) {
    lines.push(
      "💧 الماء مشمول"
    );
  }

  if (
    listing.electricity_included
  ) {
    lines.push(
      "⚡ الكهرباء مشمولة"
    );
  }

  if (
    listing.internet_included
  ) {
    lines.push(
      "🌐 الإنترنت مشمول"
    );
  }

  if (
    listing.nabawi_distance_km !==
    null
  ) {
    lines.push(
      `🕌 تبعد حوالي ${formatNumber(
        listing.nabawi_distance_km,
        "ar"
      )} كم عن المسجد النبوي`
    );
  }

  lines.push(
    ""
  );

  if (
    listing.monthly_price !==
    null
  ) {
    lines.push(
      `💰 <b>${formatNumber(
        listing.monthly_price,
        "ar"
      )} ريال / شهريًا</b>`
    );
  }

  if (
    listing.yearly_price !==
    null
  ) {
    lines.push(
      `💰 <b>${formatNumber(
        listing.yearly_price,
        "ar"
      )} ريال / سنويًا</b>`
    );
  }

  lines.push(
    ""
  );

  lines.push(
    `🔎 <a href="${getListingUrl(
      listing.id,
      "ar"
    )}">للمزيد من المعلومات والصور</a>`
  );

  lines.push(
    `💬 للتواصل عبر تيليجرام: ${TELEGRAM_CONTACT}`
  );

  return lines.join(
    "\n"
  );
}

function buildEnglish(
  listing:
    TelegramListing
) {
  const lines:
    string[] =
    [];

  lines.push(
    `🏠 <b>${escapeTelegramHtml(
      getTitle(
        listing,
        "en"
      )
    )}</b>`
  );

  if (
    listing.district
  ) {
    lines.push(
      `📍 ${escapeTelegramHtml(
        listing.district
      )} – Madinah`
    );
  }

  if (
    listing.bedrooms !==
    null &&
    listing.bedrooms >
      0
  ) {
    lines.push(
      `🛏 ${listing.bedrooms} bedroom${listing.bedrooms > 1 ? "s" : ""}`
    );
  }

  if (
    listing.living_rooms !==
    null &&
    listing.living_rooms >
      0
  ) {
    lines.push(
      `🛋 ${listing.living_rooms} living room${listing.living_rooms > 1 ? "s" : ""}`
    );
  }

  if (
    listing.bathrooms !==
    null &&
    listing.bathrooms >
      0
  ) {
    lines.push(
      `🚿 ${listing.bathrooms} bathroom${listing.bathrooms > 1 ? "s" : ""}`
    );
  }

  if (
    listing.kitchen
  ) {
    lines.push(
      "🍳 Kitchen"
    );
  }

  if (
    listing.furnished
  ) {
    lines.push(
      "🪑 Furnished"
    );
  }

  if (
    listing.air_conditioning
  ) {
    lines.push(
      "❄️ Air conditioning"
    );
  }

  if (
    listing.water_included
  ) {
    lines.push(
      "💧 Water included"
    );
  }

  if (
    listing.electricity_included
  ) {
    lines.push(
      "⚡ Electricity included"
    );
  }

  if (
    listing.internet_included
  ) {
    lines.push(
      "🌐 Internet included"
    );
  }

  if (
    listing.nabawi_distance_km !==
    null
  ) {
    lines.push(
      `🕌 Approx. ${formatNumber(
        listing.nabawi_distance_km,
        "en"
      )} km from Masjid Nabawi`
    );
  }

  lines.push(
    ""
  );

  if (
    listing.monthly_price !==
    null
  ) {
    lines.push(
      `💰 <b>${formatNumber(
        listing.monthly_price,
        "en"
      )} SAR / month</b>`
    );
  }

  if (
    listing.yearly_price !==
    null
  ) {
    lines.push(
      `💰 <b>${formatNumber(
        listing.yearly_price,
        "en"
      )} SAR / year</b>`
    );
  }

  lines.push(
    ""
  );

  lines.push(
    `🔎 <a href="${getListingUrl(
      listing.id,
      "en"
    )}">More information and photos on Mathwa</a>`
  );

  lines.push(
    `💬 Telegram contact: ${TELEGRAM_CONTACT}`
  );

  return lines.join(
    "\n"
  );
}

function buildRussian(
  listing:
    TelegramListing
) {
  const lines:
    string[] =
    [];

  lines.push(
    `🏠 <b>${escapeTelegramHtml(
      getTitle(
        listing,
        "ru"
      )
    )}</b>`
  );

  if (
    listing.district
  ) {
    lines.push(
      `📍 ${escapeTelegramHtml(
        listing.district
      )} – Медина`
    );
  }

  if (
    listing.bedrooms !==
    null &&
    listing.bedrooms >
      0
  ) {
    lines.push(
      `🛏 Спальни: ${listing.bedrooms}`
    );
  }

  if (
    listing.living_rooms !==
    null &&
    listing.living_rooms >
      0
  ) {
    lines.push(
      `🛋 Гостиные: ${listing.living_rooms}`
    );
  }

  if (
    listing.bathrooms !==
    null &&
    listing.bathrooms >
      0
  ) {
    lines.push(
      `🚿 Ванные комнаты: ${listing.bathrooms}`
    );
  }

  if (
    listing.kitchen
  ) {
    lines.push(
      "🍳 Кухня"
    );
  }

  if (
    listing.furnished
  ) {
    lines.push(
      "🪑 С мебелью"
    );
  }

  if (
    listing.air_conditioning
  ) {
    lines.push(
      "❄️ Кондиционер"
    );
  }

  if (
    listing.water_included
  ) {
    lines.push(
      "💧 Вода включена"
    );
  }

  if (
    listing.electricity_included
  ) {
    lines.push(
      "⚡ Электричество включено"
    );
  }

  if (
    listing.internet_included
  ) {
    lines.push(
      "🌐 Интернет включён"
    );
  }

  if (
    listing.nabawi_distance_km !==
    null
  ) {
    lines.push(
      `🕌 Примерно ${formatNumber(
        listing.nabawi_distance_km,
        "ru"
      )} км от Масджид ан-Набави`
    );
  }

  lines.push(
    ""
  );

  if (
    listing.monthly_price !==
    null
  ) {
    lines.push(
      `💰 <b>${formatNumber(
        listing.monthly_price,
        "ru"
      )} SAR / месяц</b>`
    );
  }

  if (
    listing.yearly_price !==
    null
  ) {
    lines.push(
      `💰 <b>${formatNumber(
        listing.yearly_price,
        "ru"
      )} SAR / год</b>`
    );
  }

  lines.push(
    ""
  );

  lines.push(
    `🔎 <a href="${getListingUrl(
      listing.id,
      "ru"
    )}">Подробнее и все фотографии на Mathwa</a>`
  );

  lines.push(
    `💬 Связаться в Telegram: ${TELEGRAM_CONTACT}`
  );

  return lines.join(
    "\n"
  );
}

export function buildTelegramListingPost(
  listing:
    TelegramListing,
  locale:
    TelegramLocale
) {
  switch (
    locale
  ) {
    case "ar":
      return buildArabic(
        listing
      );

    case "en":
      return buildEnglish(
        listing
      );

    case "ru":
      return buildRussian(
        listing
      );

    default:
      return buildFrench(
        listing
      );
  }
}