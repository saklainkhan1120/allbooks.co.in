'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: any;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const checkExistingSession = () => {
      try {
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
          const userData = JSON.parse(adminUser);
          setUser(userData);
          setSession({ user: userData });
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error parsing admin session:', error);
      }
      setLoading(false);
    };

    checkExistingSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = {
          id: data.admin.id,
          email: data.admin.email,
          created_at: data.admin.created_at
        };
        
        localStorage.setItem('adminUser', JSON.stringify(userData));
        setUser(userData);
        setSession({ user: userData });
        setIsAdmin(true);
        return { error: null };
      } else {
        return { error: new Error(data.error) };
      }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Authentication failed') };
    }
  };

  const signUp = async (email: string, password: string) => {
    // For now, admin creation is handled through the admin panel
    return { error: new Error('Admin registration is not available through this interface') };
  };

  const signOut = async () => {
    localStorage.removeItem('adminUser');
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    session,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 