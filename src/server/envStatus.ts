type KeyStatus = { key: string; present: boolean };

const keys = [
  "DATABASE_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
  "MEDIA_PROVIDER",
  "MEDIA_BUCKET",
  "MEDIA_CDN_BASE_URL",
];

export function getEnvStatus() {
  const status: KeyStatus[] = keys.map((key) => ({
    key,
    present: Boolean(process.env[key]),
  }));

  return {
    total: status.length,
    present: status.filter((entry) => entry.present).length,
    status,
  };
}
