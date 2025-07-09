import apiClient from './apiClient';

class PaymentService {
  // Get all payments for a company with filtering
  async getPayments(companyId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      if (filters.vendor_id) params.append('vendor_id', filters.vendor_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.payment_type) params.append('payment_type', filters.payment_type);

      const response = await apiClient.get(`/companies/${companyId}/payments?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  // Create a new payment
  async createPayment(companyId, paymentData) {
    try {
      // Transform frontend data to backend format
      const apiData = {
        payment_date: paymentData.paymentDate,
        payment_method: paymentData.paymentMethod,
        reference_number: paymentData.referenceNumber,
        customer_id: paymentData.customer,
        amount_received: paymentData.selectedInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        deposit_to_account_id: paymentData.depositTo,
        applications: paymentData.selectedInvoices.map(inv => ({
          transaction_id: inv.id,
          amount_applied: inv.amount,
          discount_taken: 0
        }))
      };

      const response = await apiClient.post(`/companies/${companyId}/payments`, apiData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Get specific payment details
  async getPayment(companyId, paymentId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  // Update payment information
  async updatePayment(companyId, paymentId, updateData) {
    try {
      const response = await apiClient.put(`/companies/${companyId}/payments/${paymentId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  // Delete payment
  async deletePayment(companyId, paymentId) {
    try {
      const response = await apiClient.delete(`/companies/${companyId}/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  // Get customer payments
  async getCustomerPayments(companyId, customerId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/payments`, {
        params: {
          customer_id: customerId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer payments:', error);
      throw error;
    }
  }

  // Get vendor payments
  async getVendorPayments(companyId, vendorId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/payments`, {
        params: {
          vendor_id: vendorId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor payments:', error);
      throw error;
    }
  }

  // Get recent payments for dashboard
  async getRecentPayments(companyId, limit = 10) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/payments`, {
        params: {
          limit: limit
        }
      });
      
      // Sort by date if needed (since backend might not have sorting)
      const payments = response.data || [];
      return payments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date)).slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent payments:', error);
      throw error;
    }
  }

  // Get payment statistics
  async getPaymentStats(companyId) {
    try {
      const payments = await this.getPayments(companyId);
      const paymentArray = payments || [];
      
      const totalAmount = paymentArray.reduce((sum, payment) => sum + (payment.amount_received || 0), 0);
      const averageAmount = paymentArray.length > 0 ? totalAmount / paymentArray.length : 0;
      
      return {
        total_payments: paymentArray.length,
        total_amount: totalAmount,
        average_amount: averageAmount,
        currency: 'USD'
      };
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }
}

export default new PaymentService();