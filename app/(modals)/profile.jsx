import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useSession } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/colors';
import { API_URL } from '../../constants/api';
import PropTypes from 'prop-types';


export default function ProfileModal({ visible, onClose, onProfileUpdated }) {
  const { user } = useUser();
  const { session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const usernameTimeoutRef = useRef(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    profileImage: null,
  });

  // Prefer new API; fallback to deprecated to avoid runtime errors on some platforms
  const IMAGE_MEDIA_TYPE = (ImagePicker && ImagePicker.MediaType && ImagePicker.MediaType.Images)
    || (ImagePicker && ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.emailAddresses[0]?.emailAddress || '',
        phoneNumber: user.phoneNumbers[0]?.phoneNumber || '',
        profileImage: user.imageUrl || null, // Will be overridden by database data
      });
      // Load profile image from database (this will override Clerk's imageUrl)
      loadProfileImageFromDatabase();
    }
  }, [user]);

  // Debounced username check
  useEffect(() => {
    if (usernameTimeoutRef.current) {
      clearTimeout(usernameTimeoutRef.current);
    }

    if (profileData.username && profileData.username.trim().length >= 3) {
      usernameTimeoutRef.current = setTimeout(() => {
        checkUsernameAvailability(profileData.username);
      }, 500); // 500ms delay
    } else if (profileData.username && profileData.username.trim().length > 0 && profileData.username.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters');
    } else {
      setUsernameError('');
    }

    return () => {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
    };
  }, [profileData.username]);

  const loadProfileImageFromDatabase = async () => {
    try {
      const token = await session?.getToken();
      console.log('Loading profile data from database...');
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        try {
          const result = await response.json();
          // console.log('Profile data from database:', result);
          
          if (result.user) {
            setProfileData(prev => ({
              ...prev,
              firstName: result.user.firstName || prev.firstName,
              lastName: result.user.lastName || prev.lastName,
              username: result.user.username || prev.username,
              phoneNumber: result.user.phoneNumber || prev.phoneNumber,
              profileImage: result.user.profileImage || prev.profileImage,
            }));
            // console.log('Profile data updated from database, profileImage:', result.user.profileImage);
          }
        } catch (parseError) {
          console.log('Could not parse profile response:', parseError);
        }
      } else {
        console.log('Failed to load profile data:', response.status);
      }
    } catch (error) {
      console.log('Could not load profile data from database:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Check if username is available
  const checkUsernameAvailability = async (usernameToCheck) => {
    if (!usernameToCheck || usernameToCheck.trim() === '') {
      setUsernameError('');
      return true;
    }

    // Don't check if it's the current user's username
    if (usernameToCheck.trim() === (user.username || '')) {
      setUsernameError('');
      return true;
    }

    setCheckingUsername(true);
    setUsernameError('');

    try {
      const response = await fetch(`${API_URL}/users/check-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: usernameToCheck.trim() }),
      });

      let result;
      try {
        const responseText = await response.text();
        
        // Check if response is HTML (likely an error page)
        if (responseText.trim().startsWith('<')) {
          console.log('Received HTML response for username check');
          setUsernameError('Service temporarily unavailable');
          return false;
        } else {
          result = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error('Could not parse username check response:', parseError);
        setUsernameError('Error checking username availability');
        return false;
      }

      if (response.ok) {
        if (result.available) {
          setUsernameError('');
          return true;
        } else {
          setUsernameError('Username is already taken');
          return false;
        }
      } else {
        setUsernameError('Error checking username availability');
        return false;
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError('Error checking username availability');
      return false;
    } finally {
      setCheckingUsername(false);
    }
  };

  // Test function to check authentication
  const testAuth = async () => {
    try {
      const token = await session?.getToken();
      console.log('=== TESTING AUTH ===');
      console.log(token);
      console.log('Token:', token ? 'Token exists' : 'No token');
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
      console.log('User ID:', user?.id);
      
      // Test API connectivity
      console.log('Testing API connectivity...');
      const response = await fetch(`${API_URL}/users/test-auth`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('API test successful:', result);
        Alert.alert('Auth Test', `Success! User ID: ${result.userId}`);
      } else {
        const errorText = await response.text();
        console.log('API test failed:', response.status, errorText);
        Alert.alert('Auth Test', `Failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Auth test error:', error);
      Alert.alert('Auth Test', `Error: ${error.message}`);
    }
  };


  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate input data
      if (profileData.firstName && profileData.firstName.trim().length < 2) {
        Alert.alert('Validation Error', 'First name must be at least 2 characters long.');
        setLoading(false);
        return;
      }
      
      if (profileData.lastName && profileData.lastName.trim().length < 2) {
        Alert.alert('Validation Error', 'Last name must be at least 2 characters long.');
        setLoading(false);
        return;
      }
      
      if (profileData.username && profileData.username.trim().length < 3) {
        Alert.alert('Validation Error', 'Username must be at least 3 characters long.');
        setLoading(false);
        return;
      }

      // Check if username has validation errors
      if (usernameError) {
        Alert.alert('Validation Error', usernameError);
        setLoading(false);
        return;
      }

      console.log('Current user data:', {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress
      });
      
      console.log('Profile data to update:', {
        firstName: profileData.firstName,
        lastName: profileData.lastName
      });

      console.log('Available user methods:', Object.getOwnPropertyNames(user).filter(name => typeof user[name] === 'function'));

      // Check if we have any changes to make
      const hasChanges = profileData.firstName !== (user.firstName || '') || 
                         profileData.lastName !== (user.lastName || '') ||
                         profileData.username !== (user.username || '') ||
                         profileData.phoneNumber !== (user.phoneNumbers[0]?.phoneNumber || '') ||
                         profileData.profileImage !== (user.imageUrl || '');
      
      // If no changes, just exit edit mode
      if (!hasChanges) {
        console.log('No changes detected');
        Alert.alert('No Changes', 'No changes were made to your profile.');
        setIsEditing(false);
        return;
      }
      
      if (hasChanges) {
        try {
          // Get the authentication token for our backend
          const token = await session?.getToken();
          console.log('=== FRONTEND PROFILE UPDATE DEBUG ===');
          console.log('Token received:', token ? 'Token exists' : 'No token');
          console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
          console.log('User ID from frontend:', user?.id);
          console.log('User object:', user);
          console.log('Session object:', session);
          
          // Prepare update data - only include fields that have meaningful changes
          const updateData = {};
          if (profileData.firstName !== (user.firstName || '') && profileData.firstName.trim() !== '') {
            updateData.firstName = profileData.firstName.trim();
          }
          if (profileData.lastName !== (user.lastName || '') && profileData.lastName.trim() !== '') {
            updateData.lastName = profileData.lastName.trim();
          }
          if (profileData.username !== (user.username || '') && profileData.username.trim() !== '') {
            updateData.username = profileData.username.trim();
          }
          if (profileData.phoneNumber !== (user.phoneNumbers[0]?.phoneNumber || '') && profileData.phoneNumber.trim() !== '') {
            updateData.phoneNumber = profileData.phoneNumber.trim();
          }
          if (profileData.profileImage !== (user.imageUrl || '') && profileData.profileImage) {
            updateData.profile_image = profileData.profileImage;
          }
          
          console.log('Updating profile via backend:', updateData);
          console.log('API URL:', `${API_URL}/users/profile`);
          console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
          
          // Check if we have any meaningful changes
          if (Object.keys(updateData).length === 0) {
            console.log('No meaningful changes to update');
            Alert.alert('No Changes', 'No changes were made to your profile.');
            setIsEditing(false);
            return;
          }
          
          // Update profile via our backend API
          const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Profile updated successfully:', result);
            
            // Reload user data to get the updated information
            try {
              await user.reload();
              console.log('User data reloaded successfully');
              
              // Also reload profile data from database
              await loadProfileImageFromDatabase();
              console.log('Profile data reloaded from database');
            } catch (reloadError) {
              console.warn('Could not reload user data:', reloadError);
              // Don't throw error here as the update was successful
            }
          } else {
            let errorData = { error: 'Unknown error' };
            
            // Try to parse JSON response
            try {
              const responseText = await response.text();
              console.log('Profile update error response text:', responseText);
              
              // Check if response is HTML (likely an error page)
              if (responseText.trim().startsWith('<')) {
                console.log('Received HTML response instead of JSON');
                errorData = { error: 'Server returned an error page. Please try again.' };
              } else {
                // Try to parse as JSON
                errorData = JSON.parse(responseText);
              }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          
          // If we can't parse the response, provide a generic error based on status code
          if (response.status === 404) {
            errorData.error = 'Profile endpoint not found. Please contact support.';
          } else if (response.status >= 500) {
            errorData.error = 'Server error. Please try again later.';
          } else {
            errorData.error = 'Profile update failed. Please try again.';
          }
        }
            
            console.error('Failed to update profile:', response.status, errorData);
            
            // Show specific error message based on status code
            let errorMessage = errorData.error || `Profile update failed (${response.status})`;
            
            if (response.status === 400) {
              errorMessage = errorData.error || 'Invalid profile data. Please check your input.';
            } else if (response.status === 401) {
              errorMessage = 'Authentication failed. Please sign in again.';
            } else if (response.status === 403) {
              errorMessage = 'You do not have permission to update this profile.';
            } else if (response.status === 404) {
              errorMessage = errorData.error || 'Profile service not available. Please try again later.';
            } else if (response.status >= 500) {
              errorMessage = 'Server error. Please try again later.';
            }
            
            throw new Error(errorMessage);
          }
        } catch (updateError) {
          console.error('Profile update error:', updateError);
          throw updateError;
        }
      }

      // Phone number updates are now handled in the profile update above

      setIsEditing(false);
      
      // Show success message
      const successMessage = 'Profile updated successfully!';
      
      Alert.alert('Success', successMessage);
      
      // Reload profile data from database to show updated values
      setTimeout(async () => {
        await loadProfileImageFromDatabase();
      }, 1000); // Small delay to ensure backend has processed the update
      
      // Notify parent component that profile was updated
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Handle specific error types
      let errorMessage = 'Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.name === 'AbortError') {
        errorMessage = 'Request was cancelled. Please try again.';
      }
      
      Alert.alert('Error', `Failed to update profile: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data from database
    loadProfileImageFromDatabase().then(() => {
      setProfileData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.emailAddresses[0]?.emailAddress || '',
        phoneNumber: user.phoneNumbers[0]?.phoneNumber || '',
        // profileImage will be set by loadProfileImageFromDatabase
      }));
    });
    setUsernameError('');
    setIsEditing(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: IMAGE_MEDIA_TYPE,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadProfileImage = async (imageUri) => {
    setUploadingImage(true);
    try {
      const token = await session?.getToken();
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile-image.jpg',
      });

      console.log('Uploading profile image...');
      
      const response = await fetch(`${API_URL}/users/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let fetch set it with boundary
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile image uploaded successfully:', result);
        
        // Update the profile image in state
        setProfileData(prev => ({
          ...prev,
          profileImage: result.imageUrl
        }));
        
        Alert.alert('Success', 'Profile image updated successfully!');
        
        // Notify parent component
        if (onProfileUpdated) {
          onProfileUpdated();
        }
      } else {
        let errorData = { error: 'Unknown error' };
        
        // Try to parse JSON response
        try {
          const responseText = await response.text();
          console.log('Upload error response text:', responseText);
          
          // Check if response is HTML (likely an error page)
          if (responseText.trim().startsWith('<')) {
            console.log('Received HTML response instead of JSON');
            errorData = { error: 'Server returned an error page. Please try again.' };
          } else {
            // Try to parse as JSON
            errorData = JSON.parse(responseText);
          }
        } catch (parseError) {
          console.error('Could not parse upload error response:', parseError);
          
          // If we can't parse the response, provide a generic error based on status code
          if (response.status === 404) {
            errorData.error = 'Upload endpoint not found. Please contact support.';
          } else if (response.status >= 500) {
            errorData.error = 'Server error. Please try again later.';
          } else {
            errorData.error = 'Upload failed. Please try again.';
          }
        }
        
        // Show specific error message based on status code
        let errorMessage = errorData.error || `Upload failed (${response.status})`;
        
        if (response.status === 400) {
          errorMessage = errorData.error || 'Invalid image file. Please try a different image.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please sign in again.';
        } else if (response.status === 413) {
          errorMessage = 'Image file is too large. Please choose a smaller image.';
        } else if (response.status === 404) {
          errorMessage = errorData.error || 'Upload service not available. Please try again later.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      
      // Handle specific error types
      let errorMessage = 'Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.name === 'AbortError') {
        errorMessage = 'Upload was cancelled. Please try again.';
      }
      
      Alert.alert('Error', `Failed to upload image: ${errorMessage}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const showImageOptions = () => {
    if (!isEditing) {
      // If not editing and there's a profile image, show full screen preview
      if (profileData.profileImage) {
        setShowImagePreview(true);
      } else {
        Alert.alert(
          "Profile Photo",
          "Tap 'Edit' to add a profile photo",
          [{ text: "OK" }]
        );
      }
      return;
    }

    Alert.alert(
      "Profile Photo",
      "Choose how you'd like to update your profile photo",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Photo Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };


  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={testAuth} style={styles.testButton}>
            <Text style={styles.testButtonText}>Test Auth</Text>
          </TouchableOpacity>
           {isEditing ? (
             <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={loading}>
               {loading ? (
                 <ActivityIndicator size="small" color={COLORS.primary} />
               ) : (
                 <Text style={styles.saveButtonText}>Save</Text>
               )}
             </TouchableOpacity>
           ) : (
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Image Section */}
            <View style={styles.profileImageSection}>
               <TouchableOpacity 
                 onPress={showImageOptions} 
                 style={[
                   styles.profileImageContainer,
                   isEditing && styles.profileImageContainerEditable
                 ]}
               >
                {profileData.profileImage ? (
                  <Image source={{ uri: profileData.profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.defaultProfileImage}>
                    <Ionicons name="person" size={60} color={COLORS.textLight} />
                  </View>
                )}
                
                {/* Upload progress indicator */}
                {uploadingImage && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                  </View>
                )}
                
                {/* Edit mode indicator */}
                {isEditing && !uploadingImage && (
                  <View style={styles.editImageOverlay}>
                    <Ionicons name="camera" size={24} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
               <Text style={styles.profileImageText}>
                 {isEditing ? 'Tap to change profile photo' : profileData.profileImage ? 'Tap to view full screen' : 'No profile photo'}
               </Text>
            </View>

          {/* Profile Details Form */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={profileData.firstName}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, firstName: text }))}
                editable={isEditing}
                placeholder={profileData.firstName ? "Enter first name" : "Add your first name"}
                placeholderTextColor={COLORS.textLight}
              />
              {!profileData.firstName && (
                <Text style={styles.helpText}>Complete your profile by adding your first name</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={profileData.lastName}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, lastName: text }))}
                editable={isEditing}
                placeholder={profileData.lastName ? "Enter last name" : "Add your last name"}
                placeholderTextColor={COLORS.textLight}
              />
              {!profileData.lastName && (
                <Text style={styles.helpText}>Complete your profile by adding your last name</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.usernameContainer}>
                <TextInput
                  style={[
                    styles.input, 
                    !isEditing && styles.inputDisabled,
                    usernameError && styles.inputError
                  ]}
                  value={profileData.username}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, username: text }))}
                  editable={isEditing}
                  placeholder="Enter username"
                  placeholderTextColor={COLORS.textLight}
                  autoCapitalize="none"
                />
                {checkingUsername && (
                  <View style={styles.usernameLoader}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                )}
              </View>
              {usernameError && (
                <Text style={styles.errorText}>{usernameError}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={profileData.email}
                editable={false}
                placeholder="Email address"
                placeholderTextColor={COLORS.textLight}
              />
              <Text style={styles.helpText}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={profileData.phoneNumber}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, phoneNumber: text }))}
                editable={isEditing}
                placeholder="Enter phone number"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Account Information */}
          <View style={styles.accountSection}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User ID</Text>
              <Text style={styles.infoValue}>
                {user?.id ? `${user.id.substring(0, 8)}...${user.id.substring(user.id.length - 4)}` : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>
                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>

          {isEditing && (
            <View style={styles.cancelButtonContainer}>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        </View>
      </Modal>

      {/* Full Screen Image Preview Modal */}
      <Modal
        visible={showImagePreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePreview(false)}
      >
        <View style={styles.imagePreviewContainer}>
          <TouchableOpacity 
            style={styles.imagePreviewCloseButton}
            onPress={() => setShowImagePreview(false)}
          >
            <Ionicons name="close" size={30} color={COLORS.white} />
          </TouchableOpacity>
          <Image 
            source={{ uri: profileData.profileImage }} 
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  editButton: {
    padding: 5,
  },
  editButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: COLORS.income,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  testButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    padding: 5,
  },
  saveButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImageContainerEditable: {
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 65,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.border,
  },
  defaultProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputDisabled: {
    backgroundColor: COLORS.background,
    color: COLORS.textLight,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  usernameContainer: {
    position: 'relative',
  },
  usernameLoader: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  inputError: {
    borderColor: '#d32f2f',
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#d32f2f',
    marginTop: 4,
  },
  accountSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '400',
  },
  cancelButtonContainer: {
    paddingBottom: 30,
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});

ProfileModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onProfileUpdated: PropTypes.func,
};
