import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee } from '@/types';
import { EMPLOYEES, DEMO_ACCOUNTS } from '@/lib/mockData';

interface AuthContextType {
  currentUser: Employee | null;
  setCurrentUser: (user: Employee | null) => void;
  isAuthenticated: boolean;
  login: (email: string) => boolean;
  loginAs: (role: 'employee' | 'teamLead' | 'hr' | 'exec') => void;
  logout: () => void;
  allEmployees: Employee[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('neverleft_user');

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Find the employee in our data (in case data was updated)
        const employee = EMPLOYEES.find(e => e.email === parsed.email);
        if (employee) {
          setCurrentUser(employee);
          setIsAuthenticated(true);
        }
      } catch (e) {
        localStorage.removeItem('neverleft_user');
      }
    }
  }, []);

  const login = (email: string): boolean => {
    const user = EMPLOYEES.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('neverleft_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  // Quick login as specific role (for demo)
  const loginAs = (role: 'employee' | 'teamLead' | 'hr' | 'exec') => {
    const user = DEMO_ACCOUNTS[role];
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('neverleft_user', JSON.stringify(user));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('neverleft_user');
  };

  const handleSetCurrentUser = (user: Employee | null) => {
    setCurrentUser(user);
    setIsAuthenticated(!!user);
    if (user) {
      localStorage.setItem('neverleft_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('neverleft_user');
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser: handleSetCurrentUser,
      isAuthenticated,
      login,
      loginAs,
      logout,
      allEmployees: EMPLOYEES,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
