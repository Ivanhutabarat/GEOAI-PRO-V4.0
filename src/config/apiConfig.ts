// src/config/apiConfig.ts

import { decryptKey } from "../lib/cryptoShield";

export const API_KEYS = {
  ONSHORE_API_KEY: import.meta.env.VITE_ONSHORE_API_KEY || "",
  OFFSHORE_API_KEY: import.meta.env.VITE_OFFSHORE_API_KEY || "",
  MASTER_API_KEY: import.meta.env.VITE_MASTER_API_KEY || "",
};

export const BACKUP_API_KEYS = [
  // Keys securely moved to server-side backend logic. Do not insert plain text keys here.
];

let currentKeyIndex = -1; // -1 means use MASTER_API_KEY

export function resetApiKeys(): void {
  currentKeyIndex++;
  if (currentKeyIndex >= BACKUP_API_KEYS.length) {
    currentKeyIndex = -1; // Loop back to master
  }
}

export function getEffectiveApiKey(cycleError: boolean = false): string {
  // Check override from secure encrypted storage first
  try {
    const encoded = localStorage.getItem("_vanbotz_encrypted_gemini_key");
    if (encoded) {
      const decoded = decryptKey(encoded);
      if (decoded && decoded.trim().length > 0) {
        return decoded;
      }
    }
  } catch (e) {
    // Silent fail to abide by privacy shield rules
  }

  if (cycleError) {
    currentKeyIndex++;
    if (currentKeyIndex >= BACKUP_API_KEYS.length) {
      currentKeyIndex = -1; // Loop back to master
    }
  }
  return currentKeyIndex === -1 ? (API_KEYS.MASTER_API_KEY || BACKUP_API_KEYS[0]) : BACKUP_API_KEYS[currentKeyIndex];
}