import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved session
    const savedUser = localStorage.getItem('mediscan_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // SIMULATION: In a real app, this would be a fetch call to your backend
    console.log('Simulating Login for:', email);
    const mockUser = { id: '123', name: 'Dr. Neural', email };
    
    setUser(mockUser);
    localStorage.setItem('mediscan_user', JSON.stringify(mockUser));
    return true;
  };

  const signup = async (name, email, password) => {
    // SIMULATION: In a real app, this would be a fetch call to your backend
    console.log('Simulating Signup for:', name);
    const mockUser = { id: '123', name, email };
    
    setUser(mockUser);
    localStorage.setItem('mediscan_user', JSON.stringify(mockUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mediscan_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
