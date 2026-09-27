import {
  NextRequest,
  NextResponse,
} from "next/server";

const GRAPH_API_VERSION =
  "v25.0";

async function sendWhatsAppMessage(
  to: string,
  message: string
) {
  const accessToken =
    process.env.WHATSAPP_ACCESS_TOKEN;

  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (
    !accessToken ||
    !phoneNumberId
  ) {
    throw new Error(
      "Variables WhatsApp manquantes."
    );
  }

  const response =
    await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${accessToken}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            messaging_product:
              "whatsapp",

            recipient_type:
              "individual",

            to,

            type:
              "text",

            text: {
              preview_url:
                false,

              body:
                "Bienvenue sur Mathwa 🏠\n\nVotre message a bien été reçu.\n\nLe bot Mathwa fonctionne ✅",
            },
          }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    console.error(
      "Erreur Meta :",
      data
    );

    throw new Error(
      data?.error?.message ??
        "Impossible d'envoyer le message WhatsApp."
    );
  }

  return data;
}

/* =========================================
   VÉRIFICATION DU WEBHOOK META
========================================= */

export async function GET(
  request: NextRequest
) {
  const searchParams =
    request.nextUrl.searchParams;

  const mode =
    searchParams.get(
      "hub.mode"
    );

  const token =
    searchParams.get(
      "hub.verify_token"
    );

  const challenge =
    searchParams.get(
      "hub.challenge"
    );

  const verifyToken =
    process.env
      .WHATSAPP_VERIFY_TOKEN;

  if (
    mode === "subscribe" &&
    token === verifyToken &&
    challenge
  ) {
    return new NextResponse(
      challenge,
      {
        status: 200,

        headers: {
          "Content-Type":
            "text/plain",
        },
      }
    );
  }

  return NextResponse.json(
    {
      error:
        "Webhook verification failed",
    },
    {
      status: 403,
    }
  );
}

/* =========================================
   RÉCEPTION DES MESSAGES WHATSAPP
========================================= */

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    console.log(
      "Webhook WhatsApp reçu :",
      JSON.stringify(
        body,
        null,
        2
      )
    );

    const message =
      body?.entry?.[0]
        ?.changes?.[0]
        ?.value?.messages?.[0];

    /*
     * Meta envoie également des événements
     * de statut : envoyé, délivré, lu, etc.
     *
     * Dans ce cas il n'y a pas de message
     * utilisateur et on ne répond pas.
     */
    if (!message) {
      return NextResponse.json({
        received: true,
      });
    }

    const from =
      String(
        message.from ?? ""
      ).trim();

    if (!from) {
      return NextResponse.json({
        received: true,
      });
    }

    await sendWhatsAppMessage(
      from,
      "Bienvenue sur Mathwa"
    );

    return NextResponse.json(
      {
        received: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Erreur webhook WhatsApp :",
      error
    );

    /*
     * On renvoie quand même 200 à Meta
     * pour éviter les tentatives répétées
     * pendant nos tests.
     */
    return NextResponse.json(
      {
        received: true,
      },
      {
        status: 200,
      }
    );
  }
}