import api from './api';

// Add Recipe
export const addRecipe = async (formData: any) => {
  try {
    const response = await api.post('/recipe/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// Get All Recipes
export const getAllRecipes = async (params: any) => {
  try {
    const response = await api.post('/recipe/all', params);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// Update Recipe
export const updateRecipe = async (formData: any) => {
  try {
    const response = await api.put('/recipe/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}; 