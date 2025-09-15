import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, AuthResponse } from '../types/api';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (studentId: string, email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  setUserAndPersist: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        const parsed = JSON.parse(savedUser);
        const normalized = { ...parsed, _id: parsed._id || parsed.id };
        setUser(normalized);
        // 回写规范化后的用户，确保后续读取一致
        localStorage.setItem('user', JSON.stringify(normalized));
      } catch {
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await apiService.login({ email, password });
      
      setToken(response.token);
      const normalized = { ...response.user, _id: (response.user as any)._id || (response.user as any).id } as any;
      setUser(normalized);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(normalized));
    } catch (error) {
      throw error;
    }
  };

  const register = async (studentId: string, email: string, password: string, name: string) => {
    try {
      const response: AuthResponse = await apiService.register({ 
        studentId, 
        email, 
        password, 
        name 
      });
      
      setToken(response.token);
      const normalized = { ...response.user, _id: (response.user as any)._id || (response.user as any).id } as any;
      setUser(normalized);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(normalized));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const setUserAndPersist = (updated: User) => {
    const normalized = { ...updated, _id: (updated as any)._id || (updated as any).id } as any;
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    setUserAndPersist
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
