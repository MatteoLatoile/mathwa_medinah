import {
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import {
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  getR2PublicUrl,
  r2,
  R2_BUCKET_NAME,
} from "@/lib/r2";

const ALLOWED_VIDEO_TYPES =
  new Set([
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ]);

const MAX_VIDEO_SIZE =
  300 *
  1024 *
  1024;

async function checkAdmin() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      allowed:
        false,
    };
  }

  const {
    data:
      isAdmin,
  } =
    await supabase.rpc(
      "is_admin"
    );

  return {
    supabase,
    allowed:
      Boolean(
        isAdmin
      ),
  };
}

function safeExtension(
  fileName: string,
  contentType: string
) {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    extension ===
      "mp4" ||
    extension ===
      "webm" ||
    extension ===
      "mov"
  ) {
    return extension;
  }

  if (
    contentType ===
    "video/webm"
  ) {
    return "webm";
  }

  if (
    contentType ===
    "video/quicktime"
  ) {
    return "mov";
  }

  return "mp4";
}

export async function POST(
  request: Request
) {
  try {
    const {
      allowed,
    } =
      await checkAdmin();

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Non autorisé.",
        },
        {
          status:
            401,
        }
      );
    }

    const body =
      await request.json();

    const listingId =
      String(
        body.listingId ??
          ""
      ).trim();

    const fileName =
      String(
        body.fileName ??
          ""
      ).trim();

    const contentType =
      String(
        body.contentType ??
          ""
      ).trim();

    const fileSize =
      Number(
        body.fileSize ??
          0
      );

    if (
      !listingId ||
      !fileName
    ) {
      return NextResponse.json(
        {
          error:
            "Annonce ou fichier manquant.",
        },
        {
          status:
            400,
        }
      );
    }

    if (
      !ALLOWED_VIDEO_TYPES.has(
        contentType
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Format vidéo non accepté.",
        },
        {
          status:
            400,
        }
      );
    }

    if (
      !Number.isFinite(
        fileSize
      ) ||
      fileSize <=
        0 ||
      fileSize >
        MAX_VIDEO_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            "La vidéo doit faire moins de 300 Mo.",
        },
        {
          status:
            400,
        }
      );
    }

    const extension =
      safeExtension(
        fileName,
        contentType
      );

    const key =
      `listings/${listingId}/` +
      `video-${crypto.randomUUID()}.${extension}`;

    const command =
      new PutObjectCommand({
        Bucket:
          R2_BUCKET_NAME,

        Key:
          key,

        ContentType:
          contentType,
      });

    const uploadUrl =
      await getSignedUrl(
        r2,
        command,
        {
          expiresIn:
            900,
        }
      );

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl:
        getR2PublicUrl(
          key
        ),
    });
  } catch (
    error
  ) {
    console.error(
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Erreur R2.",
      },
      {
        status:
          500,
      }
    );
  }
}

export async function DELETE(
  request: Request
) {
  try {
    const {
      supabase,
      allowed,
    } =
      await checkAdmin();

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Non autorisé.",
        },
        {
          status:
            401,
        }
      );
    }

    const body =
      await request.json();

    const listingId =
      String(
        body.listingId ??
          ""
      ).trim();

    if (!listingId) {
      return NextResponse.json(
        {
          error:
            "Annonce manquante.",
        },
        {
          status:
            400,
        }
      );
    }

    const {
      data:
        listing,
      error:
        listingError,
    } =
      await supabase
        .from(
          "listings"
        )
        .select(
          "video_path"
        )
        .eq(
          "id",
          listingId
        )
        .single();

    if (
      listingError
    ) {
      return NextResponse.json(
        {
          error:
            listingError.message,
        },
        {
          status:
            400,
        }
      );
    }

    const videoPath =
      listing?.video_path;

    if (
      videoPath
    ) {
      await r2.send(
        new DeleteObjectCommand({
          Bucket:
            R2_BUCKET_NAME,

          Key:
            videoPath,
        })
      );
    }

    const {
      error:
        updateError,
    } =
      await supabase
        .from(
          "listings"
        )
        .update({
          video_path:
            null,
        })
        .eq(
          "id",
          listingId
        );

    if (
      updateError
    ) {
      return NextResponse.json(
        {
          error:
            updateError.message,
        },
        {
          status:
            400,
        }
      );
    }

    return NextResponse.json({
      success:
        true,
    });
  } catch (
    error
  ) {
    console.error(
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Erreur R2.",
      },
      {
        status:
          500,
      }
    );
  }
}