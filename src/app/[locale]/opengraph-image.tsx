import {
  ImageResponse,
} from "next/og";

export const runtime =
  "edge";

export const alt =
  "Mathwa — Location de logements à Médine";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType =
  "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{
    locale: string;
  }>;
}) {
  const {
    locale,
  } = await params;

  const content =
    locale === "ar"
      ? {
          title:
            "مثوى",
          subtitle:
            "سكنك في المدينة المنورة",
          description:
            "شقق وسكن للإيجار في المدينة المنورة",
          badge:
            "المدينة المنورة",
        }
      : locale === "en"
        ? {
            title:
              "Mathwa",
            subtitle:
              "Your home in Madinah",
            description:
              "Apartments and accommodation for rent in Madinah",
            badge:
              "Madinah",
          }
        : locale === "ru"
          ? {
              title:
                "Mathwa",
              subtitle:
                "Ваше жильё в Медине",
              description:
                "Квартиры и жильё в аренду в Медине",
              badge:
                "Медина",
            }
          : {
              title:
                "Mathwa",
              subtitle:
                "Votre logement à Médine",
              description:
                "Appartements et logements à louer à Médine",
              badge:
                "Médine",
            };

  const rtl =
    locale === "ar";

  return new ImageResponse(
    (
      <div
        dir={
          rtl
            ? "rtl"
            : "ltr"
        }
        style={{
          width:
            "100%",
          height:
            "100%",
          display:
            "flex",
          position:
            "relative",
          overflow:
            "hidden",
          background:
            "#06392e",
          color:
            "#f4efe3",
          padding:
            "70px 80px",
        }}
      >
        {/* HALO */}

        <div
          style={{
            position:
              "absolute",
            width:
              "700px",
            height:
              "700px",
            borderRadius:
              "9999px",
            right:
              "-220px",
            top:
              "-180px",
            background:
              "radial-gradient(circle, rgba(201,163,98,0.28) 0%, rgba(201,163,98,0.06) 45%, transparent 70%)",
          }}
        />

        {/* ARCHE */}

        <div
          style={{
            position:
              "absolute",
            right:
              "90px",
            bottom:
              "-170px",
            width:
              "380px",
            height:
              "520px",
            border:
              "18px solid rgba(244,239,227,0.12)",
            borderBottom:
              "none",
            borderTopLeftRadius:
              "190px",
            borderTopRightRadius:
              "190px",
          }}
        />

        <div
          style={{
            position:
              "absolute",
            right:
              "145px",
            bottom:
              "-170px",
            width:
              "270px",
            height:
              "420px",
            border:
              "7px solid rgba(201,163,98,0.25)",
            borderBottom:
              "none",
            borderTopLeftRadius:
              "140px",
            borderTopRightRadius:
              "140px",
          }}
        />

        {/* CONTENU */}

        <div
          style={{
            display:
              "flex",
            flexDirection:
              "column",
            justifyContent:
              "space-between",
            width:
              "760px",
            height:
              "100%",
            zIndex:
              10,
          }}
        >
          {/* LOGO TEXTUEL */}

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "18px",
            }}
          >
            <div
              style={{
                width:
                  "60px",
                height:
                  "60px",
                borderRadius:
                  "18px",
                background:
                  "#f4efe3",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color:
                  "#06392e",
                fontSize:
                  "30px",
                fontWeight:
                  700,
              }}
            >
              M
            </div>

            <div
              style={{
                fontSize:
                  "31px",
                fontWeight:
                  600,
                letterSpacing:
                  "1px",
              }}
            >
              Mathwa
            </div>
          </div>

          {/* TITRE */}

          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                width:
                  "fit-content",
                padding:
                  "10px 18px",
                borderRadius:
                  "999px",
                background:
                  "rgba(217,235,228,0.12)",
                border:
                  "1px solid rgba(244,239,227,0.16)",
                fontSize:
                  "18px",
                color:
                  "#d9ebe4",
                marginBottom:
                  "24px",
              }}
            >
              {
                content.badge
              }
            </div>

            <div
              style={{
                fontSize:
                  rtl
                    ? "66px"
                    : "72px",
                lineHeight:
                  1.05,
                fontWeight:
                  500,
                letterSpacing:
                  rtl
                    ? "0"
                    : "-2px",
              }}
            >
              {
                content.subtitle
              }
            </div>

            <div
              style={{
                marginTop:
                  "24px",
                fontSize:
                  "26px",
                lineHeight:
                  1.4,
                color:
                  "rgba(244,239,227,0.75)",
              }}
            >
              {
                content.description
              }
            </div>
          </div>

          {/* DOMAINE */}

          <div
            style={{
              display:
                "flex",
              fontSize:
                "20px",
              color:
                "#c9a362",
              letterSpacing:
                "0.5px",
            }}
          >
            www.mathwa-medinah.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}