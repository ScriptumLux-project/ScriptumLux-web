import React, { createContext, useState, useEffect, useContext } from 'react';
import { mockUsers } from '../../mockData/data';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  

  const login = (email, password) => {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password, ...safeUserData } = user;
      
      const token = `mock-token-${Date.now()}`;
      
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(safeUserData));
      
      setCurrentUser(safeUserData);
      return { success: true, user: safeUserData };
    }
    
    return { success: false, message: 'Invalid email or password' };
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const register = (userData) => {
    const existingUser = mockUsers.find(u => u.email === userData.email);
    
    if (existingUser) {
      return { success: false, message: 'User with this email already exists' };
    }
    
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      role: 'user'
    };
    
    const { password, ...safeUserData } = newUser;
    const token = `mock-token-${Date.now()}`;
    
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(safeUserData));
    
    setCurrentUser(safeUserData);
    return { success: true, user: safeUserData };
  };

  const isAuthenticated = () => {
    return localStorage.getItem('accessToken') !== null;
  };

  const value = {
    currentUser,
    login,
    logout,
    register,
    isAuthenticated,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};