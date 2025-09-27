// Hook for user management
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { userService } from "./userService";

export const useUser = (userId) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user by ID
  const getUser = useCallback(async (id = userId) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = await userService.getUserById(id);
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Create a new user
  const createUser = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newUser = await userService.createUser(userData);
      setUser(newUser);
      
      Alert.alert("Success", "User created successfully");
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      setError(error.message);
      Alert.alert("Error", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user
  const updateUser = useCallback(async (userData, id = userId) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedUser = await userService.updateUser(id, userData);
      setUser(updatedUser);
      
      Alert.alert("Success", "User updated successfully");
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      setError(error.message);
      Alert.alert("Error", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Delete user
  const deleteUser = useCallback(async (id = userId) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await userService.deleteUser(id);
      setUser(null);
      
      Alert.alert("Success", "User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(error.message);
      Alert.alert("Error", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Create or get user (useful for Clerk integration)
  const createOrGetUser = useCallback(async (clerkUser) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = await userService.createOrGetUser(clerkUser);
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error("Error creating or getting user:", error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Data
    user,
    isLoading,
    error,
    
    // Actions
    getUser,
    createUser,
    updateUser,
    deleteUser,
    createOrGetUser,
    
    // Utility
    clearError: () => setError(null),
    clearUser: () => setUser(null),
  };
};
