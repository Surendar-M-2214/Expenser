import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../assets/styles/create.styles';
import { COLORS } from '../constants/colors';
import { formatDate } from '../lib/utils';
import { API_URL } from '../constants/api';
import PropTypes from 'prop-types';

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

const TransactionPreviewModal = ({ 
  visible, 
  transaction, 
  onClose, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    type: 'debit',
    transaction_date: '',
    reference: ''
  });

  // Initialize edit data when transaction changes
  React.useEffect(() => {
    if (transaction) {
      setEditData({
        title: transaction.description || transaction.title || '',
        description: transaction.description || '',
        amount: Math.abs(parseFloat(transaction.amount)).toString(),
        category: transaction.category || '',
        type: transaction.type || 'debit',
        transaction_date: transaction.transaction_date || transaction.created_at || '',
        reference: transaction.reference || ''
      });
    }
  }, [transaction]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setEditData(prev => ({ ...prev, transaction_date: formattedDate }));
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Transaction Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleSave = async () => {
    if (!editData.title.trim() || !editData.amount.trim() || !editData.category.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!editData.amount || isNaN(parseFloat(editData.amount)) || parseFloat(editData.amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/${transaction.user_id || 'current-user'}/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: editData.title.trim(),
          amount: parseFloat(editData.amount),
          category: editData.category,
          type: editData.type,
          transaction_date: editData.transaction_date,
          reference: editData.reference || editData.title.trim()
        })
      });

      if (response.ok) {
        const result = await response.json();
        onUpdate(result.data);
        setIsEditing(false);
        Alert.alert('Success', 'Transaction updated successfully');
      } else {
        throw new Error('Failed to update transaction');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  if (!transaction) return null;

  const isExpense = editData.type === 'debit';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Transaction' : 'Transaction Details'}
          </Text>
          {!isEditing ? (
            <TouchableOpacity onPress={handleEdit} style={styles.saveButtonContainer}>
              <Text style={styles.saveButton}>Edit</Text>
              <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.saveButtonContainer, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButton}>{isLoading ? "Saving..." : "Save"}</Text>
              {!isLoading && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* TYPE SELECTOR */}
            {isEditing && (
              <View style={styles.typeSelector}>
                {/* EXPENSE SELECTOR */}
                <TouchableOpacity
                  style={[
                    styles.typeButton, 
                    isExpense && styles.typeButtonActive,
                    isExpense && { backgroundColor: COLORS.expense, borderColor: COLORS.expense }
                  ]}
                  onPress={() => setEditData(prev => ({ ...prev, type: 'debit' }))}
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
                  onPress={() => setEditData(prev => ({ ...prev, type: 'credit' }))}
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
            )}

            {/* AMOUNT CONTAINER */}
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              {isEditing ? (
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textLight}
                  value={editData.amount}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, amount: text }))}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.amountInput}>
                  {Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                </Text>
              )}
            </View>

            {/* TITLE CONTAINER */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="create-outline"
                size={22}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  placeholder="Transaction Title"
                  placeholderTextColor={COLORS.textLight}
                  value={editData.title}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, title: text }))}
                />
              ) : (
                <Text style={[styles.input, { color: COLORS.text }]}>
                  {transaction.description || transaction.title || 'No title'}
                </Text>
              )}
            </View>

            {/* DESCRIPTION CONTAINER */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="document-text-outline"
                size={22}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  placeholder="Description (optional)"
                  placeholderTextColor={COLORS.textLight}
                  value={editData.description}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, description: text }))}
                />
              ) : (
                <Text style={[styles.input, { color: COLORS.text }]}>
                  {transaction.description || 'No description'}
                </Text>
              )}
            </View>

            {/* REFERENCE CONTAINER */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="link-outline"
                size={22}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  placeholder="Reference (optional)"
                  placeholderTextColor={COLORS.textLight}
                  value={editData.reference}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, reference: text }))}
                />
              ) : (
                <Text style={[styles.input, { color: COLORS.text }]}>
                  {transaction.reference || 'No reference'}
                </Text>
              )}
            </View>

            {/* DATE CONTAINER */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              {isEditing ? (
                <TouchableOpacity onPress={showDatePickerModal} style={styles.dateInputTouchable}>
                  <Text style={[
                    styles.input,
                    { color: editData.transaction_date ? COLORS.text : COLORS.textLight }
                  ]}>
                    {formatDateForDisplay(editData.transaction_date)}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.input, { color: COLORS.text }]}>
                  {formatDate(transaction.transaction_date || transaction.created_at)}
                </Text>
              )}
            </View>

            {/* CATEGORY SECTION */}
            <Text style={styles.sectionTitle}>
              <Ionicons name="pricetag-outline" size={16} color={COLORS.text} /> Category
            </Text>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => {
                const isSelected = editData.category === category.name;
                const categoryColor = category.type === "income" ? COLORS.income : COLORS.expense;
                
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      isSelected && styles.categoryButtonActive,
                      isSelected && { backgroundColor: categoryColor, borderColor: categoryColor }
                    ]}
                    onPress={() => setEditData(prev => ({ ...prev, category: category.name }))}
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

        {/* DATE PICKER */}
        {showDatePicker && (
          <DateTimePicker
            value={editData.transaction_date ? new Date(editData.transaction_date) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(2020, 0, 1)}
          />
        )}
      </View>
    </Modal>
  );
};

TransactionPreviewModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  transaction: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default TransactionPreviewModal;
