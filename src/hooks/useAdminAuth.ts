'use client';

import { useState, useEffect } from 'react';

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAdminAuth useEffect running');
    // Check if there's a stored admin session
    const storedAdmin = localStorage.getItem('adminUser');
    console.log('Stored admin:', storedAdmin);
    
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        console.log('Parsed admin data:', adminData);
        setAdminUser(adminData);
      } catch (error) {
        console.error('Error parsing stored admin:', error);
        setAdminUser(null);
        localStorage.removeItem('adminUser');
      }
    } else {
      console.log('No stored admin found');
      setAdminUser(null);
    }
    
    console.log('Setting loading to false');
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('SignIn called with:', email);
    try {
      // Use the API route for authentication
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log('SignIn response:', data);
      
      if (data.success) {
        // Store admin session
        const adminData = {
          id: data.admin.id,
          email: data.admin.email,
          created_at: data.admin.created_at
        };
        localStorage.setItem('adminUser', JSON.stringify(adminData));
        setAdminUser(adminData);
        return { error: null };
      } else {
        return { error: { message: data.error } };
      }
    } catch (error) {
      console.error('SignIn error:', error);
      return { error: { message: 'Authentication failed' } };
    }
  };

  const signOut = async () => {
    console.log('SignOut called');
    localStorage.removeItem('adminUser');
    setAdminUser(null);
  };

  console.log('useAdminAuth hook state:', { loading, adminUser });

  return {
    adminUser,
    loading,
    signIn,
    signOut,
  };
}; 