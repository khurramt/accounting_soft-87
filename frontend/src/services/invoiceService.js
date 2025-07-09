import apiClient from './apiClient';

class InvoiceService {
  // Get all invoices for a company with search and filtering
  async getInvoices(companyId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.search) params.append('search', filters.search);
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      if (filters.status) params.append('status', filters.status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.min_amount) params.append('min_amount', filters.min_amount);
      if (filters.max_amount) params.append('max_amount', filters.max_amount);
      if (filters.is_posted !== undefined) params.append('is_posted', filters.is_posted);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
      if (filters.page) params.append('page', filters.page);
      if (filters.page_size) params.append('page_size', filters.page_size);

      const response = await apiClient.get(`/companies/${companyId}/invoices?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  // Create a new invoice
  async createInvoice(companyId, invoiceData) {
    try {
      // Transform frontend data to backend format
      const apiData = {
        transaction_type: 'INVOICE',
        customer_id: invoiceData.customer,
        transaction_date: invoiceData.date,
        due_date: invoiceData.dueDate,
        transaction_number: invoiceData.invoiceNumber,
        reference_number: invoiceData.invoiceNumber,
        payment_terms: invoiceData.terms,
        memo: invoiceData.memo,
        custom_fields: {
          customer_message: invoiceData.customerMessage
        },
        lines: invoiceData.items.map((item, index) => ({
          line_number: index + 1,
          line_type: 'ITEM',
          item_id: item.item,
          description: item.description,
          quantity: item.qty,
          unit_price: item.rate,
          tax_rate: 0.08, // 8% tax rate from frontend
          tax_amount: item.amount * 0.08
        }))
      };

      const response = await apiClient.post(`/companies/${companyId}/invoices`, apiData);
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  // Get specific invoice details
  async getInvoice(companyId, invoiceId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  // Update invoice information
  async updateInvoice(companyId, invoiceId, updateData) {
    try {
      const response = await apiClient.put(`/companies/${companyId}/invoices/${invoiceId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  // Delete invoice
  async deleteInvoice(companyId, invoiceId) {
    try {
      const response = await apiClient.delete(`/companies/${companyId}/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  // Send invoice via email
  async sendInvoiceEmail(companyId, invoiceId, emailAddress = null) {
    try {
      const params = emailAddress ? `?email_address=${emailAddress}` : '';
      const response = await apiClient.post(`/companies/${companyId}/invoices/${invoiceId}/send-email${params}`);
      return response.data;
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw error;
    }
  }

  // Get invoice PDF
  async getInvoicePDF(companyId, invoiceId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  }

  // Get outstanding invoices for customer
  async getOutstandingInvoices(companyId, customerId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/invoices`, {
        params: {
          customer_id: customerId,
          is_posted: true,
          status: 'OPEN'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching outstanding invoices:', error);
      throw error;
    }
  }

  // Get invoice statistics
  async getInvoiceStats(companyId) {
    try {
      const [allInvoices, openInvoices, overdueInvoices] = await Promise.all([
        this.getInvoices(companyId, { page_size: 1, page: 1 }),
        this.getInvoices(companyId, { status: 'OPEN', page_size: 1, page: 1 }),
        this.getInvoices(companyId, { status: 'OVERDUE', page_size: 1, page: 1 })
      ]);

      return {
        total: allInvoices.total,
        open: openInvoices.total,
        overdue: overdueInvoices.total,
        paid: allInvoices.total - openInvoices.total - overdueInvoices.total
      };
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      throw error;
    }
  }
}

export default new InvoiceService();