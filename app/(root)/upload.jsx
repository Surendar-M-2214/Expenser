import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../assets/styles/home.styles";
import { COLORS } from "../../constants/colors";
import { API_URL } from "../../constants/api";
import { useState } from "react";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from "@clerk/clerk-expo";
import MoneyLoadingAnimation from "../../components/MoneyLoadingAnimation";
import TransactionPreviewModal from "../../components/TransactionPreviewModal";
import { TransactionItem } from "../../components/TransactionItem";

export default function UploadScreen() {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  const handleFileUpload = async (file) => {
    if (!user?.id) {
      Alert.alert("Authentication Required", "Please sign in to upload files");
      return;
    }

    setIsUploading(true);
    setExtractedData(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch(`${API_URL}/upload/file`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (data.success) {
        setExtractedData(data.data);
        // Format transactions with proper IDs and structure for TransactionItem
        const formattedTransactions = data.data.transactions.map((transaction, index) => ({
          id: `upload-${index}-${Date.now()}`, // Unique ID for upload transactions
          title: transaction.title, // User-friendly title from AI
          description: transaction.description, // Exact description from file
          amount: transaction.amount,
          category: transaction.category,
          type: transaction.type,
          transaction_date: transaction.date,
          date: transaction.date,
          reference: transaction.reference,
          created_at: new Date().toISOString()
        }));
        setTransactions(formattedTransactions);
        setShowPreview(true);
      } else {
        // Handle different types of errors
        let errorMessage = 'Error processing file: ' + data.error;
        
        if (data.error && data.error.includes('503')) {
          errorMessage = 'AI service is temporarily overloaded. Please try again in a few minutes.';
        } else if (data.error && data.error.includes('overloaded')) {
          errorMessage = 'AI service is busy. Please try again later.';
        } else if (data.error && data.error.includes('quota')) {
          errorMessage = 'AI service quota exceeded. Please try again later.';
        } else if (data.error && data.error.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (data.error && data.error.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
        
        Alert.alert('Processing Error', errorMessage, [
          { text: 'OK', style: 'default' },
          { text: 'Retry', style: 'default', onPress: () => handleFileUpload(file) }
        ]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Error uploading file: ' + error.message;
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. AI processing is taking longer than expected. Please try again.';
      } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('503') || error.message.includes('overloaded')) {
        errorMessage = 'AI service is temporarily overloaded. Please try again in a few minutes.';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'AI service quota exceeded. Please try again later.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Invalid response from server. Please try again.';
      }
      
      Alert.alert('Upload Error', errorMessage, [
        { text: 'OK', style: 'default' },
        { text: 'Retry', style: 'default', onPress: () => handleFileUpload(file) }
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveTransactions = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch(`${API_URL}/upload/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'current-user', // You can get this from auth context
          transactions: transactions
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', `Successfully uploaded ${data.data.totalUploaded} transactions!`);
        setExtractedData(null);
        setTransactions([]);
        setShowPreview(false);
      } else {
        let errorMessage = 'Error saving transactions: ' + data.error;
        
        if (data.error && data.error.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (data.error && data.error.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (data.error && data.error.includes('database')) {
          errorMessage = 'Database error. Please try again.';
        }
        
        Alert.alert('Save Error', errorMessage, [
          { text: 'OK', style: 'default' },
          { text: 'Retry', style: 'default', onPress: handleSaveTransactions }
        ]);
      }
    } catch (error) {
      console.error('Save error:', error);
      
      let errorMessage = 'Error saving transactions: ' + error.message;
      
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Invalid response from server. Please try again.';
      }
      
      Alert.alert('Save Error', errorMessage, [
        { text: 'OK', style: 'default' },
        { text: 'Retry', style: 'default', onPress: handleSaveTransactions }
      ]);
    } finally {
      setIsSaving(false);
    }
  };


  const handleCancelPreview = () => {
    setExtractedData(null);
    setTransactions([]);
    setShowPreview(false);
  };

  const handleTransactionPress = (transaction) => {
    // Convert the upload transaction format to the format expected by TransactionPreviewModal
    const formattedTransaction = {
      id: transaction.id, // Use the transaction ID from the item
      title: transaction.title, // User-friendly title
      description: transaction.description, // Exact description from file
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      transaction_date: transaction.transaction_date || transaction.date,
      reference: transaction.reference,
      user_id: user?.id || 'current-user'
    };
    setSelectedTransaction(formattedTransaction);
    setPreviewModalVisible(true);
  };

  const handlePreviewModalClose = () => {
    setPreviewModalVisible(false);
    setSelectedTransaction(null);
  };

  const handleTransactionUpdate = (updatedTransaction) => {
    // Update the transaction in the local transactions array
    const transactionIndex = transactions.findIndex(t => t.id === updatedTransaction.id);
    if (transactionIndex !== -1) {
      const updatedTransactions = [...transactions];
      updatedTransactions[transactionIndex] = {
        ...updatedTransactions[transactionIndex],
        title: updatedTransaction.title || updatedTransaction.description,
        description: updatedTransaction.description,
        amount: updatedTransaction.amount,
        category: updatedTransaction.category,
        type: updatedTransaction.type,
        transaction_date: updatedTransaction.transaction_date,
        date: updatedTransaction.transaction_date,
        reference: updatedTransaction.reference
      };
      setTransactions(updatedTransactions);
    }
    setPreviewModalVisible(false);
    setSelectedTransaction(null);
  };

  const handleDeleteTransaction = (transactionId) => {
    Alert.alert(
      "Delete Transaction", 
      "Are you sure you want to delete this transaction from the upload list?", 
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            const updatedTransactions = transactions.filter(t => t.id !== transactionId);
            setTransactions(updatedTransactions);
          }
        }
      ]
    );
  };

  const handleReceiptUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileObj = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        };
        await handleFileUpload(fileObj);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document: ' + error.message);
    }
  };

  const handleCSVUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileObj = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        };
        await handleFileUpload(fileObj);
      }
    } catch (error) {
      console.error('Error picking CSV file:', error);
      Alert.alert('Error', 'Failed to pick CSV file: ' + error.message);
    }
  };

  const handlePhotoUpload = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos');
        return;
      }

      // Show action sheet for camera or gallery
      Alert.alert(
        'Select Image',
        'Choose how you want to add an image',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Camera', 
            onPress: async () => {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const fileObj = {
                  uri: asset.uri,
                  name: `receipt_${Date.now()}.jpg`,
                  type: 'image/jpeg',
                };
                await handleFileUpload(fileObj);
              }
            }
          },
          { 
            text: 'Gallery', 
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const fileObj = {
                  uri: asset.uri,
                  name: `receipt_${Date.now()}.jpg`,
                  type: 'image/jpeg',
                };
                await handleFileUpload(fileObj);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error with image picker:', error);
      Alert.alert('Error', 'Failed to access camera/gallery: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Upload Data</Text>
        </View>

        {/* UPLOAD OPTIONS */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>
            <Ionicons name="cloud-upload-outline" size={20} color={COLORS.primary} /> Upload Options
          </Text>

          {/* RECEIPT UPLOAD */}
          <TouchableOpacity 
            style={[styles.uploadOption, isUploading && { opacity: 0.6 }]} 
            onPress={handleReceiptUpload}
            disabled={isUploading}
          >
            <View style={styles.uploadIconContainer}>
              {isUploading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
              <Ionicons name="receipt" size={24} color={COLORS.primary} />
              )}
            </View>
            <View style={styles.uploadContent}>
              <Text style={styles.uploadTitle}>
                {isUploading ? 'Processing...' : 'Upload Receipt'}
              </Text>
              <Text style={styles.uploadDescription}>
                {isUploading ? 'Please wait while we process your file' : 'Scan receipts to automatically extract transaction details'}
              </Text>
            </View>
            {!isUploading && <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />}
          </TouchableOpacity>

          {/* CSV UPLOAD */}
          <TouchableOpacity 
            style={[styles.uploadOption, isUploading && { opacity: 0.6 }]} 
            onPress={handleCSVUpload}
            disabled={isUploading}
          >
            <View style={styles.uploadIconContainer}>
              {isUploading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
              <Ionicons name="document-text" size={24} color={COLORS.primary} />
              )}
            </View>
            <View style={styles.uploadContent}>
              <Text style={styles.uploadTitle}>
                {isUploading ? 'Processing...' : 'Import CSV'}
              </Text>
              <Text style={styles.uploadDescription}>
                {isUploading ? 'Please wait while we process your file' : 'Import transactions from bank statements or spreadsheets'}
              </Text>
            </View>
            {!isUploading && <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />}
          </TouchableOpacity>

          {/* PHOTO UPLOAD */}
          <TouchableOpacity 
            style={[styles.uploadOption, isUploading && { opacity: 0.6 }]} 
            onPress={handlePhotoUpload}
            disabled={isUploading}
          >
            <View style={styles.uploadIconContainer}>
              {isUploading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
              <Ionicons name="camera" size={24} color={COLORS.primary} />
              )}
            </View>
            <View style={styles.uploadContent}>
              <Text style={styles.uploadTitle}>
                {isUploading ? 'Processing...' : 'Take Photo'}
              </Text>
              <Text style={styles.uploadDescription}>
                {isUploading ? 'Please wait while we process your file' : 'Capture receipts or documents with your camera'}
              </Text>
            </View>
            {!isUploading && <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />}
          </TouchableOpacity>
        </View>

        {/* COMING SOON BANNER */}
        <View style={[styles.card, { marginTop: 20, backgroundColor: COLORS.background }]}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Ionicons name="sparkles" size={20} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>
              Coming Soon
            </Text>
          </View>
          <Text style={{ color: COLORS.textLight, lineHeight: 20 }}>
            We're working on advanced upload features including AI-powered receipt scanning, 
            automatic categorization, and bulk import capabilities.
          </Text>
        </View>
      </ScrollView>

      {/* Transaction Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancelPreview}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transaction Preview</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalContent}>
            <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
              {extractedData && (
                <View style={styles.card}>
                  <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>
                    {extractedData.fileName}
                  </Text>
                  <Text style={[styles.textLight, { marginBottom: 20 }]}>
                    {extractedData.totalTransactions} transactions found
                  </Text>

                  {/* Transaction List */}
                  {transactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      item={transaction}
                      onDelete={handleDeleteTransaction}
                      onPress={handleTransactionPress}
                    />
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Fixed Action Buttons */}
            <View style={styles.fixedActionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleCancelPreview}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  (isSaving || transactions.length === 0) && styles.buttonDisabled
                ]}
                onPress={handleSaveTransactions}
                disabled={isSaving || transactions.length === 0}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Add {transactions.length} Transactions
                  </Text>
                )}
              </TouchableOpacity>
            </View>
        </View>
      </View>
      </Modal>
      
      {/* Money Loading Animation */}
      <MoneyLoadingAnimation 
        visible={isUploading || isSaving} 
        text={isUploading ? "Processing your file..." : "Saving transactions..."} 
      />

      {/* Transaction Preview Modal */}
      <TransactionPreviewModal
        visible={previewModalVisible}
        transaction={selectedTransaction}
        onClose={handlePreviewModalClose}
        onUpdate={handleTransactionUpdate}
      />
    </View>
  );
}
