import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser, useSession } from "@clerk/clerk-expo";
import { useState } from "react";
import { styles } from "../../assets/styles/create.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useTransactions } from "../../hooks/useTransactions";
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from "../../constants/api";
const CATEGORIES = [
  { id: "food", name: "Food & Drinks", icon: "fast-food", type: "expense" },
  { id: "shopping", name: "Shopping", icon: "cart", type: "expense" },
  { id: "transportation", name: "Transportation", icon: "car", type: "expense" },
  { id: "entertainment", name: "Entertainment", icon: "film", type: "expense" },
  { id: "bills", name: "Bills", icon: "receipt", type: "expense" },
  { id: "upi", name: "UPI", icon: "phone-portrait", type: "expense" },
  { id: "banking", name: "Banking", icon: "card", type: "expense" },
  { id: "investment", name: "Investment", icon: "trending-up", type: "expense" },
  { id: "healthcare", name: "Healthcare", icon: "medical", type: "expense" },
  { id: "education", name: "Education", icon: "school", type: "expense" },
  { id: "travel", name: "Travel", icon: "airplane", type: "expense" },
  { id: "subscription", name: "Subscription", icon: "refresh", type: "expense" },
  { id: "income", name: "Income", icon: "cash", type: "income" },
  { id: "other", name: "Other", icon: "ellipsis-horizontal", type: "expense" },
];

const CreateScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const { session } = useSession();
  // const { createTransaction } = useTransactions(user?.id); // Not needed as we're using direct API call

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isExpense, setIsExpense] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptImage, setReceiptImage] = useState(null);

  const pickReceiptImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setReceiptImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takeReceiptPhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setReceiptImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const removeReceipt = () => {
    setReceiptImage(null);
  };

  const showReceiptOptions = () => {
    Alert.alert(
      'Add Receipt',
      'Choose an option',
      [
        { text: 'Camera', onPress: takeReceiptPhoto },
        { text: 'Gallery', onPress: pickReceiptImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleCreate = async () => {
    // validations
    if (!title.trim()) return Alert.alert("Error", "Please enter a transaction title");
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!selectedCategory) return Alert.alert("Error", "Please select a category");

    if (!session) {
      Alert.alert("Error", "Please sign in to create transactions");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare FormData for file upload
      const formData = new FormData();
      
      // Add transaction data
      formData.append('amount', parseFloat(amount).toString());
      formData.append('currency', 'INR');
      formData.append('type', isExpense ? 'debit' : 'credit');
      formData.append('category', selectedCategory);
      formData.append('tags', JSON.stringify([]));
      formData.append('description', description || title);
      formData.append('reference', reference || title);
      formData.append('transaction_date', transactionDate);
      
      // Add receipt file if selected
      if (receiptImage) {
        formData.append('receipt', {
          uri: receiptImage.uri,
          type: 'image/jpeg',
          name: `receipt_${Date.now()}.jpg`,
        });
      }

      console.log('Creating transaction with receipt:', !!receiptImage);

      // Get authentication token
      const token = await session.getToken();
      console.log("token", token);
      // Send request to create transaction with file upload
      const response = await fetch(`${API_URL}/users/${user.id}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, let the browser set it
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);
      
      if (response.ok) {
        Alert.alert('Success', 'Transaction created successfully');
        router.back();
      } else {
        throw new Error(data.error || 'Failed to create transaction');
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      Alert.alert('Error', error.message || 'Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Transaction</Text>
        <TouchableOpacity
          style={[styles.saveButtonContainer, isLoading && styles.saveButtonDisabled]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.saveButton}>{isLoading ? "Saving..." : "Save"}</Text>
          {!isLoading && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
        <View style={styles.typeSelector}>
          {/* EXPENSE SELECTOR */}
          <TouchableOpacity
            style={[
              styles.typeButton, 
              isExpense && styles.typeButtonActive,
              isExpense && { backgroundColor: COLORS.expense, borderColor: COLORS.expense }
            ]}
            onPress={() => setIsExpense(true)}
          >
            <Ionicons
              name="arrow-down-circle"
              size={22}
              color={isExpense ? COLORS.white : COLORS.expense}
              style={styles.typeIcon}
            />
            <Text style={[
              styles.typeButtonText, 
              isExpense && styles.typeButtonTextActive
            ]}>
              Expense
            </Text>
          </TouchableOpacity>

          {/* INCOME SELECTOR */}
          <TouchableOpacity
            style={[
              styles.typeButton, 
              !isExpense && styles.typeButtonActive,
              !isExpense && { backgroundColor: COLORS.income, borderColor: COLORS.income }
            ]}
            onPress={() => setIsExpense(false)}
          >
            <Ionicons
              name="arrow-up-circle"
              size={22}
              color={!isExpense ? COLORS.white : COLORS.income}
              style={styles.typeIcon}
            />
            <Text style={[
              styles.typeButtonText, 
              !isExpense && styles.typeButtonTextActive
            ]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* AMOUNT CONTAINER */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={COLORS.textLight}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        {/* INPUT CONTAINER */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="create-outline"
            size={22}
            color={COLORS.textLight}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Transaction Title"
            placeholderTextColor={COLORS.textLight}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* DESCRIPTION CONTAINER */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="document-text-outline"
            size={22}
            color={COLORS.textLight}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            placeholderTextColor={COLORS.textLight}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* REFERENCE CONTAINER */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="link-outline"
            size={22}
            color={COLORS.textLight}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Reference (optional)"
            placeholderTextColor={COLORS.textLight}
            value={reference}
            onChangeText={setReference}
          />
        </View>

        {/* DATE CONTAINER */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color={COLORS.textLight}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Transaction Date"
            placeholderTextColor={COLORS.textLight}
            value={transactionDate}
            onChangeText={setTransactionDate}
          />
        </View>

        {/* RECEIPT UPLOAD CONTAINER */}
        <View style={styles.receiptContainer}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="receipt-outline" size={16} color={COLORS.text} /> Receipt/Bill
          </Text>
          
          {receiptImage ? (
            <View style={styles.receiptPreviewContainer}>
              <Image source={{ uri: receiptImage.uri }} style={styles.receiptPreview} />
              <View style={styles.receiptActions}>
                <TouchableOpacity style={styles.receiptActionButton} onPress={showReceiptOptions}>
                  <Ionicons name="camera" size={20} color={COLORS.primary} />
                  <Text style={styles.receiptActionText}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.receiptActionButton} onPress={removeReceipt}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.expense} />
                  <Text style={[styles.receiptActionText, { color: COLORS.expense }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.receiptUploadButton} onPress={showReceiptOptions}>
              <Ionicons name="camera-outline" size={32} color={COLORS.textLight} />
              <Text style={styles.receiptUploadText}>Add Receipt or Bill</Text>
              <Text style={styles.receiptUploadSubtext}>Tap to take photo or select from gallery</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* TITLE */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="pricetag-outline" size={16} color={COLORS.text} /> Category
        </Text>

        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.name;
            const categoryColor = category.type === "income" ? COLORS.income : COLORS.expense;
            
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  isSelected && styles.categoryButtonActive,
                  isSelected && { backgroundColor: categoryColor, borderColor: categoryColor }
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Ionicons
                  name={category.icon}
                  size={20}
                  color={isSelected ? COLORS.white : categoryColor}
                  style={styles.categoryIcon}
                />
                <Text
                  style={[
                    styles.categoryButtonText,
                    isSelected && styles.categoryButtonTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};
export default CreateScreen;
