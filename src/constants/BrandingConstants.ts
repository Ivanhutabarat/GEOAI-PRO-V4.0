/**
 * IMMUTABLE BRANDING AND SYSTEM INTRO CONSTANTS (HARD-LOCKED RUNTIME LAYER)
 * Hardcoded configuration sealed with TypeScript const assertions to prevent runtime mutation.
 */

const getEnv = (key: string, fallback: string): string => {
  if (typeof process !== "undefined" && process?.env?.[key]) {
    return process.env[key] as string;
  }
  if (typeof import.meta !== "undefined" && import.meta?.env?.[`VITE_${key}`]) {
    return import.meta.env[`VITE_${key}`] as string;
  }
  return fallback;
};

export const BRANDING = {
  APP_NAME: "GeoAI Pro",
  APP_VERSION: "v4.0",
  APP_CREDIT: "By " + getEnv("DEV_FULLNAME", import.meta.env.VITE_DEV_SIGNATURE),
  APP_SHORT_CREDIT: "By " + getEnv("DEV_NICKNAME", import.meta.env.VITE_DEV_SIGNATURE),
  TRANSITION_DELAY_MS: 1000,
  INITIAL_BOOT_DELAY_MS: 2500,
  SUPPORT_TARGET_NUMBER: getEnv("DEV_PHONE", "+6285260245100"),
  SUPPORT_TARGET_JID: getEnv("DEV_PHONE", "6285260245100") + "@s.whatsapp.net",
  BOT_WHATSAPP: getEnv("BOT_WHATSAPP", "+6283130571301"),
  DEVELOPER_EMAIL: getEnv("DEV_EMAIL", "ivanhutabarat94@gmail.com"),
  DEVELOPER_NAME: getEnv("DEV_FULLNAME", import.meta.env.VITE_DEV_SIGNATURE),
  OTP_SENDER_PATH: "/api/whatsapp/send-otp",
  PURGE_ENDPOINT: "/api/purge-knowledge",
  SECURITY_CHECKUM: "dcf49f5a39a29811c496dbdeace5f6f15ba28ea3575cb649f01d2c9b667d1e73"
} as const;

