import axios from "axios";

// Types based on assumed API response structure
// Adjust these based on actual API response
export interface Campaign {
  id: string; // Changed to string to align with other services (likely GUIDs)
  name: string;
  description?: string;
  payout: number;
  status: "Pending" | "Active" | "Rejected" | "Approved";
  imageUrl?: string;
  companyName?: string;
}

const API_BASE_URL = "http://affilliance.runasp.net";

export const campaignService = {
  getCampaigns: async (): Promise<Campaign[]> => {
    // User confirmed: http://affilliance.runasp.net/api/Campaign
    const response = await axios.get(`${API_BASE_URL}/api/Campaign`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log(response.data.data.data);

    return response.data.data.data;
  },

  approveCampaign: async (id: string): Promise<void> => {
    // User Request: http://affilliance.runasp.net/Campaign/{id}/admin/approve
    // params: id required
    const response = await axios.put(
      `${API_BASE_URL}/Campaign/${id}/admin/approve`,
      { id }, // Sending ID in body as well if needed, though PUT usually takes body. 
      // If query param is meant, it would be differnt. 
      // Usually PUT /resource/id/action doesn't need body if ID is in path.
      // Passing empty object or specific payload if required. 
      // For now, assuming standard pattern.
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  },

  rejectCampaign: async (id: string): Promise<void> => {
    // User Request: http://affilliance.runasp.net/Campaign/{id}/admin/reject
    const response = await axios.put(
      `${API_BASE_URL}/Campaign/${id}/admin/reject`,
      { id },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  },
};
