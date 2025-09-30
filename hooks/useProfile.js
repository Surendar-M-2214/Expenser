import { useState, useEffect, useCallback } from 'react';
import { useUser, useSession } from '@clerk/clerk-expo';
import { API_URL } from '../constants/api';

export const useProfile = () => {
  const { user } = useUser();
  const { session } = useSession();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    profileImage: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load profile data from database - SINGLE SOURCE OF TRUTH
  const loadProfileFromDatabase = useCallback(async () => {
    if (!user?.id || !session) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await session.getToken();
      console.log('Loading profile from database for user:', user.id);
      
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Profile data from database:', result);
        
        if (result.user) {
          // Use ONLY database data - no Clerk fallbacks
          setProfileData({
            firstName: result.user.firstName || '',
            lastName: result.user.lastName || '',
            username: result.user.username || '',
            email: result.user.email || user.emailAddresses[0]?.emailAddress || '',
            phoneNumber: result.user.phoneNumber || '',
            profileImage: result.user.profileImage || null,
          });
        } else {
          // If no user data in response, set empty values
          setProfileData({
            firstName: '',
            lastName: '',
            username: '',
            email: user.emailAddresses[0]?.emailAddress || '',
            phoneNumber: '',
            profileImage: null,
          });
        }
      } else {
        console.error('Failed to load profile data:', response.status);
        setError(`Failed to load profile: ${response.status}`);
        
        // Set minimal data with only email from Clerk (for display purposes)
        setProfileData({
          firstName: '',
          lastName: '',
          username: '',
          email: user.emailAddresses[0]?.emailAddress || '',
          phoneNumber: '',
          profileImage: null,
        });
      }
    } catch (error) {
      console.error('Error loading profile from database:', error);
      setError(error.message);
      
      // Set minimal data with only email from Clerk (for display purposes)
      setProfileData({
        firstName: '',
        lastName: '',
        username: '',
        email: user.emailAddresses[0]?.emailAddress || '',
        phoneNumber: '',
        profileImage: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, session]);

  const refreshProfile = useCallback(() => {
    loadProfileFromDatabase();
  }, [loadProfileFromDatabase]);

  useEffect(() => {
    if (user && session) {
      loadProfileFromDatabase();
    }
  }, [user, session, loadProfileFromDatabase]);

  return {
    profileData,
    isLoading,
    error,
    refreshProfile,
  };
};
