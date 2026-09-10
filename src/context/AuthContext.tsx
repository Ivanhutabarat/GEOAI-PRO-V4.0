import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  fullName: string | null;
  profileBio: string | null;
  userRole: 'ADMIN' | 'OPERATOR' | null;
  token: string | null;
  login: (email: string, token: string, fullName?: string, profileBio?: string, role?: string) => void;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  requireAuth: (callback: () => void) => void;
  updateProfileState: (fullName: string, profileBio: string) => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [profileBio, setProfileBio] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'ADMIN' | 'OPERATOR' | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(true); // Show on first load

  // Security Suggestion 2: Inactivity Auto-Lock (Idle Timeout)
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      if (isAuthenticated) {
        // Lock out after 10 minutes of inactivity
        inactivityTimer = setTimeout(() => {
          console.warn("[SECURITY] Session locked due to inactivity.");
          logout();
        }, 10 * 60 * 1000); 
      }
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    resetTimer();
    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    // Check local storage for existing session
    const storedEmail = localStorage.getItem('geoai_user_email');
    const storedName = localStorage.getItem('geoai_user_fullname');
    const storedBio = localStorage.getItem('geoai_user_bio');
    const storedRole = localStorage.getItem('geoai_user_role') as 'ADMIN' | 'OPERATOR' | null;
    const storedToken = localStorage.getItem('geoai_jwt_token');
    
    const checkSession = async (email: string) => {
      try {
        const res = await fetch(`/api/auth/check?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (!data.exists) {
          console.log("[AUTH] Session email no longer exists on backend, logging out.");
          logout();
        }
      } catch (err) {
        console.error("[AUTH] Error checking session status:", err);
      }
    };

    if (storedEmail && storedToken) {
      setIsAuthenticated(true);
      setUserEmail(storedEmail);
      setFullName(storedName || storedEmail.split('@')[0]);
      setProfileBio(storedBio || 'Operator GeoAI Pro Core');
      setUserRole(storedRole || 'OPERATOR');
      setToken(storedToken);
      setShowLoginModal(false); // Hide if already logged in
      
      // Verify with the backend server
      checkSession(storedEmail);
    }
  }, []);

  const login = (email: string, jwtToken: string, name?: string, bio?: string, role?: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    const resolvedName = name || email.split('@')[0];
    const resolvedBio = bio || 'Operator GeoAI Pro Core';
    const resolvedRole = (role as 'ADMIN' | 'OPERATOR') || 'OPERATOR';
    
    setFullName(resolvedName);
    setProfileBio(resolvedBio);
    setUserRole(resolvedRole);
    setToken(jwtToken);
    
    localStorage.setItem('geoai_user_email', email);
    localStorage.setItem('geoai_user_fullname', resolvedName);
    localStorage.setItem('geoai_user_bio', resolvedBio);
    localStorage.setItem('geoai_user_role', resolvedRole);
    localStorage.setItem('geoai_jwt_token', jwtToken);
    setShowLoginModal(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setFullName(null);
    setProfileBio(null);
    setUserRole(null);
    setToken(null);
    localStorage.removeItem('geoai_user_email');
    localStorage.removeItem('geoai_user_fullname');
    localStorage.removeItem('geoai_user_bio');
    localStorage.removeItem('geoai_user_role');
    localStorage.removeItem('geoai_jwt_token');
    setShowLoginModal(true);
  };

  const updateProfileState = (newName: string, newBio: string) => {
    setFullName(newName);
    setProfileBio(newBio);
    localStorage.setItem('geoai_user_fullname', newName);
    localStorage.setItem('geoai_user_bio', newBio);
  };

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const currentToken = token || localStorage.getItem('geoai_jwt_token');
    const headers = {
      ...(options.headers || {}),
      ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
    };
    return fetch(url, { ...options, headers });
  };

  const requireAuth = (callback: () => void) => {
    if (isAuthenticated) {
      callback();
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userEmail, 
      fullName,
      profileBio,
      userRole,
      token,
      login, 
      logout, 
      showLoginModal, 
      setShowLoginModal, 
      requireAuth,
      updateProfileState,
      authFetch
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
