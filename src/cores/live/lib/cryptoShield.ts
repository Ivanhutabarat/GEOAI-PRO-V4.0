// src/lib/cryptoShield.ts

// Secure XOR salt for local state encryption
const SECURE_SALT = "vanbotz-swarm-shield-dcf49f5a39a2";

/**
 * Encrypts a sensitive key string for safe local browser state persistence
 */
export function encryptKey(key: string): string {
  if (!key) return "";
  try {
    let result = "";
    for (let i = 0; i < key.length; i++) {
      const charCode = key.charCodeAt(i) ^ SECURE_SALT.charCodeAt(i % SECURE_SALT.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(unescape(encodeURIComponent(result)));
  } catch (e) {
    console.error("[Privacy Shield] Refusing to log plaintext keys on encryption fail.");
    return "";
  }
}

/**
 * Decrypts a previously obfuscated key string back to runtime context memory
 */
export function decryptKey(encoded: string): string {
  if (!encoded) return "";
  try {
    const raw = decodeURIComponent(escape(atob(encoded)));
    let result = "";
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i) ^ SECURE_SALT.charCodeAt(i % SECURE_SALT.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    return "";
  }
}

/**
 * Global Regex Sanitizer to scrub raw API keys or Swarm tokens from any telemetry logs
 */
export function scrubTelemetryLogs(rawString: string): string {
  if (!rawString) return "";
  
  // Pattern matching for typical Gemini keys (AIzaSy...)
  const geminiPattern = /AIzaSy[A-Za-z0-9_\-]{33}/gi;
  // Pattern matching for Swarm tokens / custom credentials format
  const swarmPattern = /swarm-token-[A-Za-z0-9_\-]{16,64}/gi;
  // Generic token boundary scrubbing helper
  const genericSecretVal = /("key"\s*:\s*")[^"]+(")/gi;
  // Pattern matching for Bot Gateway number (083130571301 or 6283130571301 or variations with +)
  const botNumberPattern = /(\+?62|0)83130571301/g;

  let scrubbed = rawString.replace(geminiPattern, "[REDACTED_GEMINI_KEY]");
  scrubbed = scrubbed.replace(swarmPattern, "[REDACTED_SWARM_TOKEN]");
  scrubbed = scrubbed.replace(genericSecretVal, '$1[REDACTED_SECRET]$2');
  scrubbed = scrubbed.replace(botNumberPattern, "[REDACTED_BOT_GATEWAY]");
  
  return scrubbed;
}
