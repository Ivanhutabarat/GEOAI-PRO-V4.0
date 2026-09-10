/**
 * VAN-BOTZ MEDIA GATEWAY ENGINE (HARDENED RUNTIME LAYER)
 * Inherited and refactored from Van-Botz core utilities to empower GeoAI specialists
 * with media processing, telemetry overlay generation, and base64 parsing.
 */

export interface TelemetryOverlayConfig {
  gridX: number;
  gridY: number;
  anomalousRegion: string;
  depthWindow: string;
  specialistSignature: string;
}

export const VAN_BOTZ_MEDIA_CONSTANTS = {
  SUPPORTED_MIME_TYPES: ["image/png", "image/jpeg", "application/octet-stream", "text/plain"] as const,
  RAW_TELEMETRY_NOISE_FACTOR: 0.15,
  MEDIA_ENGINE_STATUS: "ACTIVE_INHERITED" as const,
} as const;

export class VanBotzMediaEngine {
  /**
   * Helper to convert standard binary buffer arrays to base64 string
   */
  public static arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return typeof window !== "undefined" ? btoa(binary) : Buffer.from(buffer).toString("base64");
  }

  /**
   * Refactored filter to overlay raw sensory noise onto a canvas
   */
  public static applyTelemetryVisualFilter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    noiseSeverity: number = VAN_BOTZ_MEDIA_CONSTANTS.RAW_TELEMETRY_NOISE_FACTOR
  ): void {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    
    // Apply granular mineral-distortion filter
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * noiseSeverity * 255;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));     // Red
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // Green
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // Blue
    }
    
    ctx.putImageData(imgData, 0, 0);
  }

  /**
   * Appends technical telemetry HUD frames onto canvas rendering
   */
  public static drawHardenedTelemetryHUD(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: TelemetryOverlayConfig
  ): void {
    ctx.save();
    
    // Outer Border
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)"; // Emerald-500/40
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Crosshairs
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(239, 68, 68, 0.6)"; // Red-500/60
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width / 2 - 20, height / 2);
    ctx.lineTo(width / 2 + 20, height / 2);
    ctx.moveTo(width / 2, height / 2 - 20);
    ctx.lineTo(width / 2, height / 2 + 20);
    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
    ctx.stroke();

    // Data Indicators
    ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
    ctx.font = "10px monospace";
    ctx.fillText(`GEO-GRID REF: [X:${config.gridX.toFixed(2)}, Y:${config.gridY.toFixed(2)}]`, 20, 30);
    ctx.fillText(`DEPTH PROFILE: ${config.depthWindow}`, 20, 45);
    ctx.fillText(`DETECTED ZONE: ${config.anomalousRegion.toUpperCase()}`, 20, 60);
    
    ctx.fillStyle = "rgba(239, 68, 68, 0.85)";
    ctx.fillText("STATUS: SCAN INTEGRITY CONFIRMED", width - 210, 30);
    ctx.fillText(`SWARM SIG: ${config.specialistSignature.toUpperCase()}`, width - 210, 45);
    ctx.fillText("CORRELATION ID: VAN-BOTZ-V4", width - 210, 60);

    // Tiny corner bracket indicators
    const len = 15;
    ctx.strokeStyle = "rgba(16, 185, 129, 0.9)";
    ctx.lineWidth = 2;
    
    // Top-Left corner
    ctx.beginPath();
    ctx.moveTo(10, 10 + len);
    ctx.lineTo(10, 10);
    ctx.lineTo(10 + len, 10);
    ctx.stroke();

    // Top-Right corner
    ctx.beginPath();
    ctx.moveTo(width - 10 - len, 10);
    ctx.lineTo(width - 10, 10);
    ctx.lineTo(width - 10, 10 + len);
    ctx.stroke();

    // Bottom-Left corner
    ctx.beginPath();
    ctx.moveTo(10, height - 10 - len);
    ctx.lineTo(10, height - 10);
    ctx.lineTo(10 + len, height - 10);
    ctx.stroke();

    // Bottom-Right corner
    ctx.beginPath();
    ctx.moveTo(width - 10 - len, height - 10);
    ctx.lineTo(width - 10, height - 10);
    ctx.lineTo(width - 10, height - 10 - len);
    ctx.stroke();

    ctx.restore();
  }
}
