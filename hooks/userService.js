// User-related API calls
import apiService from './api';

class UserService {
  // Get all users
  async getUsers() {
    return apiService.get('/users');
  }

  // Get user by ID
  async getUserById(userId) {
    return apiService.get(`/users/${userId}`);
  }

  // Create a new user
  async createUser(userData) {
    const { name, email } = userData;
    
    if (!name || !email) {
      throw new Error('Name and email are required');
    }

    return apiService.post('/users', { name, email });
  }

  // Update user
  async updateUser(userId, userData) {
    const { name, email } = userData;
    
    if ((!name || name.trim() === '') && (!email || email.trim() === '')) {
      throw new Error('At least one field (name or email) must be provided');
    }

    return apiService.put(`/users/${userId}`, { name, email });
  }

  // Delete user
  async deleteUser(userId) {
    return apiService.delete(`/users/${userId}`);
  }

  // Create or get user (useful for Clerk integration)
  async createOrGetUser(clerkUser) {
    try {
      // Try to get user first
      const existingUser = await this.getUserById(clerkUser.id);
      return existingUser;
    } catch (error) {
      // If user doesn't exist, create them
      if (error.message.includes('404')) {
        return this.createUser({
          name: clerkUser.fullName || clerkUser.firstName + ' ' + clerkUser.lastName,
          email: clerkUser.emailAddresses[0]?.emailAddress
        });
      }
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;
