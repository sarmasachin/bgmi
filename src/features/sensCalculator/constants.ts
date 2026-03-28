/** Default suggestion list when DB has no custom models (same names as before). */
export const DEFAULT_CALCULATOR_PHONE_MODELS = [
  "iPhone 13",
  "iPhone 14 Pro",
  "iPhone 15 Ultra",
  "Poco X3 Pro",
  "Poco F5",
  "ROG Phone 7",
  "OnePlus 12",
  "Samsung S24 Ultra",
  "iQOO 12",
  "Redmi Note 13 Pro",
] as const;

/** @deprecated Use DEFAULT_CALCULATOR_PHONE_MODELS or server-passed list */
export const phoneModels = [...DEFAULT_CALCULATOR_PHONE_MODELS];

export const ramOptions = [
  { label: "2 GB", value: 1.15 },
  { label: "3 GB", value: 1.12 },
  { label: "4 GB", value: 1.1 },
  { label: "6 GB", value: 1.05 },
  { label: "8 GB", value: 1.0 },
  { label: "12 GB", value: 0.98 },
  { label: "16 GB", value: 0.96 },
  { label: "24 GB", value: 0.94 },
];

export const ageOptions = [
  { label: "1 साल", value: 1 },
  { label: "2 साल", value: 1.05 },
  { label: "4 साल+", value: 1.15 },
];

export const fingerOptions = [
  { label: "2-Finger", value: 1.2 },
  { label: "4-Finger", value: 1.0 },
];

export const gyroOptions = [
  { label: "Non-Gyro", value: 1 },
  { label: "Gyroscope", value: 3.5 },
];
