/**
 * HerHealth AI — Authentication Context
 *
 * Provides sign-up, sign-in, sign-out, and session persistence.
 * Uses local storage since the backend currently lacks auth endpoints.
 * When auth endpoints are added to the backend, replace the
 * local functions with real API calls.
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'herhealth-auth';

function hashPassword(password) {
  /* Simple hash for demo — replace with bcrypt/server-side in production */
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return String(hash);
}

function getStoredUsers() {
  try {
    const data = localStorage.getItem('herhealth-users');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users) {
  localStorage.setItem('herhealth-users', JSON.stringify(users));
}

function getSession() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveSession(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) setUser(session);
    setLoading(false);
  }, []);

  const signUp = useCallback(async (name, email, password) => {
    const users = getStoredUsers();
    if (users.find((u) => u.email === email)) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = {
      id: crypto.randomUUID?.() || String(Date.now()),
      name,
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveStoredUsers(users);
    const session = { id: newUser.id, name: newUser.name, email: newUser.email };
    saveSession(session);
    setUser(session);
    return session;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const users = getStoredUsers();
    const found = users.find((u) => u.email === email);
    if (!found || found.passwordHash !== hashPassword(password)) {
      throw new Error('Invalid email or password.');
    }
    const session = { id: found.id, name: found.name, email: found.email };
    saveSession(session);
    setUser(session);
    return session;
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      saveSession(updated);
      /* Also update in the users store */
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === updated.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        saveStoredUsers(users);
      }
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
