
import api from './api';

// Add subRecipe
export const addSubRecipe = async (formData: any) => {
  try {
    const response = await api.post('/sub-recipe/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// Get All subRecipes
export const getAllSubRecipes = async (params: any) => {
  try {
    const response = await api.post('/sub-recipe/all', params);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// Update subRecipe
export const updateSubRecipe = async (formData: any) => {
  try {
    const response = await api.put('/sub-r@ecipe/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}; 

export const getSubRecipeById = async (id: number) => {
  try {
    const response = await api.get(`/sub-recipe/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};