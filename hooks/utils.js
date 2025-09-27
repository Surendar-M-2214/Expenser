// Utility functions for hooks
import { COLORS } from '../constants/colors';

// Format currency for display
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Format date for display
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return new Date(date).toLocaleDateString('en-IN', { ...defaultOptions, ...options });
};

// Calculate percentage change
export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
};

// Validate transaction data
export const validateTransactionData = (data) => {
  const errors = [];
  
  if (!data.amount || data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  
  if (!data.type || !['debit', 'credit'].includes(data.type)) {
    errors.push('Type must be either "debit" or "credit"');
  }
  
  if (!data.category || data.category.trim() === '') {
    errors.push('Category is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get transaction type color
export const getTransactionTypeColor = (type) => {
  return type === 'credit' ? COLORS.income : COLORS.expense;
};

// Get transaction type icon
export const getTransactionTypeIcon = (type) => {
  return type === 'credit' ? 'arrow-down' : 'arrow-up';
};

// Group transactions by date
export const groupTransactionsByDate = (transactions) => {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.transaction_date || transaction.created_at).toDateString();
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(transaction);
    return groups;
  }, {});
};

// Sort transactions by date (newest first)
export const sortTransactionsByDate = (transactions, ascending = false) => {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.transaction_date || a.created_at);
    const dateB = new Date(b.transaction_date || b.created_at);
    
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// Calculate total for transactions
export const calculateTransactionTotal = (transactions, type = null) => {
  return transactions
    .filter(transaction => !type || transaction.type === type)
    .reduce((total, transaction) => total + (transaction.amount || 0), 0);
};

// Get category statistics
export const getCategoryStats = (transactions) => {
  const stats = {};
  
  transactions.forEach(transaction => {
    const category = transaction.category || 'Uncategorized';
    
    if (!stats[category]) {
      stats[category] = {
        count: 0,
        totalAmount: 0,
        transactions: []
      };
    }
    
    stats[category].count++;
    stats[category].totalAmount += transaction.amount || 0;
    stats[category].transactions.push(transaction);
  });
  
  return stats;
};
