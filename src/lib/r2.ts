import "server-only";

import {
  S3Client,
} from "@aws-sdk/client-s3";

function requiredEnv(
  name: string
) {
  const value =
    process.env[name];

  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}`
    );
  }

  return value;
}

export const R2_ACCOUNT_ID =
  requiredEnv(
    "R2_ACCOUNT_ID"
  );

export const R2_ACCESS_KEY_ID =
  requiredEnv(
    "R2_ACCESS_KEY_ID"
  );

export const R2_SECRET_ACCESS_KEY =
  requiredEnv(
    "R2_SECRET_ACCESS_KEY"
  );

export const R2_BUCKET_NAME =
  requiredEnv(
    "R2_BUCKET_NAME"
  );

export const R2_PUBLIC_URL =
  requiredEnv(
    "R2_PUBLIC_URL"
  ).replace(
    /\/+$/,
    ""
  );

export const r2 =
  new S3Client({
    region:
      "auto",

    endpoint:
      `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,

    credentials: {
      accessKeyId:
        R2_ACCESS_KEY_ID,

      secretAccessKey:
        R2_SECRET_ACCESS_KEY,
    },
  });

export function getR2PublicUrl(
  key: string
) {
  const encodedKey =
    key
      .split("/")
      .map(
        encodeURIComponent
      )
      .join("/");

  return `${R2_PUBLIC_URL}/${encodedKey}`;
}