const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `    const code = await sock.requestPairingCode(phone);
    pairingCode = code;
    res.json({ pairingCode: code });
  } catch (err: any) {
    console.error('[WA] Pairing code error:', err);
    res.status(500).json({ error: err.message || "Failed to request pairing code" });
  }
});`;

const replaceStr = `    // Wait a brief moment to ensure socket is ready
    await new Promise(resolve => setTimeout(resolve, 1500));
    const code = await sock.requestPairingCode(phone);
    pairingCode = code;
    res.json({ pairingCode: code });
  } catch (err: any) {
    console.error('[WA] Pairing code error:', err);
    if (err.message && err.message.includes('Connection Terminated')) {
       // Socket is broken, clear it and force restart
       cleanupSocket();
       try { fs.rmSync('/tmp/baileys_auth_info_2', { recursive: true, force: true }); } catch(e) {}
       return res.status(500).json({ error: "Connection to WhatsApp dropped. We are restarting the client. Please wait 5 seconds and try again." });
    }
    res.status(500).json({ error: err.message || "Failed to request pairing code" });
  }
});`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('server.ts', code);
