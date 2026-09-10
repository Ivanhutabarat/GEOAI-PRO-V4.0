// src/api/webhook/whatsapp.ts
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Simulated WhatsApp Webhook for receiving base64 files (.las/.segy) or raw text messages
export const whatsappWebhookHandler = async (req: Request, res: Response) => {
  try {
    const { sender, fileName, fileData, mimeType, text, message } = req.body;

    const targetNumber = (process.env.DEV_PHONE || "6285260245100").replace(/\D/g, "");
    const cleanedSender = sender ? sender.toString().replace(/[^0-9]/g, "") : "";
    if (cleanedSender && cleanedSender !== targetNumber && !cleanedSender.endsWith(targetNumber)) {
      console.log(`[Webhook Guard] Strictly ignoring unapproved sender: ${sender}`);
      return res.status(200).json({ success: false, message: 'Ignored: Non-approved number.' });
    }

    // Gatekeeper Validation Layer (Lightweight Zero-Friction Integrity Check)
    const SYSTEM_AUTHOR = process.env.DEV_FULLNAME || "";
    let isIntegrityIntact = true;
    try {
      if (!SYSTEM_AUTHOR || SYSTEM_AUTHOR === "[REDACTED_IDENTITY]") {
        isIntegrityIntact = false;
      } else {
        const lockPath = path.join(process.cwd(), "config", ".identity_lock");
        if (fs.existsSync(lockPath)) {
          const lockContent = fs.readFileSync(lockPath, "utf-8");
          const parsedLock = JSON.parse(lockContent);
          if (!parsedLock.signature || !parsedLock.signature.includes(SYSTEM_AUTHOR)) {
            isIntegrityIntact = false;
          }
        } else {
          isIntegrityIntact = false;
        }
      }
    } catch (e) {
      isIntegrityIntact = false;
    }

    if (!isIntegrityIntact) {
      console.error("[Webhook Gatekeeper] UNAUTHORIZED: System integrity check failed! Author credit has been altered.");
      return res.status(401).json({ error: "Unauthorized: System integrity check failed." });
    }

    if (!fileName || !fileData) {
      const chatText = text || message;
      if (chatText) {
        console.log(`[Webhook] Raw text received from ${sender || 'Unknown'}: "${chatText}"`);
        return res.status(200).json({
          success: true,
          type: 'text',
          sender: sender || 'Unknown',
          receivedText: chatText,
          message: 'Text message received and logged successfully.'
        });
      }
      return res.status(400).json({ error: 'Missing required fields: fileName and fileData, or text/message content.' });
    }

    console.log(`[Webhook] Incoming file from ${sender || 'Unknown'}: ${fileName}`);

    // In a real environment, we would decode the base64, save to a tmp dir, 
    // and push to a message queue (like RabbitMQ) or the useApiQueue state.
    // Since this is the Node backend, we'll respond with a success flag that 
    // the frontend can poll, or use WebSockets/SSE to notify the frontend.
    
    // For now, return a standardized success payload
    return res.status(200).json({
      success: true,
      data: {
        id: Math.random().toString(36).substring(7),
        status: 'queued',
        fileName,
        processedAt: new Date().toISOString()
      },
      message: 'File successfully ingested from WhatsApp via n8n integration.'
    });

  } catch (error) {
    console.error('[Webhook] Error processing WhatsApp data:', error);
    return res.status(500).json({ error: 'Internal server error processing webhook' });
  }
};
