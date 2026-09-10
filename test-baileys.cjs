const { makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('/tmp/baileys_test');
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: Browsers.macOS('Desktop')
    });
    sock.ev.on('connection.update', (update) => {
        if(update.qr) console.log("Generated QR:", update.qr);
        if(update.connection === 'close') process.exit(0);
    });
}
start();
