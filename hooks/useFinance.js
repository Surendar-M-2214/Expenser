// Hook for financial summary and analytics
import { useCallback, useState } from "react";
import { financeService } from "./financeService";

export const useFinance = (userId) => {
  const [financialData, setFinancialData] = useState({
    summary: null,
    breakdown: null,
  });
  const [multiPeriodData, setMultiPeriodData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get financial summary for a specific period
  const getFinancialSummary = useCallback(async (period = 'month') => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const summary = await financeService.getFinancialSummary(userId, period);
      setFinancialData(prev => ({ ...prev, summary }));
      
      return summary;
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Get financial breakdown for a specific period
  const getFinancialBreakdown = useCallback(async (period = 'month') => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const breakdown = await financeService.getFinancialBreakdown(userId, period);
      setFinancialData(prev => ({ ...prev, breakdown }));
      
      return breakdown;
    } catch (error) {
      console.error("Error fetching financial breakdown:", error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Get both summary and breakdown for a period
  const getFinancialData = useCallback(async (period = 'month') => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [summary, breakdown] = await Promise.all([
        financeService.getFinancialSummary(userId, period),
        financeService.getFinancialBreakdown(userId, period)
      ]);
      
      setFinancialData({ summary, breakdown });
      
      return { summary, breakdown };
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Get financial data for multiple periods
  const getMultiPeriodData = useCallback(async (periods = ['day', 'week', 'month', 'year']) => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await financeService.getFinancialDataForMultiplePeriods(userId, periods);
      setMultiPeriodData(data);
      
      return data;
    } catch (error) {
      console.error("Error fetching multi-period financial data:", error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Get financial summary by specific period
  const getSummaryByPeriod = useCallback(async (period) => {
    return financeService.getFinancialSummaryByPeriod(userId, period);
  }, [userId]);

  // Get financial breakdown by specific period
  const getBreakdownByPeriod = useCallback(async (period) => {
    return financeService.getFinancialBreakdownByPeriod(userId, period);
  }, [userId]);

  return {
    // Data
    financialData,
    multiPeriodData,
    isLoading,
    error,
    
    // Actions
    getFinancialSummary,
    getFinancialBreakdown,
    getFinancialData,
    getMultiPeriodData,
    getSummaryByPeriod,
    getBreakdownByPeriod,
    
    // Utility
    clearError: () => setError(null),
    clearData: () => {
      setFinancialData({ summary: null, breakdown: null });
      setMultiPeriodData({});
    }
  };
};
