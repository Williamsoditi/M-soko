import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import axios from 'axios';
import { loginUser, fetchUserProfile, type UserProfile as AuthApiUserProfile } from '../api/auth-api'; // <-- Import the new function

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Function to get and set the user profile
  const getAndSetUserProfile = async () => {
      try {
          const userProfile: AuthApiUserProfile = await fetchUserProfile();
          setUser(userProfile);
          setIsAuthenticated(true);
      } catch (error) {
          console.error('Failed to fetch user profile:', error);
          logout(); // Log out if fetching profile fails
      }
  };

  // Check for a token on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      getAndSetUserProfile(); // <-- Use the new function here
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
        const token = await loginUser(username, password);
        localStorage.setItem('authToken', token); // Overwrites the old token with the new one
        await getAndSetUserProfile();
    } catch (error) {
        throw error;
    }
};

  const logout = () => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};