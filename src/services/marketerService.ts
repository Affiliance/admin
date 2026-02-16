import axios from "axios";

const API_BASE_URL = "http://affilliance.runasp.net";

export interface Marketer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
  performanceScore: number;
  // Add other fields as discovered. Inferring these for now.
  createdAt?: string;
  avatarUrl?: string; // Potential field
}

export interface MarketerFilterParams {
  page?: number;
  pageSize?: number;
}

export const marketerService = {
  // http://affilliance.runasp.net/api/Marketer/pending-verfication (GET)
  // Note: typo "verfication" in endpoint as per user instruction
  getPendingMarketers: async (params?: MarketerFilterParams): Promise<Marketer[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/Marketer/pending-verfication`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      params,
    });
    // Assuming response structure similar to others: response.data.data.data or response.data.data
    // Checking previous patterns.
    // If it's a paginated list, it might be in .data.data
    return response.data.data?.data || response.data.data || response.data || [];
  },

  // http://affilliance.runasp.net/api/Marketer/{id}/verify (PUT)
  verifyMarketer: async (id: number): Promise<void> => {
    await axios.put(`${API_BASE_URL}/api/Marketer/${id}/verify`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  // http://affilliance.runasp.net/api/Marketer/{id}/unverify (PUT)
  unverifyMarketer: async (id: number): Promise<void> => {
    await axios.put(`${API_BASE_URL}/api/Marketer/${id}/unverify`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  // http://affilliance.runasp.net/api/Marketer/{id}/performance-score (PUT)
  updatePerformanceScore: async (id: number, score: number): Promise<void> => {
    // Assuming query param or body. Trying query param first as it's a simple value update often done this way in .NET, 
    // but body is safer for PUT.
    // User didn't specify body structure.
    // Let's try sending as query param ?score=X AND body { score: X } to cover bases?
    // No, let's try Query param first as it's common for single value updates in this API style.
    await axios.put(`${API_BASE_URL}/api/Marketer/${id}/performance-score?score=${score}`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },
};
