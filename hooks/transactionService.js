// Transaction-related API calls
import apiService from './api';

class TransactionService {
  // Set authentication token
  setAuthToken(token) {
    apiService.setAuthToken(token);
  }
  // Get all transactions for a user
  async getTransactions(userId) {
    return apiService.get(`/users/${userId}/transactions`);
  }

  // Get transaction summary for a user
  async getTransactionSummary(userId) {
    return apiService.get(`/users/${userId}/transactions/summary`);
  }

  // Get a single transaction by ID
  async getTransactionById(userId, transactionId) {
    return apiService.get(`/users/${userId}/transactions/${transactionId}`);
  }

  // Create a new transaction
  async createTransaction(userId, transactionData) {
    const {
      amount,
      currency = 'INR',
      type,
      category,
      tags = [],
      description,
      reference,
      receipt_url,
      receipt_filename,
      transaction_date
    } = transactionData;

    if (!amount || !type) {
      throw new Error('Amount and type are required');
    }

    if (!['debit', 'credit'].includes(type)) {
      throw new Error('Type must be either "debit" or "credit"');
    }

    return apiService.post(`/users/${userId}/transactions`, {
      amount,
      currency,
      type,
      category,
      tags,
      description,
      reference,
      receipt_url,
      receipt_filename,
      transaction_date
    });
  }

  // Update a transaction
  async updateTransaction(userId, transactionId, transactionData) {
    return apiService.put(`/users/${userId}/transactions/${transactionId}`, transactionData);
  }

  // Delete a single transaction
  async deleteTransaction(userId, transactionId) {
    return apiService.delete(`/users/${userId}/transactions/${transactionId}`);
  }

  // Bulk delete transactions
  async bulkDeleteTransactions(userId, transactionIds) {
    return apiService.delete(`/users/${userId}/transactions`, {
      body: JSON.stringify({ transactionIds })
    });
  }

  // Get transactions with filters
  async getTransactionsWithFilters(userId, filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.startDate) queryParams.append('start_date', filters.startDate);
    if (filters.endDate) queryParams.append('end_date', filters.endDate);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users/${userId}/transactions?${queryString}` : `/users/${userId}/transactions`;
    
    return apiService.get(endpoint);
  }
}

export const transactionService = new TransactionService();
export default transactionService;
