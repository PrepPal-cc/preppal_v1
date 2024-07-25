'use client'

import React, { createContext, useState, useContext, useEffect } from 'react';
import { signIn, signUp, signOut, getCurrentUser, verifyEmail } from '../lib/cognitoAuth';

type User = {
  email: string;
  firstName: string;
  token: string;
  // Add any other user attributes you need
};

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyEmail: (email: string, verificationCode: string) => Promise<void>;
  isEmailVerified: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      getCurrentUser(accessToken)
        .then(userData => {
          setUser({
            email: userData.email,
            firstName: userData.firstName,
            token: accessToken,
          });
          setIsEmailVerified(true);
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          setUser(null);
        });
    }
  }, []);

  const contextValue: AuthContextType = {
    user,
    isEmailVerified,
    signIn: async (email, password) => {
      const result = await signIn(email, password);
      if (result && result.AccessToken) {
        localStorage.setItem('accessToken', result.AccessToken);
        const userData = await getCurrentUser(result.AccessToken);
        setUser({
          email: userData.email,
          firstName: userData.firstName,
          token: result.AccessToken,
        });
        setIsEmailVerified(true);
      } else {
        throw new Error('Authentication failed');
      }
    },
    signUp: async (email, password, firstName) => {
      try {
        await signUp(email, password, firstName);
        setIsEmailVerified(false);
      } catch (error) {
        console.error('Error in signUp:', error);
        throw error;
      }
    },
    signOut: async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        await signOut(accessToken);
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    },
    verifyEmail: async (email, verificationCode) => {
      await verifyEmail(email, verificationCode);
      setIsEmailVerified(true);
    },
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}