// File upload service for receipts and bills
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

class FileUploadService {
  // Request camera and media library permissions
  async requestPermissions() {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera and media library permissions are required to upload receipts.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // Pick image from camera
  async pickImageFromCamera() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          type: 'image',
          name: `receipt_${Date.now()}.jpg`,
          size: result.assets[0].fileSize || 0,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    }
  }

  // Pick image from gallery
  async pickImageFromGallery() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          type: 'image',
          name: result.assets[0].fileName || `receipt_${Date.now()}.jpg`,
          size: result.assets[0].fileSize || 0,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      return null;
    }
  }

  // Pick document
  async pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType?.startsWith('image/') ? 'image' : 'document',
          name: result.assets[0].name,
          size: result.assets[0].size || 0,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document. Please try again.');
      return null;
    }
  }

  // Show file picker options
  async showFilePickerOptions() {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Receipt',
        'Choose how you want to add a receipt',
        [
          { text: 'Camera', onPress: () => resolve('camera') },
          { text: 'Gallery', onPress: () => resolve('gallery') },
          { text: 'Documents', onPress: () => resolve('documents') },
          { text: 'Cancel', onPress: () => resolve(null), style: 'cancel' },
        ]
      );
    });
  }

  // Main method to pick file
  async pickFile() {
    try {
      const option = await this.showFilePickerOptions();
      
      switch (option) {
        case 'camera':
          return await this.pickImageFromCamera();
        case 'gallery':
          return await this.pickImageFromGallery();
        case 'documents':
          return await this.pickDocument();
        default:
          return null;
      }
    } catch (error) {
      console.error('Error in pickFile:', error);
      return null;
    }
  }

  // Upload file to server (placeholder - you'll need to implement actual upload)
  async uploadFile(file) {
    try {
      // This is a placeholder implementation
      // You'll need to implement actual file upload to your server or cloud storage
      
      // For now, we'll simulate a successful upload
      const mockUploadUrl = `https://your-storage.com/receipts/${file.name}`;
      
      return {
        success: true,
        url: mockUploadUrl,
        filename: file.name,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validate file
  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      Alert.alert('File Too Large', 'File size must be less than 10MB');
      return false;
    }
    
    // Note: In a real implementation, you'd check the actual MIME type
    // const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    return true;
  }
}

export const fileUploadService = new FileUploadService();
export default fileUploadService;
