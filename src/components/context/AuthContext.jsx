import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, signup as apiSignup } from '../../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      if (response && response.user && response.token) {
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setCurrentUser(response.user);
        return response.user;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (email, password, nickname, confirmPassword, role = "string") => {
    try {
      const response = await apiSignup(email, password, nickname, confirmPassword, role);
      
     
      if (response && response.token) {
        
        let userData = response.user;
        
        if (!userData) {
          userData = {
            name: nickname,
            email: email,
            
            role: role
          };
        }
        
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentUser(userData);
        return userData;
      } else if (response && response.user && response.token) {
        
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user)); 
        setCurrentUser(response.user);
        return response.user;
      } else {
        
        const loginResponse = await apiLogin(email, password);
        if (loginResponse && loginResponse.token) {
          localStorage.setItem('accessToken', loginResponse.token);
          localStorage.setItem('user', JSON.stringify(loginResponse.user || { email, name: nickname }));
          setCurrentUser(loginResponse.user || { email, name: nickname });
          return loginResponse.user;
        } else {
          throw new Error("Invalid response format from server");
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem('accessToken');
    return !!token && token !== 'undefined';
  };

  return (
      <AuthContext.Provider value={{
        currentUser, loading,
        login, signup, logout, isAuthenticated
      }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);