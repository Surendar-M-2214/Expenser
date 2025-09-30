import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTransactions } from "../../hooks/useTransactions";
import { TransactionItem } from "../../components/TransactionItem";
import TransactionPreviewModal from "../../components/TransactionPreviewModal";
import { styles } from "../../assets/styles/home.styles";
import { COLORS } from "../../constants/colors";

export default function TransactionsScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { transactions, loadData, deleteTransaction, updateTransactionInState } = useTransactions(user.id);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = (id) => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTransaction(id) },
    ]);
  };

  const handleTransactionPress = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedTransaction(null);
  };

  const handleTransactionUpdate = (updatedTransaction) => {
    // Update the transaction in the local state
    updateTransactionInState(updatedTransaction);
    setModalVisible(false);
    setSelectedTransaction(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>All Transactions</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => router.push("/(modals)/create")}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TRANSACTIONS LIST */}
      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={transactions}
        renderItem={({ item }) => (
          <TransactionItem 
            item={item} 
            onDelete={handleDelete} 
            onPress={handleTransactionPress}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 100 }}>
            <Ionicons name="receipt-outline" size={64} color={COLORS.textLight} />
            <Text style={{ fontSize: 18, color: COLORS.textLight, marginTop: 16 }}>
              No transactions found
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.textLight, marginTop: 8, textAlign: "center" }}>
              Add your first transaction to get started
            </Text>
          </View>
        }
      />
      
      {/* TRANSACTION PREVIEW MODAL */}
      <TransactionPreviewModal
        visible={modalVisible}
        transaction={selectedTransaction}
        onClose={handleModalClose}
        onUpdate={handleTransactionUpdate}
      />
    </View>
  );
}
