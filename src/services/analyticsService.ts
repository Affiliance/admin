import axios from "axios";

// Types based on assumed API response structure
export interface PlatformOverview {
  totalUsers: number;
  totalRevenue: number;
  activeCampaigns: number;
  totalConversions: number;
}

export interface RevenueBreakdown {
  date: string;
  revenue: number;
}

export interface TopPerformer {
  id: string;
  name: string;
  revenue: number;
  conversions: number;
  avatarUrl?: string;
}

const API_BASE_URL = "http://affilliance.runasp.net/api/Analytics/admin";

export const analyticsService = {
  getPlatformOverview: async (): Promise<PlatformOverview> => {
    const response = await axios.get(`${API_BASE_URL}/platform-overview`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  },

  getRevenueBreakdown: async (): Promise<RevenueBreakdown[]> => {
    const response = await axios.get(`${API_BASE_URL}/revenuew-breakdown`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data; // Assuming array of RevenueBreakdown
  },

  getTopPerformers: async (): Promise<TopPerformer[]> => {
    const response = await axios.get(`${API_BASE_URL}/top-perfomers`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data; // Assuming array of TopPerformer
  },
};
