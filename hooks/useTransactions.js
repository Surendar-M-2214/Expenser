// Updated useTransactions hook using the new API service
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { transactionService } from "./transactionService";
import { useUser, useSession } from "@clerk/clerk-expo";

export const useTransactions = (userId) => {
  const { user } = useUser();
  const { session } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch transactions for a user
  const fetchTransactions = useCallback(async () => {
    if (!userId || !user || !session) return;
    
    try {
      setError(null);
      const token = await session.getToken();
      transactionService.setAuthToken(token);
      const data = await transactionService.getTransactions(userId);
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(error.message);
    }
  }, [userId, user, session]);

  // Fetch transaction summary for a user
  const fetchSummary = useCallback(async () => {
    if (!userId || !user || !session) return;
    
    try {
      setError(null);
      const token = await session.getToken();
      transactionService.setAuthToken(token);
      const data = await transactionService.getTransactionSummary(userId);
      console.log("Summary:", data);
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setError(error.message);
    }
  }, [userId, user, session]);

  // Load all data (transactions and summary)
  const loadData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Run both requests in parallel for better performance
      await Promise.all([fetchTransactions(), fetchSummary()]);
    } catch (error) {
      console.error("Error loading data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions, fetchSummary, userId]);

  // Create a new transaction
  const createTransaction = useCallback(async (transactionData) => {
    if (!userId || !session) return;
    
    try {
      setError(null);
      const token = await session.getToken();
      transactionService.setAuthToken(token);
      const newTransaction = await transactionService.createTransaction(userId, transactionData);
      
      // Refresh data after creation
      await loadData();
      
      Alert.alert("Success", "Transaction created successfully");
      return newTransaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      setError(error.message);
      Alert.alert("Error", error.message);
      throw error;
    }
  }, [userId, session, loadData]);

  // Update a transaction
  const updateTransaction = useCallback(async (transactionId, transactionData) => {
    if (!userId || !session) return;
    
    try {
      setError(null);
      const token = await session.getToken();
      transactionService.setAuthToken(token);
      const updatedTransaction = await transactionService.updateTransaction(userId, transactionId, transactionData);
      
      // Refresh data after update
      await loadData();
      
      Alert.alert("Success", "Transaction updated successfully");
      return updatedTransaction;
    } catch (error) {
      console.error("Error updating transaction:", error);
      setError(error.message);
      Alert.alert("Error", error.message);
      throw error;
    }
  }, [userId, session, loadData]);

  // Delete a transaction
  const deleteTransaction = useCallback(async (transactionId) => {
    if (!userId || !session) return;
    
    try {
      setError(null);
      const token = await session.getToken();
      transactionService.setAuthToken(token);
      await transactionService.deleteTransaction(userId, transactionId);
      
      // Refresh data after deletion
      await loadData();
      
      Alert.alert("Success", "Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setError(error.message);
      Alert.alert("Error", error.message);
      throw error;
    }
  }, [userId, session, loadData]);

  // Bulk delete transactions
  const bulkDeleteTransactions = useCallback(async (transactionIds) => {
    if (!userId || !transactionIds.length || !session) return;
    
    try {
      setError(null);
      const token = await session.getToken();
      transactionService.setAuthToken(token);
      await transactionService.bulkDeleteTransactions(userId, transactionIds);
      
      // Refresh data after deletion
      await loadData();
      
      Alert.alert("Success", `${transactionIds.length} transactions deleted successfully`);
    } catch (error) {
      console.error("Error bulk deleting transactions:", error);
      setError(error.message);
      Alert.alert("Error", error.message);
      throw error;
    }
  }, [userId, session, loadData]);

  // Get transactions with filters
  const getTransactionsWithFilters = useCallback(async (filters) => {
    if (!userId || !session) return;
    
    try {
      setError(null);
      const token = await session.getToken();
      transactionService.setAuthToken(token);
      const filteredTransactions = await transactionService.getTransactionsWithFilters(userId, filters);
      setTransactions(filteredTransactions);
      return filteredTransactions;
    } catch (error) {
      console.error("Error fetching filtered transactions:", error);
      setError(error.message);
      throw error;
    }
  }, [userId, session]);

  return {
    // Data
    transactions,
    summary,
    isLoading,
    error,
    
    // Actions
    loadData,
    fetchTransactions,
    fetchSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    getTransactionsWithFilters,
    
    // Utility
    clearError: () => setError(null),
  };
};
