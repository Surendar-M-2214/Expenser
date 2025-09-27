import { View, Text, TouchableOpacity, Alert, ScrollView, TextInput, ActivityIndicator, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../assets/styles/home.styles";
import { COLORS } from "../../constants/colors";
import { API_URL } from "../../constants/api";
import { useState } from "react";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from "@clerk/clerk-expo";

export default function UploadScreen() {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

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
      
      const response = await fetch(`${API_URL}/upload/file`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setExtractedData(data.data);
        setTransactions(data.data.transactions);
        setShowPreview(true);
      } else {
        Alert.alert('Error', 'Error processing file: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Error uploading file: ' + error.message);
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
        Alert.alert('Error', 'Error saving transactions: ' + data.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Error saving transactions: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTransaction = (index) => {
    setEditingTransaction(index);
  };

  const handleUpdateTransaction = (index, field, value) => {
    const updatedTransactions = [...transactions];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      [field]: value
    };
    setTransactions(updatedTransactions);
  };

  const handleDeleteTransaction = (index) => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
  };

  const handleCancelPreview = () => {
    setExtractedData(null);
    setTransactions([]);
    setEditingTransaction(null);
    setShowPreview(false);
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

          <ScrollView style={styles.content}>
            {extractedData && (
              <View style={styles.card}>
                <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>
                  {extractedData.fileName}
                </Text>
                <Text style={[styles.textLight, { marginBottom: 20 }]}>
                  {extractedData.totalTransactions} transactions found
                </Text>

                {/* Transaction List */}
                {transactions.map((transaction, index) => (
                  <View key={`transaction-${index}-${transaction.date}-${transaction.amount}`} style={styles.transactionCard}>
                    <View style={styles.transactionContent}>
                      <View style={styles.transactionLeft}>
                        <Text style={styles.transactionTitle}>
                          {editingTransaction === index ? (
                            <TextInput
                              style={[styles.input, { fontSize: 16, marginBottom: 4 }]}
                              value={transaction.description}
                              onChangeText={(value) => handleUpdateTransaction(index, 'description', value)}
                              placeholder="Description"
                            />
                          ) : (
                            transaction.description
                          )}
                        </Text>
                        <Text style={styles.transactionCategory}>
                          {editingTransaction === index ? (
                            <TextInput
                              style={[styles.input, { fontSize: 14, marginBottom: 8 }]}
                              value={transaction.category}
                              onChangeText={(value) => handleUpdateTransaction(index, 'category', value)}
                              placeholder="Category"
                            />
                          ) : (
                            transaction.category
                          )}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {editingTransaction === index ? (
                            <TextInput
                              style={[styles.input, { fontSize: 12 }]}
                              value={transaction.date}
                              onChangeText={(value) => handleUpdateTransaction(index, 'date', value)}
                              placeholder="YYYY-MM-DD"
                            />
                          ) : (
                            transaction.date
                          )}
                        </Text>
                      </View>
                      <View style={styles.transactionRight}>
                        <Text style={[
                          styles.transactionAmount,
                          { color: transaction.type === 'credit' ? COLORS.success : COLORS.error }
                        ]}>
                          {editingTransaction === index ? (
                            <TextInput
                              style={[styles.input, { fontSize: 16, textAlign: 'right' }]}
                              value={transaction.amount.toString()}
                              onChangeText={(value) => handleUpdateTransaction(index, 'amount', parseFloat(value))}
                              placeholder="0.00"
                              keyboardType="numeric"
                            />
                          ) : (
                            `₹${transaction.amount}`
                          )}
                        </Text>
                        <Text style={[
                          styles.transactionDate,
                          { color: transaction.type === 'credit' ? COLORS.success : COLORS.error }
                        ]}>
                          {editingTransaction === index ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <TouchableOpacity
                                style={[
                                  styles.typeButton,
                                  transaction.type === 'debit' && styles.typeButtonActive
                                ]}
                                onPress={() => handleUpdateTransaction(index, 'type', 'debit')}
                              >
                                <Text style={[
                                  styles.typeButtonText,
                                  transaction.type === 'debit' && styles.typeButtonTextActive
                                ]}>Debit</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[
                                  styles.typeButton,
                                  transaction.type === 'credit' && styles.typeButtonActive
                                ]}
                                onPress={() => handleUpdateTransaction(index, 'type', 'credit')}
                              >
                                <Text style={[
                                  styles.typeButtonText,
                                  transaction.type === 'credit' && styles.typeButtonTextActive
                                ]}>Credit</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            transaction.type
                          )}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.transactionActions}>
                      {editingTransaction === index ? (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => setEditingTransaction(null)}
                        >
                          <Ionicons name="checkmark" size={20} color={COLORS.success} />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEditTransaction(index)}
                        >
                          <Ionicons name="pencil" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteTransaction(index)}
                      >
                        <Ionicons name="trash" size={20} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Action Buttons */}
                <View style={styles.previewActions}>
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
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
