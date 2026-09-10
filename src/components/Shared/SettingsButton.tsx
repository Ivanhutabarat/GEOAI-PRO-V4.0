import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, User, Lock, X, Check, RefreshCw, Key, Shield, LogOut,
  Terminal, Laptop, ShieldCheck, Download, Server, RefreshCcw, AlertTriangle, Fingerprint, Activity, Info
} from 'lucide-react';

export default function SettingsButton() {
  const { isAuthenticated, userEmail, fullName, profileBio, updateProfileState, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Enterprise Security States
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile');
  const [logs, setLogs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [systemNode, setSystemNode] = useState<any>(null);
  const [fetchingSec, setFetchingSec] = useState(false);

  // Search & Filter state for security logs
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');
  const [logActionFilter, setLogActionFilter] = useState<string>('ALL');

  const fetchSecurityData = async () => {
    if (!userEmail) return;
    setFetchingSec(true);
    try {
      const logsRes = await fetch(`/api/auth/audit-logs?email=${encodeURIComponent(userEmail)}`);
      const logsData = await logsRes.json();
      if (logsRes.ok && logsData.success) {
        setLogs(logsData.logs || []);
      }

      const statsRes = await fetch(`/api/auth/session-stats?email=${encodeURIComponent(userEmail)}`);
      const statsData = await statsRes.json();
      if (statsRes.ok && statsData.success) {
        setSessions(statsData.sessions || []);
        setSystemNode(statsData.systemNode || null);
      }
    } catch (err) {
      console.error("[SETTINGS] Failed to fetch security/session data:", err);
    } finally {
      setFetchingSec(false);
    }
  };

  const handleExportData = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`/api/auth/export-data?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `GeoAI_Pro_Audit_Data_${userEmail.split('@')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        
        // Refresh security audit logs instantly after export
        fetchSecurityData();
        setSuccess("Data kedaulatan akun berhasil diekspor!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("[SETTINGS] Failed to export data:", err);
      setError("Gagal mengekspor data akun.");
    }
  };

  const handleRevokeSessions = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/revoke-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) {
        fetchSecurityData();
        setSuccess("Sesi eksternal berhasil diputus paksa!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("[SETTINGS] Failed to revoke sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch security logs on tab switch
  useEffect(() => {
    if (isOpen && (activeTab === 'security' || activeTab === 'sessions')) {
      fetchSecurityData();
    }
  }, [activeTab, isOpen]);

  // If not logged in, don't show settings button
  if (!isAuthenticated || !userEmail) return null;

  const handleOpen = () => {
    setNameInput(fullName || '');
    setBioInput(profileBio || 'Operator GeoAI Pro Core');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordChange(false);
    setShowDeleteConfirm(false);
    setError('');
    setSuccess('');
    setActiveTab('profile');
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (showPasswordChange) {
      if (!currentPassword) {
        setError("Sandi saat ini wajib diisi untuk mengubah sandi.");
        return;
      }
      if (!newPassword || newPassword.length < 4) {
        setError("Sandi baru minimal harus 4 karakter.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Konfirmasi sandi baru tidak cocok.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          fullName: nameInput,
          profileBio: bioInput,
          currentPassword: showPasswordChange ? currentPassword : undefined,
          newPassword: showPasswordChange ? newPassword : undefined
        })
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("[SETTINGS] JSON parse error:", jsonErr);
        setError(`Respons server tidak valid (Status: ${res.status}). Silakan coba lagi.`);
        setLoading(false);
        return;
      }

      if (res.ok && data.success) {
        updateProfileState(data.user.fullName, data.user.profileBio);
        setSuccess("Profil berhasil diperbarui!");
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordChange(false);
        // Automatically close modal after 1.5s
        setTimeout(() => {
          setIsOpen(false);
        }, 1500);
      } else {
        setError(data.error || "Gagal memperbarui profil.");
      }
    } catch (err) {
      console.error("[SETTINGS] Fetch error:", err);
      setError("Gagal terhubung ke server. Silakan periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/profile/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("[SETTINGS] JSON parse error during account deletion:", jsonErr);
      }

      // Automatically purge local session regardless of server status
      logout();
      setIsOpen(false);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("[SETTINGS] Error deleting account from server, executing local purge:", err);
      // Fallback local purge to keep user happy if network is down
      logout();
      setIsOpen(false);
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Gear Button in Bottom-Right (Safe margins from AgentCompanion) */}
      <motion.button
        onClick={handleOpen}
        whileHover={{ scale: 1.1, rotate: 45 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-24 z-[9999] p-3 rounded-full bg-[#111112]/90 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:border-cyan-400 hover:text-white transition-all backdrop-blur-md cursor-pointer flex items-center justify-center"
        title="Pengaturan Profil & Keamanan"
      >
        <Settings className="w-5 h-5" />
      </motion.button>

      {/* Settings Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#111112] border-2 border-cyan-500/20 rounded-2xl p-6 w-full max-w-xl relative shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-65" />

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1 bg-[#1a1a1c] rounded-full border border-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title Header */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Pusat Keamanan & Akun
                  </h3>
                  <p className="text-[10px] text-cyan-500/70 font-mono tracking-widest uppercase">
                    GeoAI Pro Security Control Desk
                  </p>
                </div>
              </div>

              {/* Tabs Switcher Navigation */}
              <div className="flex items-center gap-1 bg-[#161618] p-1 rounded-xl border border-white/5 mb-4 font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${activeTab === 'profile' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                >
                  <User className="w-3.5 h-3.5" />
                  Profil
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${activeTab === 'security' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Audit Log
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sessions')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${activeTab === 'sessions' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                >
                  <Server className="w-3.5 h-3.5" />
                  Sesi & Node
                </button>
              </div>

              {/* Success/Error notifications */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-4 flex items-center gap-2 font-mono">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl mb-4 flex items-center gap-2 font-mono">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400 animate-pulse" />
                  <span>{success}</span>
                </div>
              )}

              {/* Scrollable Form/Data Area */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-sans max-h-[55vh]">
                
                {/* ================= TAB 1: PROFILE ================= */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleSave} className="space-y-4 animate-fade-in">
                    {/* Email Read-only */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider mb-1">Email (Kedaulatan Utama)</label>
                      <div className="flex items-center gap-2 bg-[#161618] border border-white/5 px-3 py-2.5 rounded-xl text-gray-400 text-xs font-mono">
                        <Fingerprint className="w-4 h-4 text-cyan-500/50" />
                        <span>{userEmail}</span>
                        <span className="ml-auto text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
                          Terverifikasi
                        </span>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-cyan-500 uppercase tracking-wider mb-1.5">Nama Lengkap Operator</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="w-full bg-[#161618] border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 transition-all font-sans"
                          placeholder="Nama Lengkap Operator"
                          required
                        />
                      </div>
                    </div>

                    {/* Role / Bio */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-cyan-500 uppercase tracking-wider mb-1.5">Spesialisasi / Jabatan</label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          value={bioInput}
                          onChange={(e) => setBioInput(e.target.value)}
                          className="w-full bg-[#161618] border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 transition-all font-sans"
                          placeholder="e.g. Operator GeoAI Pro Core"
                          required
                        />
                      </div>
                    </div>

                    {/* Collapsible Change Password section */}
                    <div className="border-t border-white/5 pt-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                        className="flex items-center justify-between w-full text-xs font-mono text-cyan-500/95 hover:text-cyan-400 transition-colors uppercase py-1 cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          {showPasswordChange ? 'Batal Ubah Sandi' : 'Ubah Sandi Keamanan'}
                        </span>
                        <span className="text-gray-500">{showPasswordChange ? '[-]' : '[+]'}</span>
                      </button>

                      {showPasswordChange && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3 pt-3 overflow-hidden"
                        >
                          <div>
                            <label className="block text-[9px] font-mono font-bold text-cyan-500/70 uppercase tracking-widest mb-1">Sandi Saat Ini</label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-600" />
                              <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-[#161618] border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                                placeholder="Ketik sandi saat ini"
                                required={showPasswordChange}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-mono font-bold text-cyan-500/70 uppercase tracking-widest mb-1">Sandi Baru</label>
                              <div className="relative">
                                <Key className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-600" />
                                <input
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="w-full bg-[#161618] border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                                  placeholder="Min 4 karakter"
                                  required={showPasswordChange}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono font-bold text-cyan-500/70 uppercase tracking-widest mb-1">Konfirmasi Sandi Baru</label>
                              <div className="relative">
                                <Key className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-600" />
                                <input
                                  type="password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  className="w-full bg-[#161618] border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                                  placeholder="Ulangi sandi baru"
                                  required={showPasswordChange}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Save Changes Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-850 text-white font-mono font-bold py-2.5 rounded-xl text-xs tracking-wider transition-colors uppercase flex items-center justify-center gap-2 cursor-pointer border border-cyan-500/20"
                    >
                      {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                      Simpan Perubahan
                    </button>
                  </form>
                )}

                {/* ================= TAB 2: AUDIT SECURITY LOGS ================= */}
                {activeTab === 'security' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <span>Sistem Registrasi & Log Keamanan</span>
                      </div>
                      <button
                        onClick={fetchSecurityData}
                        disabled={fetchingSec}
                        className="p-1 bg-[#161618] border border-white/5 rounded-lg text-cyan-400 hover:text-white transition-colors cursor-pointer"
                        title="Segarkan Log"
                      >
                        <RefreshCcw className={`w-3.5 h-3.5 ${fetchingSec ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    {fetchingSec && logs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 font-mono text-xs text-cyan-500/60 gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Mengambil log pertahanan sistem...</span>
                      </div>
                    ) : logs.length === 0 ? (
                      <div className="bg-[#161618] border border-white/5 rounded-xl p-6 text-center text-xs font-mono text-gray-500">
                        <ShieldCheck className="w-8 h-8 text-cyan-500/20 mx-auto mb-2" />
                        Belum ada aktivitas terekam.
                      </div>
                    ) : (
                      <>
                        {/* Interactive Filter Toolbar */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                          <input 
                            type="text"
                            placeholder="Cari log (detail, IP)..."
                            value={logSearchQuery}
                            onChange={(e) => setLogSearchQuery(e.target.value)}
                            className="bg-[#121214] border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-500 transition-colors"
                          />
                          <select
                            value={logStatusFilter}
                            onChange={(e) => setLogStatusFilter(e.target.value as any)}
                            className="bg-[#121214] border border-white/5 rounded-lg px-2 py-1.5 text-[10px] font-mono text-gray-300 focus:outline-none focus:border-cyan-500"
                          >
                            <option value="ALL">Semua Status</option>
                            <option value="SUCCESS">SUCCESS (Sukses)</option>
                            <option value="FAILED">FAILED (Gagal)</option>
                          </select>
                          <select
                            value={logActionFilter}
                            onChange={(e) => setLogActionFilter(e.target.value)}
                            className="bg-[#121214] border border-white/5 rounded-lg px-2 py-1.5 text-[10px] font-mono text-gray-300 focus:outline-none focus:border-cyan-500"
                          >
                            {['ALL', ...Array.from(new Set(logs.map(log => log.action)))].map(act => (
                              <option key={act} value={act}>{act === 'ALL' ? 'Semua Aksi' : act}</option>
                            ))}
                          </select>
                        </div>

                        {/* Logs list based on filters */}
                        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                          {logs.filter(log => {
                            const matchesSearch = 
                              !logSearchQuery ||
                              (log.details && log.details.toLowerCase().includes(logSearchQuery.toLowerCase())) ||
                              (log.action && log.action.toLowerCase().includes(logSearchQuery.toLowerCase())) ||
                              (log.ip && log.ip.toLowerCase().includes(logSearchQuery.toLowerCase()));
                            
                            const matchesStatus = logStatusFilter === 'ALL' || log.status === logStatusFilter;
                            const matchesAction = logActionFilter === 'ALL' || log.action === logActionFilter;
                            
                            return matchesSearch && matchesStatus && matchesAction;
                          }).map((log) => (
                            <div 
                              key={log.id} 
                              className="bg-[#161618] border border-white/5 rounded-xl p-3 font-mono text-[11px] hover:border-cyan-500/20 transition-all duration-150"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                                  log.status === 'SUCCESS' 
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                }`}>
                                  {log.action}
                                </span>
                                <span className="text-gray-500 text-[10px]">
                                  {new Date(log.timestamp).toLocaleString('id-ID')}
                                </span>
                              </div>
                              <p className="text-gray-300 mb-1 leading-normal">{log.details}</p>
                              <div className="flex items-center gap-3 text-[9px] text-gray-500 border-t border-white/5 pt-1.5 mt-1.5">
                                <span>IP: <strong className="text-gray-400">{log.ip}</strong></span>
                                <span className="truncate max-w-[200px]">Client: <strong className="text-gray-400">{log.userAgent}</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ================= TAB 3: SESSIONS & NODE CLUSTER ================= */}
                {activeTab === 'sessions' && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Active Sessions */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-mono font-bold text-cyan-500 uppercase tracking-widest">Sesi Perangkat Terdeteksi</h4>
                        {sessions.length > 1 && (
                          <button
                            onClick={handleRevokeSessions}
                            disabled={loading}
                            className="text-[9px] font-mono font-bold text-red-400 hover:text-red-300 underline cursor-pointer"
                          >
                            Putus Sesi Lainnya
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {sessions.map((sess) => (
                          <div 
                            key={sess.id}
                            className={`p-3 rounded-xl border font-mono text-[11px] flex items-center justify-between ${
                              sess.isCurrent 
                                ? 'bg-cyan-500/5 border-cyan-500/20' 
                                : 'bg-[#161618] border-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${sess.isCurrent ? 'bg-cyan-500/15 text-cyan-400' : 'bg-white/5 text-gray-400'}`}>
                                <Laptop className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-white font-bold">{sess.deviceType}</span>
                                  {sess.isCurrent && (
                                    <span className="text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded uppercase font-bold tracking-widest">
                                      Aktif Saat Ini
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-500 leading-normal">{sess.location} • {sess.ip}</p>
                              </div>
                            </div>
                            <span className="text-[9px] text-gray-500">
                              {sess.isCurrent ? 'Aktif' : 'Terakhir: ' + new Date(sess.lastActive).toLocaleTimeString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* GeoAI Node Information */}
                    {systemNode && (
                      <div className="bg-[#161618]/60 border border-white/5 rounded-xl p-3 font-mono text-[11px] space-y-2.5">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                          <span className="text-gray-400 flex items-center gap-1">
                            <Server className="w-3.5 h-3.5 text-cyan-400" />
                            Cluster Node Server
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400 text-[9px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            ONLINE • SECURED
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                          <div>
                            <span className="text-gray-500 block">ID NODE SERVER</span>
                            <span className="text-white font-bold">{systemNode.nodeId}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">CLUSTER WILAYAH</span>
                            <span className="text-white font-bold">{systemNode.clusterName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">ENKRIPSI PROTOKOL</span>
                            <span className="text-cyan-400 font-bold">{systemNode.sslLevel}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">LATENCY RESPONSE</span>
                            <span className="text-emerald-400 font-bold">{systemNode.latencyMs} ms (Optimal)</span>
                          </div>
                        </div>
                        <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[8px] text-gray-500">
                          <span>VERIFIED HANDSHAKE HASH</span>
                          <span className="text-gray-400 font-bold">{systemNode.sha256VerificationHash}</span>
                        </div>
                      </div>
                    )}

                    {/* GDPR and Account Portability Section */}
                    <div className="bg-[#161618] border border-white/5 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">Kedaulatan & Hak Ekspor Data (GDPR)</h5>
                          <p className="text-[10px] text-gray-400 font-sans leading-normal mt-0.5">
                            Sesuai standar ISO/IEC 27001 & perlindungan data GDPR, Anda berhak mengekspor seluruh rekaman aktivitas kredensial Anda yang tersimpan di server enkripsi kami kapan saja.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleExportData}
                        className="w-full py-2 bg-cyan-950/20 hover:bg-cyan-900/35 border border-cyan-500/20 hover:border-cyan-400/40 text-cyan-400 text-[10px] font-mono font-bold uppercase rounded-xl tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Ekspor & Unduh Seluruh Data Akun (JSON)
                      </button>
                    </div>

                  </div>
                )}

              </div>

              {/* Bottom buttons (Logout & Account Deletion Option) - pinned at the bottom of modal */}
              <div className="border-t border-white/5 pt-4 mt-3 space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex-1 bg-red-950/15 hover:bg-red-950/30 border border-red-500/20 text-red-400 font-mono font-bold py-2 rounded-xl text-[10px] tracking-wider transition-colors uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar Sesi (Logout)
                  </button>

                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex-1 bg-[#1a1a1c] hover:bg-[#222225] border border-white/5 text-gray-400 hover:text-white font-mono py-2 rounded-xl text-[10px] tracking-wider transition-colors uppercase cursor-pointer"
                    >
                      Hapus Akun
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 bg-zinc-850 hover:bg-zinc-800 border border-white/5 text-zinc-300 font-mono py-2 rounded-xl text-[10px] tracking-wider transition-colors uppercase cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                </div>

                {showDeleteConfirm && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-950/25 border border-red-500/30 rounded-xl space-y-2 animate-fade-in"
                  >
                    <p className="text-[10px] text-red-300 font-sans leading-normal text-center">
                      Apakah Anda yakin ingin menghapus akun ini secara permanen? Seluruh data profil dan log audit terekam akan dihancurkan.
                    </p>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="w-full bg-red-600 hover:bg-red-500 text-white font-mono font-bold py-2 rounded-lg text-[9px] uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                    >
                      Ya, Hancurkan Akun Saya Permanen
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
