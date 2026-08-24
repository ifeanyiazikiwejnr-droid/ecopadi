import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ecopadi_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.me(token)
      .then(setUser)
      .catch(() => { setToken(null); localStorage.removeItem('ecopadi_token'); })
      .finally(() => setLoading(false));
  }, [token]);

  function persistSession({ token, user }) {
    localStorage.setItem('ecopadi_token', token);
    setToken(token);
    setUser(user);
  }

  async function login(email, password) {
    const data = await api.login({ email, password });
    persistSession(data);
    return data.user;
  }

  async function register({ email, password, fullName, phone, wantsVip }) {
    const data = await api.register({ email, password, fullName, phone, wantsVip });
    persistSession(data);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('ecopadi_token');
    setToken(null);
    setUser(null);
  }

  async function joinVip() {
    const updated = await api.joinVip(token);
    setUser((u) => ({ ...u, ...updated }));
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, joinVip }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
