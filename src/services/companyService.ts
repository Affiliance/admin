import axios from "axios";

// Interface based on user provided JSON
export interface Company {
  id: number;
  campanyName: string;
  address: string;
  phoneNumber: string;
  website: string;
  logoUrl: string;
  description: string;
  contactEmail: string;
  isVerified: boolean;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

// Request params for "All" endpoint
export interface CompanyFilterParams {
  Page?: number;
  PageSize?: number;
  SearchKeyword?: string;
  IsVerified?: boolean;
  SortBy?: string;
  IsDescending?: boolean;
}

const API_BASE_URL = "http://affilliance.runasp.net";

export const companyService = {
  // 1- http://affilliance.runasp.net/api/Company/admin/pending
  getPendingCompanies: async (): Promise<Company[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/Company/admin/pending`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.data.data; // Assuming array of Company
  },

  // 2- http://affilliance.runasp.net/api/Company/admin/verified
  getVerifiedCompanies: async (): Promise<Company[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/Company/admin/verified`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.data.data;
  },

  // 3- http://affilliance.runasp.net/api/Company/admin/all
  getAllCompanies: async (params: CompanyFilterParams): Promise<Company[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/Company/admin/all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      params,
    });
    // User previously modified other endpoints to return response.data.data.data
    // Assuming consistency here
    return response.data.data.data || [];
  },

  // 4- http://affilliance.runasp.net/api/Company/{id}/approve
  approveCompany: async (id: number): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/Company/${id}/approve`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  // 5- http://affilliance.runasp.net/api/Company/{id}/reject
  rejectCompany: async (id: number): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/Company/${id}/reject`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  // 6- http://affilliance.runasp.net/api/Company/{id}/verify
  verifyCompany: async (id: number): Promise<void> => {
    await axios.put(`${API_BASE_URL}/api/Company/${id}/verify`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  // 7- http://affilliance.runasp.net/api/Company/{id}/suspend
  suspendCompany: async (id: number): Promise<void> => {
    await axios.put(`${API_BASE_URL}/api/Company/${id}/suspend`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  // 8- http://affilliance.runasp.net/api/Company/{id}/reactivate
  reactivateCompany: async (id: number): Promise<void> => {
    await axios.put(`${API_BASE_URL}/api/Company/${id}/reactivate`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },
};
