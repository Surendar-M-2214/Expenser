// Financial summary and analytics API calls
import apiService from './api';

class FinanceService {
  // Get financial summary for a user
  async getFinancialSummary(userId, period = 'month') {
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users/${userId}/finance/summary?${queryString}` : `/users/${userId}/finance/summary`;
    
    return apiService.get(endpoint);
  }

  // Get detailed financial breakdown for a user
  async getFinancialBreakdown(userId, period = 'month') {
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users/${userId}/finance/breakdown?${queryString}` : `/users/${userId}/finance/breakdown`;
    
    return apiService.get(endpoint);
  }

  // Get financial summary by different periods
  async getFinancialSummaryByPeriod(userId, period) {
    const validPeriods = ['day', 'week', 'month', 'year'];
    
    if (!validPeriods.includes(period)) {
      throw new Error(`Invalid period. Must be one of: ${validPeriods.join(', ')}`);
    }

    return this.getFinancialSummary(userId, period);
  }

  // Get financial breakdown by different periods
  async getFinancialBreakdownByPeriod(userId, period) {
    const validPeriods = ['day', 'week', 'month', 'year'];
    
    if (!validPeriods.includes(period)) {
      throw new Error(`Invalid period. Must be one of: ${validPeriods.join(', ')}`);
    }

    return this.getFinancialBreakdown(userId, period);
  }

  // Get financial data for multiple periods
  async getFinancialDataForMultiplePeriods(userId, periods = ['day', 'week', 'month', 'year']) {
    try {
      const promises = periods.map(period => 
        Promise.all([
          this.getFinancialSummary(userId, period),
          this.getFinancialBreakdown(userId, period)
        ])
      );

      const results = await Promise.all(promises);
      
      return periods.reduce((acc, period, index) => {
        acc[period] = {
          summary: results[index][0],
          breakdown: results[index][1]
        };
        return acc;
      }, {});
    } catch (error) {
      console.error('Error fetching financial data for multiple periods:', error);
      throw error;
    }
  }
}

export const financeService = new FinanceService();
export default financeService;
