/**
 * Authentication Service for Twilio Verify SMS OTP
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const authService = {
  /**
   * Triggers SMS OTP to the given phone number via FastAPI backend -> Twilio Verify API
   * @param {string} phone - 10-digit mobile number
   */
  async sendOTP(phone) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ phone: String(phone).trim() }),
      });

      const data = await response.json().catch(() => ({ detail: 'Network error communicating with auth server' }));

      if (!response.ok) {
        const errorMsg = data?.detail || data?.message || 'Failed to send SMS OTP. Please check your mobile number.';
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Backend server is offline. Please make sure FastAPI backend is running on http://localhost:8000.');
      }
      throw err;
    }
  },

  /**
   * Verifies 6-digit OTP code with FastAPI backend -> Twilio Verify API
   * @param {string} phone - Mobile number
   * @param {string} code - 6-digit OTP code
   */
  async verifyOTP(phone, code) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          phone: String(phone).trim(),
          code: String(code).trim(),
        }),
      });

      const data = await response.json().catch(() => ({ detail: 'Network error communicating with auth server' }));

      if (!response.ok) {
        const errorMsg = data?.detail || data?.message || 'Invalid or expired OTP. Please try again.';
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Backend server is offline. Please make sure FastAPI backend is running on http://localhost:8000.');
      }
      throw err;
    }
  }
};
