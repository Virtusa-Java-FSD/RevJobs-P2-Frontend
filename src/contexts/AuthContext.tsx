import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api, API_BASE_URL } from '../services/api';



interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clean up any corrupted localStorage data
    const cleanupLocalStorage = () => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value === 'undefined' || value === 'null') {
          localStorage.removeItem(key);
        }
      });
    };

    cleanupLocalStorage();

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData && userData !== 'undefined' && userData !== 'null') {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Check for admin login
      if (email === 'sravanikelam27@gmail.com' && password === 'Sravs@2709') {
        const adminUser = {
          id: 'admin',
          email: 'sravanikelam27@gmail.com',
          firstName: 'Sravani',
          lastName: 'Kelam',
          role: 'ADMIN' as any
        };
        localStorage.setItem('token', 'admin-token');
        localStorage.setItem('user', JSON.stringify(adminUser));

        // Store admin profile data
        const adminProfile = {
          firstName: 'Sravani',
          lastName: 'Kelam',
          email: 'sravanikelam27@gmail.com',
          role: 'ADMIN',
          companyName: 'RevJobs Admin',
          location: 'Hyderabad',
          skills: ['Administration', 'Management'],
          experience: [],
          resumeUrl: ''
        };
        localStorage.setItem(`userProfile_sravanikelam27@gmail.com`, JSON.stringify(adminProfile));

        setUser(adminUser);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const text = await response.text();
      if (!text) throw new Error('Empty response from server');
      const response_data = JSON.parse(text);
      const { token, user } = response_data.data || response_data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Store/update user profile data
      let existingProfile: any = {};
      try {
        const profileData = localStorage.getItem(`userProfile_${user.email}`);
        existingProfile = profileData ? JSON.parse(profileData) : {};
      } catch (error) {
        console.error('Error parsing existing profile:', error);
        existingProfile = {};
      }
      const userProfile = {
        ...existingProfile,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        companyName: user.companyName || existingProfile.companyName || '',
        location: existingProfile.location || '',
        skills: existingProfile.skills || [],
        experience: existingProfile.experience || [],
        resumeUrl: existingProfile.resumeUrl || ''
      };
      localStorage.setItem(`userProfile_${user.email}`, JSON.stringify(userProfile));

      // Track login activity
      let loginActivity = [];
      try {
        const activityData = localStorage.getItem('loginActivity');
        loginActivity = activityData ? JSON.parse(activityData) : [];
      } catch (error) {
        console.error('Error parsing login activity:', error);
        loginActivity = [];
      }
      loginActivity.push({
        email: user.email,
        role: user.role,
        loginTime: new Date().toISOString(),
        type: 'login'
      });
      localStorage.setItem('loginActivity', JSON.stringify(loginActivity));

      setUser(user);
    } catch (error) {
      throw new Error('Invalid email or password');
    }
  };

  const register = async (userData: any) => {
    try {
      console.log('Registering user:', userData);
      console.log('API URL:', `${API_BASE_URL}/auth/register`);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = errorText ? JSON.parse(errorText) : {};
        } catch {
          error = { message: errorText || 'Registration failed' };
        }
        throw new Error(error.message || 'Registration failed');
      }

      const text = await response.text();
      if (!text) throw new Error('Empty response from server');
      const response_data = JSON.parse(text);

      // Store user profile data immediately after registration
      const userProfile = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        companyName: userData.companyName || '',
        location: '',
        skills: [],
        experience: [],
        resumeUrl: ''
      };
      localStorage.setItem(`userProfile_${userData.email}`, JSON.stringify(userProfile));

      // Store user in localStorage for admin management
      let registeredUsers = [];
      try {
        const usersData = localStorage.getItem('registeredUsers');
        registeredUsers = usersData ? JSON.parse(usersData) : [];
      } catch (error) {
        console.error('Error parsing registered users:', error);
        registeredUsers = [];
      }
      registeredUsers.push({
        ...userData,
        registeredDate: new Date().toISOString()
      });
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

      // Track registration activity
      let loginActivity = [];
      try {
        const activityData = localStorage.getItem('loginActivity');
        loginActivity = activityData ? JSON.parse(activityData) : [];
      } catch (error) {
        console.error('Error parsing login activity:', error);
        loginActivity = [];
      }
      loginActivity.push({
        email: userData.email,
        role: userData.role,
        loginTime: new Date().toISOString(),
        type: 'registration'
      });
      localStorage.setItem('loginActivity', JSON.stringify(loginActivity));

      console.log('User registered successfully:', response_data);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};