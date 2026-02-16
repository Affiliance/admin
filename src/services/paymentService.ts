import axios from "axios";

const API_BASE_URL = "http://affilliance.runasp.net";

export interface FinancialReportParams {
  startDate?: string;
  endDate?: string;
}

export interface FinancialReport {
  periodStart: string;
  periodEnd: string;
  totalWithdrawals: number;
  completedWithdrawals: number;
  pendingWithdrawals: number;
  totalCommissions: number;
  netBalance: number;
}

export const paymentService = {
  // http://affilliance.runasp.net/api/Payment/admin/financial-reports
  getFinancialReports: async (params?: FinancialReportParams): Promise<FinancialReport> => {
    const response = await axios.get(`${API_BASE_URL}/api/Payment/admin/financial-reports`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      params,
    });
    return response.data.data;
  },

  // http://affilliance.runasp.net/api/Payment/admin/withdrawals (GET)
  getWithdrawals: async (params?: WithdrawalFilterParams): Promise<WithdrawalRequest[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/Payment/admin/withdrawals`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      params,
    });
    // Assuming standard response structure
    return response.data.data?.data || response.data.data || [];
  },

  // http://affilliance.runasp.net/api/Payment/admin/withdrawals/{id}/approve (POST)
  approveWithdrawal: async (id: number, data: ApprovalRequest): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/Payment/admin/withdrawals/${id}/approve`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  // http://affilliance.runasp.net/api/Payment/admin/withdrawals/{id}/reject (POST)
  rejectWithdrawal: async (id: number, data: RejectionRequest): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/Payment/admin/withdrawals/${id}/reject`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },
};

export interface WithdrawalRequest {
  id: number;
  marketerId: number;
  marketerName?: string; // Inferring this might be present, or fetched separately
  amount: number;
  status: "Pending" | "Approved" | "Rejected" | "Processing" | "Completed" | "Failed";
  requestDate: string;
  bankName?: string;
  accountNumber?: string;
  holderName?: string;
  iban?: string;
  rejectionReason?: string;
  adminNotes?: string;
  transactionId?: string;
}

export interface WithdrawalFilterParams {
  Page?: number;
  PageSize?: number;
  MarketerId?: number;
  Status?: string;
  StartDate?: string;
  EndDate?: string;
  MinAmount?: number;
  MaxAmount?: number;
}

export interface ApprovalRequest {
  isApproved: boolean; // true
  reason: string;
  adminNotes: string;
  transactionId: string;
}

export interface RejectionRequest {
  isApproved: boolean; // false
  reason: string;
  adminNotes: string;
  transactionId: string; // Likely optional/empty for rejection but user schema included it
}
