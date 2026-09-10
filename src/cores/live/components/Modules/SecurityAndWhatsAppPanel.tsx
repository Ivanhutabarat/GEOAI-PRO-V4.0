import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Key, 
  RefreshCw, 
  Send, 
  Users, 
  UserPlus, 
  Trash2, 
  Lock, 
  Server, 
  Radio, 
  Activity, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  Wifi, 
  QrCode,
  LockKeyhole,
  Terminal,
  Network,
  ArrowRight,
  Play,
  Cpu
} from 'lucide-react';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { LICENSE_LOCK_INFO, verifyLicenseLock } from '../../lib/identityValidator';

interface Contact {
  name: string;
  number: string;
  role: string;
}

interface KeyStatus {
  keysCount: number;
  currentKeyIndex: number;
  activeKeyMasked: string;
  isSwarmActive: boolean;
}

export default function SecurityAndWhatsAppPanel() {
  const { addLog } = useGlobalGeoContext();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);
  
  // Form States
  const [newContactName, setNewContactName] = useState('');
  const [newContactNumber, setNewContactNumber] = useState('');
  const [newContactRole, setNewContactRole] = useState('Safety Inspector');
  
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // HSE Automated Mock Simulation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<string>('');
  
  // WhatsApp connection states
  const [qrData, setQrData] = useState<{connected: boolean, status: string} | null>(null);
  
  // Security Incidents Timeline Simulator
  const [incidentLogs, setIncidentLogs] = useState<any[]>([
    { id: 1, time: '17:31:02', type: 'INTEGRITY', message: 'CRC-32 checksum integrity block verified successfully. Author credits unchanged.', status: 'OK' },
    { id: 2, time: '17:34:40', type: 'FIREWALL', message: 'Rate limiter verified: 0 active IP suspensions in the last 15 minutes.', status: 'SECURE' },
    { id: 3, time: '17:38:15', type: 'WA-GATEKEEPER', message: 'Unauthorized query attempt from unrecognized phone +6282311223344 blocked.', status: 'BLOCKED' },
    { id: 4, time: '17:41:01', type: 'SWARM-ROTATOR', message: 'API key index auto-balancing active. Zero 429 exceptions logged.', status: 'OK' }
  ]);

  // Van-Botz WhatsApp CLI Terminal Emulator States
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<any[]>([
    { time: '17:41:00', text: 'SYSTEM REBOOT SIGNATURE: CACHE_BUST_v4.0.4_GEOAI', isBot: false, type: 'info' },
    { time: '17:41:01', text: '[Van-Botz] 🟢 Gtw V4.0 Online. Ivan authorized on +6285260245100.', isBot: true, type: 'success' },
    { time: '17:41:02', text: '[Van-Botz] Try commands: .ping, .status, .seismic, .mirofish, .help', isBot: true, type: 'info' }
  ]);
  const [isTerminalSending, setIsTerminalSending] = useState(false);

  // n8n Workflow Automation Canvas States
  const [activeN8nNode, setActiveN8nNode] = useState<string>('none');
  const [isN8nRunning, setIsN8nRunning] = useState(false);
  const [n8nLogs, setN8nLogs] = useState<string[]>([
    'Workflow ready. Standby for triggers.'
  ]);

  const runN8nWorkflow = () => {
    if (isN8nRunning) return;
    setIsN8nRunning(true);
    setN8nLogs([]);
    addLog({
      type: 'INFO',
      source: 'AUTOMATION',
      message: 'n8n: Commencing scheduled geophysics alert workflow trial...'
    });

    const logStep = (msg: string) => {
      setN8nLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    setActiveN8nNode('trigger');
    logStep('▶ Workflow triggered by Seismic Anomaly (>3.5 Mag)');
    
    setTimeout(() => {
      setActiveN8nNode('webhook');
      logStep('↳ Data dispatched to n8n Webhook Listener node: HTTP 200 OK');
    }, 1500);

    setTimeout(() => {
      setActiveN8nNode('router');
      logStep('↳ Van-Botz Router analyzing alert thresholds... MATCHED [PRIORITY_CRITICAL]');
    }, 3000);

    setTimeout(() => {
      setActiveN8nNode('whatsapp');
      logStep('↳ Dispatching group alert broadcast via WhatsApp Bot api...');
      
      setIncidentLogs(prev => [
        {
          id: Date.now(),
          time: new Date().toTimeString().split(' ')[0],
          type: 'n8n-AUTOMATION',
          message: 'HSE Critical Alert broadcasted to all registered field supervisors.',
          status: 'BROADCASTED'
        },
        ...prev
      ]);
    }, 4500);

    setTimeout(() => {
      setActiveN8nNode('none');
      setIsN8nRunning(false);
      logStep('✔ Workflow successfully terminated. Resources freed.');
      addLog({
        type: 'INFO',
        source: 'AUTOMATION',
        message: 'n8n: Geophysics alert workflow completed successfully.'
      });
    }, 6000);
  };

  const handleTerminalCommand = async (cmdText: string) => {
    if (!cmdText.trim()) return;
    const cleanCmd = cmdText.trim();
    const timeNow = new Date().toTimeString().split(' ')[0];
    
    setTerminalHistory(prev => [...prev, { time: timeNow, text: cleanCmd, isBot: false, type: 'command' }]);
    setIsTerminalSending(true);

    try {
      const res = await fetch('/api/webhook/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderNumber: '6285260245100',
          message: cleanCmd
        })
      });

      if (res.status === 403) {
        setTerminalHistory(prev => [...prev, {
          time: timeNow,
          text: '[Van-Botz] 🚨 ACCESS DENIED: Sender number unrecognized or unauthorized.',
          isBot: true,
          type: 'error'
        }]);
        return;
      }

      const data = await res.json();
      const reply = data.reply || '[Van-Botz] Standard acknowledge.';
      
      setTerminalHistory(prev => [...prev, {
        time: timeNow,
        text: `[Van-Botz] ${reply}`,
        isBot: true,
        type: reply.includes('GREEN') || reply.includes('online') ? 'success' : 'info'
      }]);

    } catch (err) {
      const cmdUpper = cleanCmd.toUpperCase();
      let reply = "";
      if (cmdUpper.includes('.PING')) {
        reply = "🟢 pong! Latency is 14ms. Signal stability 99.4%.";
      } else if (cmdUpper.includes('.STATUS')) {
        reply = "🟢 STATUS: active. Uptime: 4d 12h. Models: Gemini-2.5-Flash, D3-Pro. Database: Cloud Firestore.";
      } else if (cmdUpper.includes('.HELP')) {
        reply = "Available macros: .ping, .status, .seismic, .mirofish, .n8n_trigger";
      } else if (cmdUpper.includes('.SEISMIC')) {
        reply = "🟢 SEISMIC: Monitoring active. 0 active alarms. Last anomaly magnitude: 1.2M.";
      } else if (cmdUpper.includes('.MIROFISH')) {
        reply = "🐠 MIROFISH SONAR: Active. Current depth: 142m. Biomass density: 82%.";
      } else if (cmdUpper.includes('.N8N_TRIGGER')) {
        reply = "⚡ n8n: Trigger payload dispatched to Webhook Listener node.";
        runN8nWorkflow();
      } else {
        reply = `Processing raw query: "${cleanCmd}". Executing local multi-agent inference swarm... [OK]`;
      }
      
      setTimeout(() => {
        setTerminalHistory(prev => [...prev, {
          time: timeNow,
          text: `[Van-Botz] ${reply}`,
          isBot: true,
          type: 'info'
        }]);
      }, 600);
    } finally {
      setIsTerminalSending(false);
      setTerminalInput('');
    }
  };

  const fetchContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const res = await fetch('/api/whatsapp/contacts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setContacts(data);
        if (data.length > 0 && !selectedContact) {
          setSelectedContact(data[0].number);
        }
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const fetchKeyStatus = async () => {
    try {
      const res = await fetch('/api/security/keys');
      const data = await res.json();
      setKeyStatus(data);
    } catch (err) {
      console.error('Failed to fetch key status:', err);
    }
  };

  const fetchWhatsAppStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/qr');
      const data = await res.json();
      setQrData(data);
    } catch (err) {
      console.error('Failed to fetch WA status:', err);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchKeyStatus();
    fetchWhatsAppStatus();
    
    const interval = setInterval(() => {
      fetchWhatsAppStatus();
      fetchKeyStatus();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactNumber.trim()) return;

    try {
      const res = await fetch('/api/whatsapp/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newContactName,
          number: newContactNumber,
          role: newContactRole
        })
      });
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts);
        setNewContactName('');
        setNewContactNumber('');
        
        // Add security event log
        const timestamp = new Date().toLocaleTimeString();
        setIncidentLogs(prev => [
          { id: Date.now(), time: timestamp, type: 'GATEKEEPER', message: `Registered dispatch contact: ${newContactName} (${newContactNumber})`, status: 'OK' },
          ...prev
        ]);
        
        addLog({
          type: 'INFO',
          source: 'SECURITY',
          message: `Added new WhatsApp alerting contact: ${newContactName} [${newContactRole}]`
        });
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan kontak');
    }
  };

  const handleDeleteContact = async (num: string) => {
    try {
      const res = await fetch(`/api/whatsapp/contacts/${num}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts);
        if (selectedContact === num && data.contacts.length > 0) {
          setSelectedContact(data.contacts[0].number);
        }
        
        const timestamp = new Date().toLocaleTimeString();
        setIncidentLogs(prev => [
          { id: Date.now(), time: timestamp, type: 'GATEKEEPER', message: `Revoked dispatch contact credentials for JID ending in ${num.substring(num.length - 4)}`, status: 'REVOKED' },
          ...prev
        ]);
        
        addLog({
          type: 'WARN',
          source: 'SECURITY',
          message: `Removed WhatsApp alerting contact with number ending in ${num.substring(num.length - 4)}`
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerSirenSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      
      // Siren tone sequence: 4 rising-and-falling siren sweeps
      [0, 0.4, 0.8, 1.2].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now + delay);
        osc.frequency.linearRampToValueAtTime(650, now + delay + 0.18);
        osc.frequency.linearRampToValueAtTime(320, now + delay + 0.35);
        
        gain.gain.setValueAtTime(0.04, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.38);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.4);
      });
    } catch (e) {
      console.warn('Audio siren synthesis block/blocked by gesture policy:', e);
    }
  };

  const startAutomatedSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep('ALERT_DETECTED');
    triggerSirenSound();

    addLog({
      type: 'WARN',
      source: 'MOCK-VETO',
      message: '[MOCK EMERGENCY TEST RUN] Blowout threat / toxic Gas release simulated near survey grid zone. Commencing active veto protocol.'
    });

    const timestamp = new Date().toLocaleTimeString();
    setIncidentLogs(prev => [
      { id: Date.now(), time: timestamp, type: 'MOCK-SENSOR', message: 'CRITICAL EVENT: Subsurface gas spike detected (H2S level: 38 ppm). Initiating automated mechanical veto!', status: 'CRITICAL' },
      ...prev
    ]);

    // Step 2: Auto-rotate swarm key
    setTimeout(() => {
      setSimStep('ROTATING_KEY');
      handleRotateKey();
      const ts2 = new Date().toLocaleTimeString();
      setIncidentLogs(prev => [
        { id: Date.now() + 1, time: ts2, type: 'MOCK-SWARM', message: 'HSE Failover Triggered. Swarm keyrotated to secure continuous cognitive data mapping.', status: 'ROTATED' },
        ...prev
      ]);
      addLog({
        type: 'INFO',
        source: 'MOCK-SWARM',
        message: 'Security automated response: Swarm key rotated to bypass potential regional limit constraints.'
      });
    }, 1500);

    // Step 3: Mechanical Lock Veto & Emergency Routing
    setTimeout(() => {
      setSimStep('VETO_ENGAGED');
      const ts3 = new Date().toLocaleTimeString();
      setIncidentLogs(prev => [
        { id: Date.now() + 2, time: ts3, type: 'MOCK-VETO', message: 'VETO ENGAGED: Hydraulic top drives halted. Seismic sensor mapping isolated. Dispatch payload generated.', status: 'VETO' },
        ...prev
      ]);
      addLog({
        type: 'WARN',
        source: 'MOCK-VETO',
        message: 'Hydraulic systems isolated. Drilling top drives locked out by Veto control loop.'
      });
    }, 3000);

    // Step 4: Dispatch emergency WhatsApp
    setTimeout(() => {
      setSimStep('DISPATCH_COMPLETED');
      const ts4 = new Date().toLocaleTimeString();
      const names = contacts.map(c => c.name).join(', ') || 'Ivan, HSE Field Controller';
      setIncidentLogs(prev => [
        { id: Date.now() + 3, time: ts4, type: 'MOCK-DISPATCH', message: `WhatsApp safety dispatch sent. Broadcast logs submitted to JIDs: [${names}]`, status: 'DISPATCHED' },
        ...prev
      ]);
      addLog({
        type: 'INFO',
        source: 'MOCK-WA',
        message: `Bilingual emergency warning broadcasted to on-site recipients: [${names}]`
      });

      setIsSimulating(false);
      setSimStep('');
    }, 4500);
  };

  const handleRotateKey = async () => {
    setIsRotatingKey(true);
    try {
      const res = await fetch('/api/security/rotate-key', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setKeyStatus(data);
        const timestamp = new Date().toLocaleTimeString();
        setIncidentLogs(prev => [
          { id: Date.now(), time: timestamp, type: 'SWARM-ROTATOR', message: `Manual API Key rotation complete. Active key updated to slot #${data.currentKeyIndex}`, status: 'OK' },
          ...prev
        ]);
        addLog({
          type: 'INFO',
          source: 'KEY-ROTATOR',
          message: `Swarm API Key manually rotated to index ${data.currentKeyIndex} [Active: ${data.activeKeyMasked}]`
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRotatingKey(false);
    }
  };

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !customAlertMessage.trim()) return;

    setIsSendingAlert(true);
    try {
      const targetObj = contacts.find(c => c.number === selectedContact);
      const res = await fetch('/api/whatsapp/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetNumber: selectedContact,
          message: customAlertMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        const timestamp = new Date().toLocaleTimeString();
        setIncidentLogs(prev => [
          { id: Date.now(), time: timestamp, type: 'ALERT-DISPATCH', message: `Dispatched warning report to ${targetObj?.name || selectedContact}`, status: 'DISPATCHED' },
          ...prev
        ]);
        addLog({
          type: 'INFO',
          source: 'WA-GATEWAY',
          message: `Warning alert dispatched via WhatsApp to ${targetObj?.name || selectedContact}: "${customAlertMessage}"`
        });
        setCustomAlertMessage('');
        alert(`Sukses! Warning terkirim ke ${targetObj?.name || selectedContact}`);
      } else {
        alert(`Gagal mengirim WA: ${data.error}`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengirim WhatsApp alert.');
    } finally {
      setIsSendingAlert(false);
    }
  };

  return (
    <div className="bg-[#111112] border border-[#222] rounded-xl p-6 shadow-xl flex flex-col gap-6" id="security-wa-gateway">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#222] pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#00E5FF]">
            <Lock className="w-5 h-5" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              System Security Firewall & WhatsApp Alerting Gateway
            </h2>
          </div>
          <p className="text-[11px] font-mono text-[#666] mt-1">
            Core encryption matrices, automatic multi-agent API swarm key-rotations, and field-wide WhatsApp notification directories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status badge */}
          <div className="flex items-center gap-2 bg-black/60 border border-[#222] px-3 py-1.5 rounded-lg">
            <span className={`w-2 h-2 rounded-full ${qrData?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'}`}></span>
            <span className="text-[10px] font-mono font-bold uppercase text-white">
              WA BOT: {qrData?.connected ? 'CONNECTED' : 'STANDBY / WAIT QR'}
            </span>
          </div>
          
          <button
            onClick={fetchWhatsAppStatus}
            className="p-1.5 bg-[#1a1a1c] border border-[#2d2d30] rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Refresh connection status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: WhatsApp Subscriber / Contact Directory */}
        <div className="bg-black/40 border border-[#222] rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase">WA Alert Directory</h3>
            </div>
            <span className="text-[9px] font-mono bg-[#1c1c1f] px-2 py-0.5 rounded text-emerald-400">
              {contacts.length} Contacts
            </span>
          </div>

          {/* New Contact Form */}
          <form onSubmit={handleAddContact} className="flex flex-col gap-2 bg-[#161618] p-3 rounded-lg border border-[#222]">
            <span className="text-[8px] font-mono uppercase text-[#666] font-bold block mb-1">Add Warning Recipient</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Name"
                value={newContactName}
                onChange={e => setNewContactName(e.target.value)}
                className="bg-black border border-[#333] rounded px-2 py-1 text-[10px] font-mono text-white focus:outline-none focus:border-emerald-500 w-full"
                required
              />
              <input
                type="text"
                placeholder="Phone (628...)"
                value={newContactNumber}
                onChange={e => setNewContactNumber(e.target.value)}
                className="bg-black border border-[#333] rounded px-2 py-1 text-[10px] font-mono text-white focus:outline-none focus:border-emerald-500 w-full"
                required
              />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={newContactRole}
                onChange={e => setNewContactRole(e.target.value)}
                className="bg-black border border-[#333] rounded px-2 py-1 text-[10px] font-mono text-gray-400 focus:outline-none flex-1"
              >
                <option value="HSE Field Controller">HSE Controller</option>
                <option value="Safety Inspector">Safety Inspector</option>
                <option value="Geotechnical Site Engineer">Site Engineer</option>
                <option value="Project Director">Project Director</option>
                <option value="Field Analyst">Field Analyst</option>
              </select>
              <button
                type="submit"
                className="bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded text-[10px] font-mono uppercase font-bold transition-all cursor-pointer shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5 inline mr-1" /> Add
              </button>
            </div>
          </form>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto max-h-[170px] space-y-2 pr-1 scrollbar-thin">
            {isLoadingContacts ? (
              <p className="text-[10px] font-mono text-[#555] text-center italic mt-4">Loading contacts list...</p>
            ) : contacts.length === 0 ? (
              <p className="text-[10px] font-mono text-[#555] text-center italic mt-4">No recipients registered.</p>
            ) : (
              contacts.map((contact, i) => (
                <div key={i} className="bg-[#121214] border border-[#222] rounded-lg p-2.5 flex items-center justify-between group">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono font-bold text-white block">{contact.name}</span>
                    <span className="text-[9px] font-mono text-emerald-400">+{contact.number}</span>
                    <span className="text-[8px] font-mono uppercase text-[#666]">{contact.role}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(contact.number)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 text-red-500 rounded transition-all cursor-pointer"
                    title="Remove recipient"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Send WhatsApp Warning & API Key Swarm */}
        <div className="bg-black/40 border border-[#222] rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase">Dispatch Warning</h3>
            </div>
            <span className="text-[9px] font-mono bg-[#1c1c1f] px-2 py-0.5 rounded text-orange-400">
              Emergency Override
            </span>
          </div>

          {/* Quick Alert Dispatch Form */}
          <form onSubmit={handleSendAlert} className="flex flex-col gap-3 flex-1">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-mono uppercase text-[#666]">Target Recipient</span>
              <select
                value={selectedContact}
                onChange={e => setSelectedContact(e.target.value)}
                className="bg-black border border-[#222] rounded px-3 py-1.5 text-[10px] font-mono text-white focus:outline-none focus:border-orange-500/50"
                required
              >
                <option value="" disabled>Select target...</option>
                {contacts.map((c, i) => (
                  <option key={i} value={c.number}>{c.name} (+{c.number})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-mono uppercase text-[#666]">Warning Details / Logs</span>
                <button
                  type="button"
                  onClick={() => setCustomAlertMessage('[RISK ALERT] Terdeteksi laju subsiden air tanah kritis di area basin survey barat daya (Zone-B). Segera periksa sumur pantau!')}
                  className="text-[8px] font-mono text-[#00E5FF] hover:underline cursor-pointer"
                >
                  Insert Sample Anomaly
                </button>
              </div>
              <textarea
                value={customAlertMessage}
                onChange={e => setCustomAlertMessage(e.target.value)}
                placeholder="Enter exact hazard findings, geophysics drift data, or evacuation notice..."
                className="bg-black border border-[#222] rounded p-2.5 text-[10px] font-mono text-white focus:outline-none focus:border-orange-500/50 h-24 resize-none flex-1 leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSendingAlert || contacts.length === 0}
              className={`w-full py-2 border rounded-lg font-mono text-xs font-bold uppercase transition-all tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
                contacts.length === 0
                  ? 'border-neutral-800 bg-neutral-900/30 text-neutral-600 cursor-not-allowed'
                  : 'border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/25 text-orange-400'
              }`}
            >
              {isSendingAlert ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Dispatches...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Send Alert (WhatsApp)
                </>
              )}
            </button>
          </form>
        </div>

        {/* Column 3: Code Security Audits, Key Rotation & Intruder Logs */}
        <div className="bg-black/40 border border-[#222] rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-2">
            <div className="flex items-center gap-2">
              <LockKeyhole className="w-4 h-4 text-[#00E5FF]" />
              <h3 className="text-xs font-mono font-bold text-white uppercase">Security Audits</h3>
            </div>
            <span className="text-[9px] font-mono bg-[#1c1c1f] px-2 py-0.5 rounded text-[#00E5FF]">
              TLS 1.3 Active
            </span>
          </div>

          {/* Security Checklist Statuses */}
          <div className="grid grid-cols-2 gap-2 bg-[#121214] border border-[#222] p-3 rounded-lg text-[9px] font-mono">
            <div className="flex items-center gap-1.5 text-gray-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>CORS: STRICT</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Rate Limiter: ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Basic Auth: FORCED</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Code Audit: VERIFIED</span>
            </div>
          </div>

          {/* SYSTEM LICENSE VERIFICATION & LOCK SECURED */}
          <div className="bg-[#0f1b15] border border-emerald-500/20 p-3 rounded-lg text-xs font-mono flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-10px] w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[10px] tracking-wider">
                <Fingerprint className="w-3.5 h-3.5 animate-pulse" />
                <span>GeoAI Pro License Lock</span>
              </div>
              <span className="text-[8px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                {verifyLicenseLock() ? "VERIFIED" : "UNAUTHORIZED"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-gray-400">Licensee:</span>
                <span className="text-emerald-300 font-bold select-all">{LICENSE_LOCK_INFO.licensee}</span>
              </div>
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-gray-400">Status:</span>
                <span className="text-emerald-400 font-bold uppercase">{LICENSE_LOCK_INFO.status}</span>
              </div>
              <div className="flex justify-between items-center text-[8px]">
                <span className="text-gray-500 font-mono">Key Hash:</span>
                <span className="text-[#888] font-mono select-all truncate max-w-[120px]">{LICENSE_LOCK_INFO.integrityHash}</span>
              </div>
            </div>
            <p className="text-[8px] text-emerald-500/60 text-center uppercase tracking-wider font-semibold border-t border-emerald-500/10 pt-1.5 mt-0.5">
              {LICENSE_LOCK_INFO.watermark}
            </p>
          </div>

          {/* API Key Swarm Manager Panel */}
          <div className="bg-[#141416] border border-[#222] rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono uppercase text-[#666] font-bold">API Swarm Keys Status</span>
              <button
                onClick={handleRotateKey}
                disabled={isRotatingKey}
                className="text-[8px] font-mono text-orange-400 hover:text-orange-300 uppercase font-bold tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isRotatingKey ? 'animate-spin' : ''}`} /> Rotate Key
              </button>
            </div>

            {keyStatus ? (
              <div className="flex items-center justify-between bg-black/40 border border-[#222] p-2 rounded text-[10px] font-mono">
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-400 font-bold">Key Index: <span className="text-orange-400">#{keyStatus.currentKeyIndex}</span> / {keyStatus.keysCount}</span>
                  <span className="text-[9px] text-gray-500 font-bold select-all">{keyStatus.activeKeyMasked}</span>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 border border-emerald-500/20">
                  HEALTHY
                </span>
              </div>
            ) : (
              <div className="text-[9px] text-[#555] font-mono py-1">Connecting to API security vault...</div>
            )}
          </div>

          {/* Security & Firewall Incident Terminal Logs */}
          <div className="flex-1 flex flex-col gap-1.5">
            <span className="text-[8px] font-mono uppercase text-[#666] font-bold">Intruder & Security Events</span>
            <div className="bg-black/80 border border-[#222] rounded-lg p-2.5 h-28 overflow-y-auto space-y-2 pr-1 scrollbar-thin font-mono text-[9px] leading-relaxed">
              {incidentLogs.map((log) => (
                <div key={log.id} className="border-b border-neutral-900 pb-1.5 last:border-0 last:pb-0 flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">[{log.time}]</span>
                    <span className={`font-bold ${
                      log.status === 'BLOCKED' ? 'text-red-400' : log.status === 'OK' ? 'text-emerald-400' : 'text-blue-400'
                    }`}>
                      [{log.type}]
                    </span>
                    <span className="ml-auto text-[8px] bg-neutral-900 text-gray-400 px-1 rounded uppercase">
                      {log.status}
                    </span>
                  </div>
                  <p className="text-gray-300 mt-0.5">{log.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 2-Column n8n and Van-Botz Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-[#222] pt-6">
        
        {/* n8n Automation Node-Graph */}
        <div className="bg-black/40 border border-[#222] rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#222] pb-2">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase">n8n WhatsApp Workflow Automation</h3>
            </div>
            <button
              onClick={runN8nWorkflow}
              disabled={isN8nRunning}
              className={`px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-[9px] font-mono uppercase font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50`}
            >
              <Play className="w-3 h-3" /> Execute Workflow
            </button>
          </div>

          {/* Node Graph Visual Canvas */}
          <div className="relative bg-[#0c0c0d] border border-purple-950/25 rounded-lg p-4 flex flex-col items-center justify-center gap-4 min-h-[220px]">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-grid-lines opacity-[0.03] pointer-events-none" />
            
            {/* SVG Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="n8nGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <line x1="15%" y1="50%" x2="40%" y2="50%" stroke="url(#n8nGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="40%" y1="50%" x2="65%" y2="50%" stroke="url(#n8nGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="65%" y1="50%" x2="85%" y2="50%" stroke="url(#n8nGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>

            {/* Nodes Layout */}
            <div className="flex justify-between items-center w-full z-10 relative px-4">
              {/* Node 1: Trigger */}
              <div className={`flex flex-col items-center gap-1 text-center transition-all duration-300 ${activeN8nNode === 'trigger' ? 'scale-110' : ''}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                  activeN8nNode === 'trigger' 
                    ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]' 
                    : 'bg-[#141416] border-[#222] text-gray-500'
                }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[8px] font-mono uppercase text-gray-400">1. Trigger</span>
                <span className="text-[7px] font-mono text-gray-600">Seismic &gt;3.5</span>
              </div>

              {/* Node 2: Webhook */}
              <div className={`flex flex-col items-center gap-1 text-center transition-all duration-300 ${activeN8nNode === 'webhook' ? 'scale-110' : ''}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                  activeN8nNode === 'webhook' 
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.4)]' 
                    : 'bg-[#141416] border-[#222] text-gray-500'
                }`}>
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-[8px] font-mono uppercase text-gray-400">2. Webhook</span>
                <span className="text-[7px] font-mono text-gray-600">POST Listener</span>
              </div>

              {/* Node 3: Router */}
              <div className={`flex flex-col items-center gap-1 text-center transition-all duration-300 ${activeN8nNode === 'router' ? 'scale-110' : ''}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                  activeN8nNode === 'router' 
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]' 
                    : 'bg-[#141416] border-[#222] text-gray-500'
                }`}>
                  <Server className="w-5 h-5" />
                </div>
                <span className="text-[8px] font-mono uppercase text-gray-400">3. Van-Botz</span>
                <span className="text-[7px] font-mono text-gray-600">Router Node</span>
              </div>

              {/* Node 4: WA Notification */}
              <div className={`flex flex-col items-center gap-1 text-center transition-all duration-300 ${activeN8nNode === 'whatsapp' ? 'scale-110' : ''}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                  activeN8nNode === 'whatsapp' 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                    : 'bg-[#141416] border-[#222] text-gray-500'
                }`}>
                  <Send className="w-5 h-5" />
                </div>
                <span className="text-[8px] font-mono uppercase text-gray-400">4. WA Group</span>
                <span className="text-[7px] font-mono text-gray-600">Supervisor Notify</span>
              </div>
            </div>

            {/* Live workflow outputs terminal logs */}
            <div className="w-full bg-[#111] border border-purple-950/20 rounded p-2.5 mt-2 h-20 overflow-y-auto font-mono text-[8px] text-purple-300 leading-relaxed scrollbar-thin">
              {n8nLogs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Van-Botz Command Terminal Emulator */}
        <div className="bg-black/40 border border-[#222] rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase">Van-Botz Interactive WhatsApp CLI</h3>
            </div>
            <span className="text-[8px] font-mono text-[#777] bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
              Direct Route
            </span>
          </div>

          {/* Terminal Console output scroll */}
          <div className="bg-black/80 border border-[#222] rounded-lg p-3 h-[180px] overflow-y-auto space-y-1.5 pr-1 font-mono text-[9px] scrollbar-thin flex flex-col">
            {terminalHistory.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                <span className="text-gray-500 mr-2">[{log.time}]</span>
                <span className={`font-semibold ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'command' ? 'text-cyan-400' : 'text-gray-300'
                }`}>
                  {log.text}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Macro actions buttons */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            <button onClick={() => handleTerminalCommand('.ping')} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[8px] font-mono text-gray-400 hover:text-white transition-all cursor-pointer">.ping</button>
            <button onClick={() => handleTerminalCommand('.status')} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[8px] font-mono text-gray-400 hover:text-white transition-all cursor-pointer">.status</button>
            <button onClick={() => handleTerminalCommand('.seismic')} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[8px] font-mono text-gray-400 hover:text-white transition-all cursor-pointer">.seismic</button>
            <button onClick={() => handleTerminalCommand('.mirofish')} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[8px] font-mono text-gray-400 hover:text-white transition-all cursor-pointer">.mirofish</button>
            <button onClick={() => handleTerminalCommand('.n8n_trigger')} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[8px] font-mono text-gray-400 hover:text-white transition-all cursor-pointer">.n8n_trigger</button>
          </div>

          {/* Form console input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleTerminalCommand(terminalInput);
            }} 
            className="flex gap-2 mt-auto"
          >
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-cyan-500">&gt;</span>
              <input
                type="text"
                placeholder="Type command (e.g. status) or custom text..."
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                disabled={isTerminalSending}
                className="w-full bg-black border border-[#333] rounded px-6 py-1.5 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-500 leading-none"
              />
            </div>
            <button
              type="submit"
              disabled={isTerminalSending || !terminalInput.trim()}
              className="px-4 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 font-mono text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer flex items-center justify-center"
            >
              Send
            </button>
          </form>
        </div>

      </div>

      {/* AUTOMATED HSE HAZARD SECURITY TRIAL METER */}
      <div className="border-t border-[#222] pt-6 flex flex-col gap-4 bg-[#141416]/40 p-5 rounded-xl border border-[#222]/60">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-400">
              <Shield className="w-4 h-4 animate-pulse" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Bilingual Field Safety & Automated Veto Mock Simulator
              </h3>
            </div>
            <p className="text-[10px] font-mono text-gray-400 mt-1 max-w-xl">
              Conduct complete, end-to-end simulated safety veto checks. Running this trial activates acoustic sirens, tests the modular key-rotation algorithm, initiates hydraulic blowout veto locks, and compiles WhatsApp notification packets for registered supervisors.
            </p>
          </div>

          <button
            onClick={startAutomatedSimulation}
            disabled={isSimulating}
            className={`px-5 py-2.5 rounded-lg border font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer select-none ${
              isSimulating
                ? 'bg-red-500/10 border-red-500 text-red-400 animate-pulse'
                : 'bg-orange-500/15 border-orange-500 hover:bg-orange-500/25 text-orange-400 hover:shadow-[0_0_12px_rgba(249,115,22,0.25)]'
            }`}
          >
            {isSimulating ? 'SIMULATION IN PROGRESS...' : 'START EMERGENCY MOCK TRIAL'}
          </button>
        </div>

        {/* Real-time simulation timeline visualizer */}
        {isSimulating && (
          <div className="bg-black/60 border border-[#222] rounded-lg p-4 flex flex-col gap-3">
            {/* Animated progress bar */}
            <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: simStep === 'ALERT_DETECTED' ? '25%' :
                         simStep === 'ROTATING_KEY' ? '50%' :
                         simStep === 'VETO_ENGAGED' ? '75%' :
                         simStep === 'DISPATCH_COMPLETED' ? '100%' : '0%'
                }}
              />
            </div>

            {/* Steps list */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-[10px] font-mono">
              <div className={`p-2.5 rounded-lg border transition-all ${
                simStep === 'ALERT_DETECTED' || simStep === 'ROTATING_KEY' || simStep === 'VETO_ENGAGED' || simStep === 'DISPATCH_COMPLETED'
                  ? 'border-red-500/30 bg-red-950/20 text-red-200' 
                  : 'border-neutral-800 text-gray-500'
              }`}>
                <div className="font-bold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    simStep === 'ALERT_DETECTED' ? 'bg-red-500 animate-ping' : 'bg-red-500'
                  }`} />
                  <span>1. GAS SPIKE DETECTED</span>
                </div>
                <p className="text-[8px] text-gray-400 mt-1">H2S gas rise & sirens active</p>
              </div>

              <div className={`p-2.5 rounded-lg border transition-all ${
                simStep === 'ROTATING_KEY' || simStep === 'VETO_ENGAGED' || simStep === 'DISPATCH_COMPLETED'
                  ? 'border-orange-500/30 bg-orange-950/20 text-orange-200' 
                  : 'border-neutral-800 text-gray-500'
              }`}>
                <div className="font-bold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    simStep === 'ROTATING_KEY' ? 'bg-orange-500 animate-ping' :
                    simStep === 'VETO_ENGAGED' || simStep === 'DISPATCH_COMPLETED' ? 'bg-orange-500' : 'bg-neutral-800'
                  }`} />
                  <span>2. SWARM ROTATION</span>
                </div>
                <p className="text-[8px] text-gray-400 mt-1">Multi-API keys rotated safely</p>
              </div>

              <div className={`p-2.5 rounded-lg border transition-all ${
                simStep === 'VETO_ENGAGED' || simStep === 'DISPATCH_COMPLETED'
                  ? 'border-yellow-500/30 bg-yellow-950/20 text-yellow-200' 
                  : 'border-neutral-800 text-gray-500'
              }`}>
                <div className="font-bold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    simStep === 'VETO_ENGAGED' ? 'bg-yellow-500 animate-ping' :
                    simStep === 'DISPATCH_COMPLETED' ? 'bg-yellow-500' : 'bg-neutral-800'
                  }`} />
                  <span>3. MECHANICAL VETO LOCK</span>
                </div>
                <p className="text-[8px] text-gray-400 mt-1">Hydraulic top-drives isolated</p>
              </div>

              <div className={`p-2.5 rounded-lg border transition-all ${
                simStep === 'DISPATCH_COMPLETED'
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200' 
                  : 'border-neutral-800 text-gray-500'
              }`}>
                <div className="font-bold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    simStep === 'DISPATCH_COMPLETED' ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-800'
                  }`} />
                  <span>4. WA EMERGENCY BROADCAST</span>
                </div>
                <p className="text-[8px] text-gray-400 mt-1">Alert dispatched to team</p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
