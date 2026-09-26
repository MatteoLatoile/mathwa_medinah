import type {
  Metadata,
} from "next";

import {
  setRequestLocale,
} from "next-intl/server";

import {
  ArrowUpRight,
  Building2,
  Bus,
  GraduationCap,
  Home,
  Landmark,
  MapPin,
  ShoppingBag,
  Sparkles,
  Trees,
  Users,
  Utensils,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RiyalIcon from "@/components/RiyalIcon";

import {
  Link,
} from "@/i18n/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type SupportedLocale =
  | "fr"
  | "ar"
  | "en"
  | "ru";

type LocalizedText = Record<
  SupportedLocale,
  string
>;

type DistrictDefinition = {
  id: string;

  name:
    string;

  arabicName?:
    string;

  aliases:
    string[];

  eyebrow:
    LocalizedText;

  summary:
    LocalizedText;

  housing:
    LocalizedText;

  note:
    LocalizedText;

  profiles:
    ProfileKey[];

  amenities:
    AmenityKey[];
};

type ProfileKey =
  | "families"
  | "students"
  | "couples"
  | "expats"
  | "budget"
  | "modern"
  | "central"
  | "quiet";

type AmenityKey =
  | "shops"
  | "restaurants"
  | "mosques"
  | "schools"
  | "parks"
  | "transport"
  | "university"
  | "shopping";

type ListingRow = {
  district:
    | string
    | null;

  monthly_price:
    | number
    | null;

  yearly_price:
    | number
    | null;
};

type DistrictStats = {
  count: number;

  monthlyMin:
    | number
    | null;

  yearlyMin:
    | number
    | null;
};

const pageWords = {
  fr: {
    metaTitle:
      "Les quartiers de Médine | Mathwa",

    metaDescription:
      "Découvrez les principaux quartiers de Médine pour mieux choisir votre logement : ambiance, services, types de logements et annonces disponibles.",

    breadcrumb:
      "Guide des quartiers",

    heroEyebrow:
      "Vivre à Médine",

    heroTitle:
      "Quel quartier choisir à Médine ?",

    heroText:
      "Chaque secteur de Médine possède son propre rythme. Certains permettent de rester proche des zones centrales, d’autres privilégient le calme, les logements récents ou la vie de famille. Ce guide vous aide à comprendre les principales différences avant de choisir votre logement.",

    jumpTitle:
      "Explorer les quartiers",

    introTitle:
      "Un quartier ne se choisit pas seulement sur une carte.",

    introText:
      "La proximité du Masjid Nabawi est importante pour beaucoup de personnes, mais le quotidien dépend aussi des commerces, des écoles, du type de logement, des transports et de l’ambiance des rues. Mathwa rassemble ces repères pour vous aider à comparer les secteurs plus facilement.",

    liveData:
      "Données Mathwa",

    liveDataText:
      "Les chiffres affichés ci-dessous sont calculés à partir des annonces actuellement publiées sur Mathwa. Ils évoluent avec les nouvelles annonces.",

    properties:
      "logements disponibles",

    oneProperty:
      "logement disponible",

    monthlyFrom:
      "Mensuel à partir de",

    yearlyFrom:
      "Annuel à partir de",

    noPrice:
      "Pas encore de prix observé",

    idealFor:
      "Ce quartier peut convenir à",

    dailyLife:
      "Vie quotidienne",

    housing:
      "Se loger dans le quartier",

    remember:
      "À retenir",

    listings:
      "Voir les logements",

    allListings:
      "Voir toutes les annonces",

    noListings:
      "Aucune annonce publiée actuellement",

    observed:
      "Prix observés sur Mathwa",

    footerTitle:
      "Vous hésitez encore entre plusieurs quartiers ?",

    footerText:
      "Parcourez les logements disponibles et comparez le prix, le quartier, les équipements et le type de location.",

    footerCta:
      "Découvrir les logements",

    profiles: {
      families:
        "Familles",

      students:
        "Étudiants",

      couples:
        "Couples",

      expats:
        "Expatriés",

      budget:
        "Budget maîtrisé",

      modern:
        "Logements récents",

      central:
        "Proximité du centre",

      quiet:
        "Recherche de calme",
    },

    amenities: {
      shops:
        "Commerces de proximité",

      restaurants:
        "Restaurants et cafés",

      mosques:
        "Mosquées",

      schools:
        "Écoles et enseignement",

      parks:
        "Espaces familiaux",

      transport:
        "Transports",

      university:
        "Accès université",

      shopping:
        "Centres commerciaux",
    },
  },

  en: {
    metaTitle:
      "Madinah neighbourhoods | Mathwa",

    metaDescription:
      "Discover Madinah's main neighbourhoods and compare atmosphere, services, housing types and available properties.",

    breadcrumb:
      "Neighbourhood guide",

    heroEyebrow:
      "Living in Madinah",

    heroTitle:
      "Which neighbourhood should you choose in Madinah?",

    heroText:
      "Every part of Madinah has its own rhythm. Some areas keep you closer to central Madinah, while others offer quieter streets, newer homes or a more family-oriented environment. This guide helps you understand those differences before choosing a property.",

    jumpTitle:
      "Explore neighbourhoods",

    introTitle:
      "Choosing a neighbourhood is about more than a point on a map.",

    introText:
      "Distance from Masjid Nabawi matters to many residents, but everyday life also depends on shops, schools, housing style, transport and the atmosphere of the streets. Mathwa brings these practical details together to make neighbourhoods easier to compare.",

    liveData:
      "Mathwa data",

    liveDataText:
      "The figures below are calculated from properties currently published on Mathwa and change as new listings are added.",

    properties:
      "properties available",

    oneProperty:
      "property available",

    monthlyFrom:
      "Monthly from",

    yearlyFrom:
      "Yearly from",

    noPrice:
      "No price observed yet",

    idealFor:
      "This area may suit",

    dailyLife:
      "Everyday life",

    housing:
      "Housing in the area",

    remember:
      "Key point",

    listings:
      "View properties",

    allListings:
      "View all properties",

    noListings:
      "No published properties currently",

    observed:
      "Prices observed on Mathwa",

    footerTitle:
      "Still deciding between several neighbourhoods?",

    footerText:
      "Browse available properties and compare price, district, amenities and rental type.",

    footerCta:
      "Browse properties",

    profiles: {
      families:
        "Families",

      students:
        "Students",

      couples:
        "Couples",

      expats:
        "Expats",

      budget:
        "Budget-conscious renters",

      modern:
        "Newer housing",

      central:
        "Central location",

      quiet:
        "Quiet lifestyle",
    },

    amenities: {
      shops:
        "Local shops",

      restaurants:
        "Restaurants and cafés",

      mosques:
        "Mosques",

      schools:
        "Schools and education",

      parks:
        "Family spaces",

      transport:
        "Transport",

      university:
        "University access",

      shopping:
        "Shopping centres",
    },
  },

  ar: {
    metaTitle:
      "أحياء المدينة المنورة | مثوى",

    metaDescription:
      "تعرّف على أبرز أحياء المدينة المنورة وقارن بين طبيعة الحي والخدمات وأنواع السكن والعقارات المتاحة.",

    breadcrumb:
      "دليل الأحياء",

    heroEyebrow:
      "السكن في المدينة",

    heroTitle:
      "أي حي تختار للسكن في المدينة المنورة؟",

    heroText:
      "لكل حي في المدينة المنورة طابعه الخاص. بعض الأحياء أقرب إلى المناطق المركزية، وبعضها أكثر هدوءًا أو يتميز بالمباني الحديثة والحياة العائلية. يساعدك هذا الدليل على فهم الفروقات قبل اختيار السكن.",

    jumpTitle:
      "استكشف الأحياء",

    introTitle:
      "اختيار الحي لا يعتمد على الموقع فقط.",

    introText:
      "القرب من المسجد النبوي مهم لكثير من السكان، لكن الحياة اليومية تعتمد أيضًا على المحلات والمدارس ونوعية السكن والمواصلات وطبيعة الشوارع. يجمع مثوى هذه المعلومات لتسهيل المقارنة بين الأحياء.",

    liveData:
      "بيانات مثوى",

    liveDataText:
      "الأرقام أدناه محسوبة من الإعلانات المنشورة حاليًا على مثوى وتتغير مع إضافة إعلانات جديدة.",

    properties:
      "مساكن متاحة",

    oneProperty:
      "مسكن متاح",

    monthlyFrom:
      "شهريًا ابتداءً من",

    yearlyFrom:
      "سنويًا ابتداءً من",

    noPrice:
      "لا توجد أسعار مسجلة حاليًا",

    idealFor:
      "قد يناسب هذا الحي",

    dailyLife:
      "الحياة اليومية",

    housing:
      "السكن في الحي",

    remember:
      "أهم ما يميز الحي",

    listings:
      "عرض المساكن",

    allListings:
      "عرض جميع الإعلانات",

    noListings:
      "لا توجد إعلانات منشورة حاليًا",

    observed:
      "أسعار مرصودة على مثوى",

    footerTitle:
      "ما زلت محتارًا بين عدة أحياء؟",

    footerText:
      "تصفح المساكن المتاحة وقارن بين الأسعار والأحياء والتجهيزات ونوع الإيجار.",

    footerCta:
      "استكشف المساكن",

    profiles: {
      families:
        "العائلات",

      students:
        "الطلاب",

      couples:
        "الأزواج",

      expats:
        "المقيمون",

      budget:
        "الميزانيات المحدودة",

      modern:
        "الباحثون عن السكن الحديث",

      central:
        "القرب من المركز",

      quiet:
        "الباحثون عن الهدوء",
    },

    amenities: {
      shops:
        "محلات قريبة",

      restaurants:
        "مطاعم ومقاهي",

      mosques:
        "مساجد",

      schools:
        "مدارس وتعليم",

      parks:
        "أماكن عائلية",

      transport:
        "مواصلات",

      university:
        "الوصول للجامعة",

      shopping:
        "مراكز تسوق",
    },
  },

  ru: {
    metaTitle:
      "Районы Медины | Mathwa",

    metaDescription:
      "Познакомьтесь с основными районами Медины: атмосфера, услуги, типы жилья и доступные объявления.",

    breadcrumb:
      "Гид по районам",

    heroEyebrow:
      "Жизнь в Медине",

    heroTitle:
      "Какой район выбрать в Медине?",

    heroText:
      "У каждого района Медины свой характер. Одни находятся ближе к центру, другие предлагают более спокойную среду, новое жильё или удобства для семей. Этот гид поможет сравнить районы перед выбором жилья.",

    jumpTitle:
      "Районы",

    introTitle:
      "Район — это не просто точка на карте.",

    introText:
      "Близость к Масджид ан-Набави важна для многих, но на повседневную жизнь также влияют магазины, школы, тип жилья, транспорт и характер улиц. Mathwa собирает эти ориентиры в одном месте.",

    liveData:
      "Данные Mathwa",

    liveDataText:
      "Цифры ниже рассчитываются по объявлениям, опубликованным на Mathwa сейчас, и обновляются вместе с новыми предложениями.",

    properties:
      "вариантов доступно",

    oneProperty:
      "вариант доступен",

    monthlyFrom:
      "В месяц от",

    yearlyFrom:
      "В год от",

    noPrice:
      "Пока нет данных о цене",

    idealFor:
      "Район может подойти",

    dailyLife:
      "Повседневная жизнь",

    housing:
      "Жильё в районе",

    remember:
      "Главное",

    listings:
      "Посмотреть жильё",

    allListings:
      "Все объявления",

    noListings:
      "Сейчас нет опубликованных объявлений",

    observed:
      "Цены на Mathwa",

    footerTitle:
      "Не можете выбрать между несколькими районами?",

    footerText:
      "Посмотрите доступное жильё и сравните цены, районы, удобства и тип аренды.",

    footerCta:
      "Смотреть жильё",

    profiles: {
      families:
        "Семьи",

      students:
        "Студенты",

      couples:
        "Пары",

      expats:
        "Экспаты",

      budget:
        "Ограниченный бюджет",

      modern:
        "Новое жильё",

      central:
        "Близость к центру",

      quiet:
        "Спокойный район",
    },

    amenities: {
      shops:
        "Магазины рядом",

      restaurants:
        "Рестораны и кафе",

      mosques:
        "Мечети",

      schools:
        "Школы и образование",

      parks:
        "Семейные зоны",

      transport:
        "Транспорт",

      university:
        "Доступ к университету",

      shopping:
        "Торговые центры",
    },
  },
} as const;

const districts: DistrictDefinition[] = [
  {
    id:
      "al-jamiah-faysaliyya",

    name:
      "Al Jamiah / Al Faysaliyya",

    arabicName:
      "الجامعة / الفيصلية",

    aliases: [
      "Al Jamiah",
      "Al Jamia",
      "Jamiah",
      "Al Faysaliyya",
      "Al Faisaliyah",
      "Faysaliyya",
      "Faisaliyah",
    ],

    eyebrow: {
      fr:
        "Connecté et pratique",

      en:
        "Connected and practical",

      ar:
        "موقع عملي ومترابط",

      ru:
        "Удобный и связанный район",
    },

    summary: {
      fr:
        "À l’ouest du centre de Médine, ce secteur profite d’une vie quotidienne très active et d’un accès pratique aux axes menant vers l’Université islamique. On y retrouve une population variée, avec une présence importante d’étudiants et de familles.",

      en:
        "West of central Madinah, this area combines an active everyday environment with convenient access towards the Islamic University. Students and families are both commonly found here.",

      ar:
        "يقع هذا القطاع غرب وسط المدينة ويتميز بحياة يومية نشطة وسهولة الوصول إلى الطرق المؤدية إلى الجامعة الإسلامية. ويسكنه طلاب وعائلات من خلفيات مختلفة.",

      ru:
        "Этот район к западу от центра Медины сочетает активную повседневную жизнь и удобные дороги в сторону Исламского университета. Здесь живут как студенты, так и семьи.",
    },

    housing: {
      fr:
        "Le parc immobilier est assez varié : appartements classiques, logements rénovés et constructions plus récentes selon les rues. Il faut donc comparer l’état réel du bien plutôt que se fier uniquement au nom du quartier.",

      en:
        "Housing varies from standard apartments to renovated units and newer buildings depending on the street. Comparing the actual condition of each property is therefore important.",

      ar:
        "تتنوع العقارات بين الشقق التقليدية والوحدات المجددة والمباني الأحدث بحسب الشارع، لذلك من الأفضل تقييم كل عقار بشكل مستقل.",

      ru:
        "Жильё разнообразное: стандартные квартиры, отремонтированные варианты и более новые здания. Поэтому важно оценивать каждый объект отдельно.",
    },

    note: {
      fr:
        "Un secteur intéressant lorsqu’on veut rester proche des zones universitaires tout en conservant un accès facile aux commerces et aux grands axes.",

      en:
        "A useful option for people who want university access while remaining close to shops and major roads.",

      ar:
        "خيار مناسب لمن يهتم بالقرب من المناطق الجامعية مع سهولة الوصول إلى المحلات والطرق الرئيسية.",

      ru:
        "Хороший вариант для тех, кому важны университет, магазины и удобный выезд на основные дороги.",
    },

    profiles: [
      "students",
      "families",
      "expats",
      "central",
    ],

    amenities: [
      "shops",
      "restaurants",
      "mosques",
      "schools",
      "university",
      "transport",
    ],
  },

  {
    id:
      "sultana-bir-othman",

    name:
      "Sultana / Bir Othman",

    arabicName:
      "سلطانة / بئر عثمان",

    aliases: [
      "Sultana",
      "Bir Othman",
      "Bir Uthman",
      "Bi'r Uthman",
    ],

    eyebrow: {
      fr:
        "Animé ou résidentiel",

      en:
        "Lively or residential",

      ar:
        "حيوي وسكني",

      ru:
        "Активный и жилой",
    },

    summary: {
      fr:
        "Sultana et Bir Othman offrent plusieurs ambiances selon les rues. Les grands axes sont vivants, avec cafés, restaurants et commerces, tandis que certaines poches résidentielles sont beaucoup plus calmes.",

      en:
        "Sultana and Bir Othman offer different atmospheres depending on the street. Main roads are lively with cafés, restaurants and shops, while residential pockets can be considerably quieter.",

      ar:
        "تختلف أجواء سلطانة وبئر عثمان بحسب الشارع؛ فالطرق الرئيسية مليئة بالمقاهي والمطاعم والمحلات، بينما توجد مناطق سكنية أكثر هدوءًا.",

      ru:
        "В Sultana и Bir Othman атмосфера сильно зависит от улицы: основные дороги оживлённые, с кафе и магазинами, а жилые зоны заметно спокойнее.",
    },

    housing: {
      fr:
        "On y trouve des appartements de générations différentes ainsi que des villas dans certaines zones. Le standing peut fortement varier d’une rue à l’autre.",

      en:
        "The area contains apartments from different periods as well as villas in some sections. Quality and finish can vary significantly.",

      ar:
        "توجد شقق من فترات بناء مختلفة، إضافة إلى فلل في بعض المناطق، ويختلف مستوى التشطيب بشكل واضح من شارع لآخر.",

      ru:
        "Здесь встречаются квартиры разных поколений и виллы. Уровень отделки может заметно отличаться от одной улицы к другой.",
    },

    note: {
      fr:
        "L’un de ses avantages est de pouvoir choisir entre un quotidien très animé ou une rue plus résidentielle sans changer complètement de secteur.",

      en:
        "One advantage is being able to choose between a lively daily environment and a calmer residential street within the same broader area.",

      ar:
        "من مميزاته إمكانية الاختيار بين منطقة حيوية جدًا وشارع سكني أهدأ داخل نفس القطاع.",

      ru:
        "Плюс района — возможность выбрать между оживлённой и спокойной жилой средой, оставаясь в одной зоне.",
    },

    profiles: [
      "families",
      "students",
      "couples",
      "expats",
    ],

    amenities: [
      "shops",
      "restaurants",
      "mosques",
      "schools",
      "shopping",
      "transport",
    ],
  },

  {
    id:
      "al-anabis",

    name:
      "Al Anabis",

    arabicName:
      "العنابس",

    aliases: [
      "Al Anabis",
      "Anabis",
      "Al-Anabis",
      "العنابس",
    ],

    eyebrow: {
      fr:
        "Familial et accessible",

      en:
        "Family-oriented and accessible",

      ar:
        "عائلي ومناسب للميزانية",

      ru:
        "Семейный и доступный",
    },

    summary: {
      fr:
        "Al Anabis est un secteur résidentiel où l’on retrouve une ambiance locale et familiale. Certaines rues sont tranquilles tandis que d’autres profitent davantage des commerces et de l’animation des axes voisins.",

      en:
        "Al Anabis is a residential area with a local, family-oriented atmosphere. Some streets are quiet while others benefit from nearby commercial activity.",

      ar:
        "العنابس حي سكني بطابع محلي وعائلي. بعض الشوارع هادئة، بينما تستفيد مناطق أخرى من قرب المحلات والحركة التجارية.",

      ru:
        "Al Anabis — жилой район с местной семейной атмосферой. Одни улицы тихие, другие находятся ближе к торговым зонам.",
    },

    housing: {
      fr:
        "Une partie importante de l’offre concerne des appartements classiques ou rénovés. C’est un secteur où l’on peut encore trouver des logements simples sans rechercher nécessairement du très haut standing.",

      en:
        "Much of the housing stock consists of standard or renovated apartments. It can be suitable for renters prioritising practicality over luxury finishes.",

      ar:
        "جزء كبير من المعروض عبارة عن شقق تقليدية أو مجددة، ما يجعله مناسبًا لمن يبحث عن السكن العملي دون اشتراط الفخامة.",

      ru:
        "Большая часть предложения — стандартные или отремонтированные квартиры. Район подходит тем, кому важнее практичность, чем высокий класс отделки.",
    },

    note: {
      fr:
        "À considérer lorsqu’on cherche un compromis entre vie locale, budget et position assez centrale dans Médine.",

      en:
        "Worth considering for renters balancing local life, budget and a relatively central position.",

      ar:
        "خيار يستحق النظر لمن يبحث عن توازن بين الحياة المحلية والميزانية والموقع.",

      ru:
        "Стоит рассмотреть тем, кто ищет баланс между бюджетом, местной жизнью и расположением.",
    },

    profiles: [
      "families",
      "students",
      "budget",
      "central",
    ],

    amenities: [
      "shops",
      "mosques",
      "schools",
      "parks",
      "transport",
    ],
  },

  {
    id:
      "al-jamawat",

    name:
      "Al Jamawat",

    arabicName:
      "الجموات",

    aliases: [
      "Al Jamawat",
      "Jamawat",
      "Al-Jamawat",
      "الجموات",
    ],

    eyebrow: {
      fr:
        "Résidentiel et ouvert",

      en:
        "Residential and spacious",

      ar:
        "سكني وهادئ",

      ru:
        "Жилой и просторный",
    },

    summary: {
      fr:
        "Al Jamawat se distingue par un environnement résidentiel marqué par les reliefs qui entourent cette partie de Médine. Le secteur regroupe des zones récentes et d’autres plus anciennes, avec une ambiance généralement calme.",

      en:
        "Al Jamawat stands out for its residential environment and the surrounding hills. It contains both newer developments and older sections, with a generally calm atmosphere.",

      ar:
        "يتميز الجموات بطابعه السكني وقربه من الجبال المحيطة بهذه المنطقة من المدينة. ويجمع بين مناطق حديثة وأخرى أقدم ضمن أجواء هادئة عمومًا.",

      ru:
        "Al Jamawat отличается жилой атмосферой и близостью к окружающим холмам. Здесь есть как новые, так и более старые части района.",
    },

    housing: {
      fr:
        "Les annonces peuvent aller de l’appartement classique à des résidences plus modernes et à certaines villas. Les différences de standing entre deux parties du quartier peuvent être importantes.",

      en:
        "Listings can range from standard apartments to modern residences and some villas. Housing quality may differ considerably between sections.",

      ar:
        "يمكن العثور على شقق تقليدية ومجمعات أحدث وبعض الفلل، ويختلف مستوى السكن بشكل واضح بين أجزاء الحي.",

      ru:
        "Предложения варьируются от обычных квартир до современных комплексов и вилл. Качество жилья сильно зависит от части района.",
    },

    note: {
      fr:
        "Un secteur particulièrement intéressant pour les personnes qui souhaitent davantage de calme et d’espace tout en restant dans Médine.",

      en:
        "Particularly interesting for people looking for more space and calm while remaining within Madinah.",

      ar:
        "مناسب لمن يبحث عن هدوء ومساحة أكبر مع البقاء داخل المدينة.",

      ru:
        "Подходит тем, кто хочет больше пространства и тишины, оставаясь в Медине.",
    },

    profiles: [
      "families",
      "quiet",
      "modern",
      "expats",
    ],

    amenities: [
      "shops",
      "restaurants",
      "parks",
      "mosques",
      "transport",
    ],
  },

  {
    id:
      "al-iskan",

    name:
      "Al Iskan",

    arabicName:
      "الإسكان",

    aliases: [
      "Al Iskan",
      "Iskan",
      "Al-Iskan",
      "الإسكان",
    ],

    eyebrow: {
      fr:
        "Grand et très diversifié",

      en:
        "Large and diverse",

      ar:
        "واسع ومتنوّع",

      ru:
        "Большой и разнообразный",
    },

    summary: {
      fr:
        "Al Iskan est un grand secteur résidentiel où se côtoient différentes générations de constructions et plusieurs profils d’habitants. Il est particulièrement tourné vers la vie quotidienne et familiale.",

      en:
        "Al Iskan is a large residential area where different generations of buildings and different resident profiles coexist. Everyday family life is a major feature of the district.",

      ar:
        "الإسكان حي سكني واسع يجمع بين مبانٍ من أجيال مختلفة وسكان من خلفيات متنوعة، ويتميز بطابع عائلي واضح.",

      ru:
        "Al Iskan — большой жилой район, где соседствуют здания разных периодов и жители с разным образом жизни. Он особенно удобен для семей.",
    },

    housing: {
      fr:
        "Ancien, rénové et plus récent peuvent se retrouver à quelques rues de distance. Cette diversité permet de rencontrer plusieurs niveaux de budget dans le même secteur.",

      en:
        "Older, renovated and newer homes may be found only a few streets apart, creating a broad range of budgets within the same area.",

      ar:
        "يمكن أن تجد مباني قديمة ومجددة وأحدث على مسافات قريبة، وهو ما يخلق تنوعًا في مستويات الأسعار.",

      ru:
        "Старое, отремонтированное и более новое жильё может находиться буквально в нескольких улицах друг от друга, поэтому диапазон бюджетов широкий.",
    },

    note: {
      fr:
        "Un quartier pratique lorsqu’on accorde beaucoup d’importance aux écoles, aux services de proximité et à un environnement familial.",

      en:
        "A practical choice for residents who value schools, local services and a family-oriented environment.",

      ar:
        "خيار عملي لمن يهتم بالمدارس والخدمات القريبة والبيئة العائلية.",

      ru:
        "Практичный выбор для тех, кому важны школы, услуги рядом и семейная среда.",
    },

    profiles: [
      "families",
      "expats",
      "budget",
      "students",
    ],

    amenities: [
      "shops",
      "restaurants",
      "schools",
      "parks",
      "mosques",
      "shopping",
      "transport",
    ],
  },

  {
    id:
      "al-aridh",

    name:
      "Al Aridh",

    arabicName:
      "العريض",

    aliases: [
      "Al Aridh",
      "Al-Aridh",
      "Aridh",
      "Al Arid",
      "العريض",
    ],

    eyebrow: {
      fr:
        "Plusieurs quartiers en un",

      en:
        "Several lifestyles in one area",

      ar:
        "أكثر من طابع داخل حي واحد",

      ru:
        "Несколько стилей жизни в одном районе",
    },

    summary: {
      fr:
        "Al Aridh couvre un secteur vaste et ne possède pas une seule ambiance uniforme. Certaines zones sont plus populaires, d’autres plus résidentielles ou plus récentes. C’est justement cette diversité qui le caractérise.",

      en:
        "Al Aridh covers a broad area and does not have a single uniform atmosphere. Some sections feel more traditional, while others are more residential or modern.",

      ar:
        "العريض حي واسع ولا يحمل طابعًا واحدًا؛ فبعض أجزائه شعبية، وأخرى سكنية أو أحدث عمرانًا، وهذا التنوع من أبرز خصائصه.",

      ru:
        "Al Aridh занимает большую территорию и не имеет единого характера: одни части более традиционные, другие жилые и современные.",
    },

    housing: {
      fr:
        "Le choix immobilier y est large : appartements classiques, rénovés, résidences plus récentes et villas selon la sous-zone. Deux annonces portant le même nom de quartier peuvent donc offrir des cadres très différents.",

      en:
        "Housing is broad: standard apartments, renovated properties, newer residences and villas depending on the sub-area.",

      ar:
        "تتنوع الخيارات بين الشقق التقليدية والمجددة والمجمعات الأحدث والفلل بحسب الجزء الداخلي من الحي.",

      ru:
        "Выбор широкий: обычные квартиры, отремонтированное жильё, новые комплексы и виллы в зависимости от конкретной части района.",
    },

    note: {
      fr:
        "À Al Aridh, l’adresse précise et la rue comptent presque autant que le nom du quartier lui-même.",

      en:
        "In Al Aridh, the exact street matters almost as much as the district name itself.",

      ar:
        "في العريض، موقع العقار داخل الحي والشارع مهمان تقريبًا بقدر اسم الحي نفسه.",

      ru:
        "В Al Aridh конкретная улица почти так же важна, как название самого района.",
    },

    profiles: [
      "families",
      "expats",
      "modern",
      "students",
    ],

    amenities: [
      "shops",
      "restaurants",
      "schools",
      "mosques",
      "shopping",
      "transport",
    ],
  },

  {
    id:
      "al-khalidiyyah",

    name:
      "Al Khalidiyyah",

    arabicName:
      "الخالدية",

    aliases: [
      "Al Khalidiyyah",
      "Al Khalidiyya",
      "Khalidiyyah",
      "Khalidiyya",
      "الخالدية",
    ],

    eyebrow: {
      fr:
        "Une vraie vie de quartier",

      en:
        "Strong local everyday life",

      ar:
        "حياة يومية متكاملة",

      ru:
        "Живой повседневный район",
    },

    summary: {
      fr:
        "Al Khalidiyyah est un secteur vivant où les besoins du quotidien sont faciles à trouver. Les rues principales concentrent commerces et services, tandis que les zones résidentielles sont plus calmes.",

      en:
        "Al Khalidiyyah is a lively district where everyday services are easy to find. Main roads concentrate shops and services while residential streets are calmer.",

      ar:
        "الخالدية حي حيوي تتوفر فيه احتياجات الحياة اليومية بسهولة. تتركز المحلات والخدمات في الشوارع الرئيسية، بينما تكون الشوارع السكنية أكثر هدوءًا.",

      ru:
        "Al Khalidiyyah — живой район с большим количеством повседневных услуг. Основные улицы активнее, а жилые части спокойнее.",
    },

    housing: {
      fr:
        "On y trouve un mélange d’immeubles plus anciens, de logements rénovés et de constructions plus récentes. L’offre peut donc convenir à plusieurs budgets.",

      en:
        "The area contains a mix of older buildings, renovated apartments and newer construction, creating options across several budgets.",

      ar:
        "توجد مبانٍ أقدم وشقق مجددة وإنشاءات أحدث، ما يسمح بوجود خيارات لميزانيات مختلفة.",

      ru:
        "Здесь есть старые здания, отремонтированные квартиры и более новые дома, поэтому доступны разные уровни бюджета.",
    },

    note: {
      fr:
        "Son principal atout est la praticité : commerces, restauration, services et vie locale sans devoir systématiquement rejoindre le centre.",

      en:
        "Its main advantage is practicality: shops, food, services and local life without always needing to travel into central Madinah.",

      ar:
        "أبرز مميزاته العملية؛ إذ تتوفر المحلات والمطاعم والخدمات والحياة المحلية دون الحاجة للذهاب دائمًا إلى وسط المدينة.",

      ru:
        "Главное преимущество — практичность: магазины, еда и услуги доступны без постоянных поездок в центр.",
    },

    profiles: [
      "families",
      "expats",
      "budget",
      "couples",
    ],

    amenities: [
      "shops",
      "restaurants",
      "schools",
      "parks",
      "mosques",
      "transport",
    ],
  },

  {
    id:
      "bani-harithah",

    name:
      "Bani Harithah",

    arabicName:
      "بني حارثة",

    aliases: [
      "Bani Harithah",
      "Bani Haritha",
      "Bani Hâritha",
      "بني حارثة",
    ],

    eyebrow: {
      fr:
        "Ancien et authentique",

      en:
        "Older and traditional",

      ar:
        "قديم وأصيل",

      ru:
        "Старый и традиционный",
    },

    summary: {
      fr:
        "Bani Harithah fait partie des secteurs anciens de Médine. Le tissu urbain y est plus traditionnel, avec une véritable vie locale et des constructions de plusieurs générations.",

      en:
        "Bani Harithah is one of Madinah's older residential areas. Its urban fabric is more traditional, with strong local life and buildings from different periods.",

      ar:
        "بني حارثة من الأحياء القديمة في المدينة، ويتميز بطابع عمراني تقليدي وحياة محلية واضحة ومبانٍ من فترات مختلفة.",

      ru:
        "Bani Harithah относится к старым районам Медины. Здесь более традиционная застройка и выраженная местная жизнь.",
    },

    housing: {
      fr:
        "L’offre est principalement constituée de logements anciens ou rénovés, avec quelques bâtiments plus récents. Il peut être intéressant pour ceux qui privilégient la localisation et la simplicité plutôt que le standing.",

      en:
        "Housing is mainly older or renovated, with some newer buildings. It can suit renters who prioritise location and simplicity over luxury.",

      ar:
        "معظم المعروض من المساكن القديمة أو المجددة، مع وجود بعض المباني الأحدث. يناسب من يفضل الموقع والبساطة على الفخامة.",

      ru:
        "Предложение в основном состоит из старого или отремонтированного жилья, с отдельными более новыми зданиями.",
    },

    note: {
      fr:
        "Un secteur à regarder lorsque l’on apprécie les quartiers anciens de Médine et une ambiance plus locale.",

      en:
        "Worth considering for people who appreciate older parts of Madinah and a more local atmosphere.",

      ar:
        "خيار مناسب لمن يفضل الأحياء القديمة والأجواء المحلية في المدينة.",

      ru:
        "Подходит тем, кому нравятся старые районы Медины и местная атмосфера.",
    },

    profiles: [
      "families",
      "students",
      "budget",
      "central",
    ],

    amenities: [
      "shops",
      "restaurants",
      "mosques",
      "schools",
    ],
  },

  {
    id:
      "bani-muawiya",

    name:
      "Bani Muawiya",

    arabicName:
      "بني معاوية",

    aliases: [
      "Bani Muawiya",
      "Bani Mu'awiya",
      "Bani Muâwiya",
      "بني معاوية",
    ],

    eyebrow: {
      fr:
        "Populaire et traditionnel",

      en:
        "Local and traditional",

      ar:
        "شعبي وتقليدي",

      ru:
        "Местный и традиционный",
    },

    summary: {
      fr:
        "Bani Muawiya conserve une ambiance ancienne et populaire. Les rues et les commerces donnent une impression très locale, loin des quartiers résidentiels les plus récents.",

      en:
        "Bani Muawiya retains an older, local atmosphere. Its streets and small businesses feel very different from Madinah's newer residential developments.",

      ar:
        "يحافظ بني معاوية على طابع شعبي وقديم، وتمنح شوارعه ومحلاته أجواء محلية تختلف عن الأحياء الحديثة.",

      ru:
        "Bani Muawiya сохраняет старую местную атмосферу и заметно отличается от новых жилых районов Медины.",
    },

    housing: {
      fr:
        "Les logements sont majoritairement simples et anciens, avec quelques rénovations. Cela peut permettre de trouver des loyers plus abordables que dans les secteurs récents.",

      en:
        "Housing is mainly simple and older, with some renovated units. This can create more affordable options than newer areas.",

      ar:
        "معظم المساكن بسيطة وقديمة مع وجود بعض الوحدات المجددة، ما قد يوفر خيارات أكثر اقتصادية.",

      ru:
        "Большинство жилья простое и старое, иногда после ремонта, поэтому здесь могут встречаться более доступные варианты.",
    },

    note: {
      fr:
        "À privilégier si la proximité, le budget et la vie locale comptent davantage que l’âge du bâtiment ou le niveau de finition.",

      en:
        "Best considered when location, budget and local life matter more than building age or high-end finishes.",

      ar:
        "مناسب لمن يعطي الأولوية للموقع والميزانية والحياة المحلية أكثر من عمر المبنى أو مستوى التشطيب.",

      ru:
        "Подходит тем, для кого важнее бюджет, расположение и местная среда, чем возраст здания.",
    },

    profiles: [
      "budget",
      "students",
      "families",
      "central",
    ],

    amenities: [
      "shops",
      "restaurants",
      "mosques",
      "schools",
      "parks",
    ],
  },

  {
    id:
      "quba",

    name:
      "Quba",

    arabicName:
      "قباء",

    aliases: [
      "Quba",
      "Quba Mosque",
      "Masjid Quba",
      "قباء",
    ],

    eyebrow: {
      fr:
        "Historique et vivant",

      en:
        "Historic and lively",

      ar:
        "تاريخي وحيوي",

      ru:
        "Исторический и оживлённый",
    },

    summary: {
      fr:
        "Quba est l’un des secteurs les plus connus de Médine, notamment grâce à la Mosquée de Quba et aux espaces piétons qui l’entourent. Le quartier combine aujourd’hui patrimoine, vie locale et nouveaux aménagements.",

      en:
        "Quba is one of Madinah's best-known areas, particularly because of Quba Mosque and the pedestrian spaces around it. The district combines heritage, local life and newer public developments.",

      ar:
        "قباء من أشهر مناطق المدينة بفضل مسجد قباء والمناطق المخصصة للمشاة حوله. ويجمع الحي بين التاريخ والحياة المحلية والتطوير الحديث.",

      ru:
        "Quba — один из самых известных районов Медины благодаря мечети Куба и пешеходным зонам вокруг неё. Здесь сочетаются история, местная жизнь и новые проекты.",
    },

    housing: {
      fr:
        "Le parc immobilier est très mélangé : logements anciens, appartements rénovés, constructions récentes et quelques villas. On y rencontre également beaucoup de location courte durée.",

      en:
        "Housing is very mixed: older properties, renovated apartments, newer construction and some villas. Short-term rentals are also common.",

      ar:
        "يتنوع السكن بين العقارات القديمة والشقق المجددة والمباني الحديثة وبعض الفلل، كما تنتشر الإيجارات القصيرة.",

      ru:
        "Жильё очень разнообразное: старые дома, отремонтированные квартиры, новые здания и отдельные виллы. Также распространена краткосрочная аренда.",
    },

    note: {
      fr:
        "Quba peut particulièrement plaire à ceux qui recherchent un quartier avec une forte identité, des espaces où marcher et une vie animée le soir.",

      en:
        "Quba may especially appeal to people looking for a strong neighbourhood identity, walkable areas and lively evenings.",

      ar:
        "قد يناسب قباء من يبحث عن حي ذي هوية واضحة ومساحات للمشي وحياة نشطة في المساء.",

      ru:
        "Quba особенно подойдёт тем, кто ценит узнаваемую атмосферу, прогулочные зоны и активную вечернюю жизнь.",
    },

    profiles: [
      "families",
      "couples",
      "central",
      "expats",
    ],

    amenities: [
      "shops",
      "restaurants",
      "mosques",
      "parks",
      "transport",
      "shopping",
    ],
  },
];

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    locale,
  } =
    await params;

  const safeLocale =
    getLocale(
      locale
    );

  const text =
    pageWords[
      safeLocale
    ];

  return {
    title:
      text.metaTitle,

    description:
      text.metaDescription,
  };
}

export default async function DistrictsPage({
  params,
}: PageProps) {
  const {
    locale,
  } =
    await params;

  setRequestLocale(
    locale
  );

  const safeLocale =
    getLocale(
      locale
    );

  const text =
    pageWords[
      safeLocale
    ];

  const rtl =
    safeLocale ===
    "ar";

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "listings"
      )
      .select(`
        district,
        monthly_price,
        yearly_price
      `)
      .eq(
        "status",
        "published"
      );

  if (
    error
  ) {
    console.error(
      "Erreur chargement statistiques quartiers :",
      error
    );
  }

  const listings =
    (
      data ??
      []
    ) as ListingRow[];

  const stats =
    new Map<
      string,
      DistrictStats
    >();

  for (
    const district of
    districts
  ) {
    const districtListings =
      listings.filter(
        (
          listing
        ) =>
          matchesDistrict(
            listing.district,
            district.aliases
          )
      );

    const monthlyPrices =
      districtListings
        .map(
          (
            listing
          ) =>
            toPositiveNumber(
              listing.monthly_price
            )
        )
        .filter(
          (
            value
          ): value is number =>
            value !==
            null
        );

    const yearlyPrices =
      districtListings
        .map(
          (
            listing
          ) =>
            toPositiveNumber(
              listing.yearly_price
            )
        )
        .filter(
          (
            value
          ): value is number =>
            value !==
            null
        );

    stats.set(
      district.id,
      {
        count:
          districtListings.length,

        monthlyMin:
          monthlyPrices.length >
          0
            ? Math.min(
                ...monthlyPrices
              )
            : null,

        yearlyMin:
          yearlyPrices.length >
          0
            ? Math.min(
                ...yearlyPrices
              )
            : null,
      }
    );
  }

  const localeFormat =
    safeLocale ===
    "ar"
      ? "ar-SA"
      : safeLocale ===
          "en"
        ? "en-US"
        : safeLocale ===
            "ru"
          ? "ru-RU"
          : "fr-FR";

  return (
    <>
      <Header />

      <main
        dir={
          rtl
            ? "rtl"
            : "ltr"
        }
        className="min-h-screen bg-sand"
      >

        {/* =========================================
            HERO
        ========================================= */}

        <section className="relative overflow-hidden border-b border-ink/10 bg-green-900 px-5 pb-20 pt-32 text-paper sm:px-8 sm:pb-24 sm:pt-36">

          <div
            className="pointer-events-none absolute -right-28 -top-32 h-[520px] w-[520px] rounded-full border border-gold/15"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -right-6 -top-10 h-[340px] w-[230px] rounded-t-[999px] border border-paper/10"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-6xl">

            <p className="text-xs font-medium uppercase tracking-[0.22em] text-gold">
              {
                text.heroEyebrow
              }
            </p>

            <h1 className="mt-5 max-w-4xl font-display text-[clamp(3rem,8vw,6.5rem)] font-light leading-[0.95] tracking-[-0.035em] text-paper">
              {
                text.heroTitle
              }
            </h1>

            <p className="mt-7 max-w-2xl text-[0.98rem] leading-7 text-paper/70 sm:text-base">
              {
                text.heroText
              }
            </p>

            <div className="mt-10 flex flex-wrap gap-2">

              {districts.map(
                (
                  district
                ) => (
                  <a
                    key={
                      district.id
                    }
                    href={`#${district.id}`}
                    className="rounded-full border border-paper/15 bg-paper/[0.06] px-4 py-2 text-xs font-medium text-paper/85 backdrop-blur transition hover:border-gold/40 hover:bg-paper/10 hover:text-paper"
                  >
                    {
                      district.name
                    }
                  </a>
                )
              )}

            </div>

          </div>

        </section>

        {/* =========================================
            INTRO
        ========================================= */}

        <section className="px-5 py-16 sm:px-8 sm:py-20">

          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">

            <div>

              <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700">
                {
                  text.breadcrumb
                }
              </p>

              <h2 className="mt-4 font-display text-4xl font-light leading-tight text-ink sm:text-5xl">
                {
                  text.introTitle
                }
              </h2>

            </div>

            <div className="lg:pt-7">

              <p className="text-[0.98rem] leading-8 text-ink-soft">
                {
                  text.introText
                }
              </p>

              <div className="mt-7 rounded-3xl border border-green-700/10 bg-green-100/60 p-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-paper">
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <div>

                    <p className="font-medium text-ink">
                      {
                        text.liveData
                      }
                    </p>

                    <p className="mt-1.5 text-sm leading-6 text-ink-soft">
                      {
                        text.liveDataText
                      }
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =========================================
            QUICK DIRECTORY
        ========================================= */}

        <section className="border-y border-ink/10 bg-paper px-5 py-14 sm:px-8">

          <div className="mx-auto max-w-6xl">

            <div className="flex items-end justify-between gap-4">

              <div>

                <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700">
                  {
                    text.jumpTitle
                  }
                </p>

              </div>

            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

              {districts.map(
                (
                  district,
                  index
                ) => {
                  const districtStats =
                    stats.get(
                      district.id
                    ) ?? {
                      count: 0,
                      monthlyMin: null,
                      yearlyMin: null,
                    };

                  return (
                    <a
                      key={
                        district.id
                      }
                      href={`#${district.id}`}
                      className="group rounded-2xl border border-ink/10 bg-paper p-4 transition hover:-translate-y-0.5 hover:border-green-700/25 hover:shadow-[0_10px_30px_rgba(18,33,28,0.06)]"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <span className="font-display text-2xl text-green-700/30">
                          {
                            String(
                              index +
                              1
                            ).padStart(
                              2,
                              "0"
                            )
                          }
                        </span>

                        <ArrowUpRight className="h-4 w-4 text-ink/20 transition group-hover:text-green-700" />

                      </div>

                      <p className="mt-5 font-medium text-ink">
                        {
                          district.name
                        }
                      </p>

                      {district.arabicName && (
                        <p
                          dir="rtl"
                          className="mt-1 text-xs text-ink-soft"
                        >
                          {
                            district.arabicName
                          }
                        </p>
                      )}

                      <p className="mt-4 text-xs text-green-700">
                        {
                          districtStats.count
                        }{" "}
                        {
                          districtStats.count ===
                          1
                            ? text.oneProperty
                            : text.properties
                        }
                      </p>

                    </a>
                  );
                }
              )}

            </div>

          </div>

        </section>

        {/* =========================================
            DISTRICTS
        ========================================= */}

        <div className="px-5 py-20 sm:px-8">

          <div className="mx-auto max-w-6xl space-y-24">

            {districts.map(
              (
                district,
                index
              ) => {
                const districtStats =
                  stats.get(
                    district.id
                  ) ?? {
                    count: 0,
                    monthlyMin: null,
                    yearlyMin: null,
                  };

                return (
                  <article
                    key={
                      district.id
                    }
                    id={
                      district.id
                    }
                    className="scroll-mt-28"
                  >

                    <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">

                      {/* VISUAL */}

                      <div className="relative min-h-[360px] overflow-hidden rounded-[32px] bg-green-900 p-8 text-paper sm:min-h-[430px] sm:p-10">

                        <div
                          className="absolute -bottom-28 -right-20 h-[360px] w-[260px] rounded-t-[999px] border-[18px] border-paper/[0.06]"
                          aria-hidden="true"
                        />

                        <div
                          className="absolute bottom-0 right-8 h-[260px] w-[170px] rounded-t-[999px] border border-gold/20"
                          aria-hidden="true"
                        />

                        <div className="relative flex h-full flex-col">

                          <div className="flex items-start justify-between">

                            <span className="font-display text-5xl font-light text-paper/15">
                              {
                                String(
                                  index +
                                  1
                                ).padStart(
                                  2,
                                  "0"
                                )
                              }
                            </span>

                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-paper/10 bg-paper/[0.06]">
                              <MapPin className="h-5 w-5 text-gold" />
                            </div>

                          </div>

                          <div className="mt-auto">

                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
                              {
                                district.eyebrow[
                                  safeLocale
                                ]
                              }
                            </p>

                            <h2 className="mt-4 font-display text-4xl font-light leading-none sm:text-5xl">
                              {
                                district.name
                              }
                            </h2>

                            {district.arabicName && (
                              <p
                                dir="rtl"
                                className="mt-3 w-fit text-lg text-paper/55"
                              >
                                {
                                  district.arabicName
                                }
                              </p>
                            )}

                            <div className="mt-8 flex items-center gap-2 text-xs text-paper/65">

                              <Home className="h-4 w-4 text-gold" />

                              {
                                districtStats.count >
                                0
                                  ? `${districtStats.count} ${
                                      districtStats.count ===
                                      1
                                        ? text.oneProperty
                                        : text.properties
                                    }`
                                  : text.noListings
                              }

                            </div>

                          </div>

                        </div>

                      </div>

                      {/* CONTENT */}

                      <div className="flex flex-col justify-center">

                        <p className="text-[0.98rem] leading-8 text-ink-soft">
                          {
                            district.summary[
                              safeLocale
                            ]
                          }
                        </p>

                        {/* PROFILS */}

                        <div className="mt-8">

                          <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink-soft">
                            {
                              text.idealFor
                            }
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">

                            {district.profiles.map(
                              (
                                profile
                              ) => (
                                <span
                                  key={
                                    profile
                                  }
                                  className="rounded-full border border-green-700/10 bg-green-100 px-3.5 py-2 text-xs font-medium text-green-800"
                                >
                                  {
                                    text.profiles[
                                      profile
                                    ]
                                  }
                                </span>
                              )
                            )}

                          </div>

                        </div>

                        {/* AMENITIES */}

                        <div className="mt-8">

                          <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink-soft">
                            {
                              text.dailyLife
                            }
                          </p>

                          <div className="mt-4 grid gap-2 sm:grid-cols-2">

                            {district.amenities.map(
                              (
                                amenity
                              ) => (
                                <AmenityRow
                                  key={
                                    amenity
                                  }
                                  type={
                                    amenity
                                  }
                                  label={
                                    text.amenities[
                                      amenity
                                    ]
                                  }
                                />
                              )
                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* HOUSING + STATS */}

                    <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">

                      <div className="rounded-[28px] border border-ink/10 bg-paper p-6 sm:p-8">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sand text-green-700">
                            <Building2 className="h-4 w-4" />
                          </div>

                          <h3 className="font-display text-2xl font-medium text-ink">
                            {
                              text.housing
                            }
                          </h3>

                        </div>

                        <p className="mt-5 text-sm leading-7 text-ink-soft">
                          {
                            district.housing[
                              safeLocale
                            ]
                          }
                        </p>

                        <div className="mt-7 border-t border-ink/10 pt-6">

                          <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-700">
                            {
                              text.remember
                            }
                          </p>

                          <p className="mt-2 text-sm leading-7 text-ink">
                            {
                              district.note[
                                safeLocale
                              ]
                            }
                          </p>

                        </div>

                      </div>

                      <div className="rounded-[28px] border border-green-700/10 bg-green-100/55 p-6 sm:p-8">

                        <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-800">
                          {
                            text.observed
                          }
                        </p>

                        <div className="mt-6 space-y-5">

                          <PriceStat
                            label={
                              text.monthlyFrom
                            }
                            value={
                              districtStats.monthlyMin
                            }
                            localeFormat={
                              localeFormat
                            }
                            fallback={
                              text.noPrice
                            }
                          />

                          <div className="h-px bg-green-700/10" />

                          <PriceStat
                            label={
                              text.yearlyFrom
                            }
                            value={
                              districtStats.yearlyMin
                            }
                            localeFormat={
                              localeFormat
                            }
                            fallback={
                              text.noPrice
                            }
                          />

                        </div>

                        <div className="mt-8 rounded-2xl bg-paper/70 p-4">

                          <div className="flex items-center gap-3">

                            <Users className="h-4 w-4 shrink-0 text-green-700" />

                            <p className="text-sm text-ink">
                              <span className="font-semibold">
                                {
                                  districtStats.count
                                }
                              </span>{" "}
                              {
                                districtStats.count ===
                                1
                                  ? text.oneProperty
                                  : text.properties
                              }
                            </p>

                          </div>

                        </div>

                        <Link
                          href="/annonces"
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-green-700 px-5 py-3.5 text-sm font-medium text-paper transition hover:bg-green-800"
                        >
                          {
                            districtStats.count >
                            0
                              ? text.listings
                              : text.allListings
                          }

                          <ArrowUpRight className="h-4 w-4" />
                        </Link>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>

        </div>

        {/* =========================================
            CTA FINAL
        ========================================= */}

        <section className="px-5 pb-24 pt-4 sm:px-8">

          <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-green-900 px-7 py-12 text-paper sm:px-12 sm:py-14">

            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">

              <div>

                <Landmark className="h-6 w-6 text-gold" />

                <h2 className="mt-5 max-w-2xl font-display text-4xl font-light leading-tight sm:text-5xl">
                  {
                    text.footerTitle
                  }
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-paper/65">
                  {
                    text.footerText
                  }
                </p>

              </div>

              <Link
                href="/annonces"
                className="inline-flex h-fit items-center justify-center gap-2 rounded-full bg-paper px-6 py-3.5 text-sm font-medium text-green-900 transition hover:bg-sand"
              >
                {
                  text.footerCta
                }

                <ArrowUpRight className="h-4 w-4" />
              </Link>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

/* =========================================
   COMPONENTS
========================================= */

function AmenityRow({
  type,
  label,
}: {
  type:
    AmenityKey;

  label:
    string;
}) {
  const Icon =
    amenityIcon(
      type
    );

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ink/[0.07] bg-paper px-4 py-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sand text-green-700">
        <Icon className="h-3.5 w-3.5" />
      </div>

      <span className="text-sm text-ink-soft">
        {
          label
        }
      </span>

    </div>
  );
}

function PriceStat({
  label,
  value,
  localeFormat,
  fallback,
}: {
  label:
    string;

  value:
    | number
    | null;

  localeFormat:
    string;

  fallback:
    string;
}) {
  return (
    <div>

      <p className="text-xs text-ink-soft">
        {
          label
        }
      </p>

      {value !==
      null ? (

        <div className="mt-2 flex items-center gap-2 text-green-800">

          <RiyalIcon className="h-5 w-5" />

          <span className="font-display text-3xl font-medium">
            {
              value.toLocaleString(
                localeFormat
              )
            }
          </span>

        </div>

      ) : (

        <p className="mt-2 text-sm font-medium text-ink">
          {
            fallback
          }
        </p>

      )}

    </div>
  );
}

/* =========================================
   HELPERS
========================================= */

function getLocale(
  locale:
    string
): SupportedLocale {
  if (
    locale ===
      "ar" ||
    locale ===
      "en" ||
    locale ===
      "ru"
  ) {
    return locale;
  }

  return "fr";
}

function normalizeDistrict(
  value:
    | string
    | null
    | undefined
) {
  return (
    value ??
    ""
  )
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /['’`_-]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function matchesDistrict(
  listingDistrict:
    | string
    | null,
  aliases:
    string[]
) {
  const normalizedListing =
    normalizeDistrict(
      listingDistrict
    );

  if (
    !normalizedListing
  ) {
    return false;
  }

  return aliases.some(
    (
      alias
    ) => {
      const normalizedAlias =
        normalizeDistrict(
          alias
        );

      return (
        normalizedListing ===
          normalizedAlias ||
        normalizedListing.includes(
          normalizedAlias
        ) ||
        normalizedAlias.includes(
          normalizedListing
        )
      );
    }
  );
}

function toPositiveNumber(
  value:
    | number
    | null
    | undefined
) {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return null;
  }

  const parsed =
    Number(
      value
    );

  if (
    !Number.isFinite(
      parsed
    ) ||
    parsed <=
      0
  ) {
    return null;
  }

  return parsed;
}

function amenityIcon(
  type:
    AmenityKey
) {
  switch (
    type
  ) {
    case "restaurants":
      return Utensils;

    case "schools":
      return GraduationCap;

    case "university":
      return GraduationCap;

    case "parks":
      return Trees;

    case "transport":
      return Bus;

    case "shopping":
      return ShoppingBag;

    case "mosques":
      return Landmark;

    case "shops":
    default:
      return ShoppingBag;
  }
}