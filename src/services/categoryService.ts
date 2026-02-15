import axios from "axios";

// Interface based on user provided JSON
export interface Category {
  id: number;
  nameEn: string;
  nameAr: string;
  slug: string;
  icon: string | null;
  parentId: number | null;
  parentName: string | null;
  childrenCount: number;
  campaignsCount: number;
}

export interface CreateCategoryRequest {
  nameEn: string;
  nameAr: string;
  slug: string;
  icon?: string;
  parentId?: number | null;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
  id: number;
}

const API_BASE_URL = "http://affilliance.runasp.net";

export const categoryService = {
  // 1- http://affilliance.runasp.net/api/Category (GET)
  getCategories: async (): Promise<Category[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/Category`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    // The user showed "data": [...] wraper in the comment? 
    // Comment: " "data": [ ... ] " 
    // So the response might be { data: Category[] } or just Category[].
    // I will check if response.data.data exists, otherwise use response.data.
    return response.data.data || response.data;
  },

  // 2- http://affilliance.runasp.net/api/Category/{id} (PUT: id param is required)
  updateCategory: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await axios.put(`${API_BASE_URL}/api/Category/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  },

  // 3- http://affilliance.runasp.net/api/Category/{id} (DEL: id param is required)
  // deleteCategory: async (id: number): Promise<void> => {
  //   await axios.delete(`${API_BASE_URL}/api/Category/${id}`, {
  //     headers: {
  //       Authorization: `Bearer ${localStorage.getItem("token")}`,
  //     },
  //   });
  // },

  // 4- http://affilliance.runasp.net/api/Category/bulk (POST: create multible categories at once)
  createCategoriesBulk: async (data: CreateCategoryRequest[]): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/Category/bulk`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  // 5- http://affilliance.runasp.net/api/Category/{id}/safe (DEL: id param is required - Delete category safely)
  // Assuming this is a custom endpoint pattern like /api/Category/{id}/safe
  safeDeleteCategory: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/api/Category/${id}/safe`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },
};
