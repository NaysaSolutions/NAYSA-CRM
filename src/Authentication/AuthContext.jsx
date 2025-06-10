import React, { createContext, useContext, useState } from "react";

// Create Auth Context
const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Holds authenticated user

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("userToken"); // Clear authentication token if stored
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access to auth context
export const useAuth = () => useContext(AuthContext);
