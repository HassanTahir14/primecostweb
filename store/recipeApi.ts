import api from './api';

// Add Recipe
export const addRecipe = async (formData: FormData) => {
    try {
    
      console.log("Final FormData contents:");
      formData.forEach((value, key) => {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.type})`);
        } else {
          console.log(`${key}: ${typeof value === 'string' ? value.substring(0, 30) + '...' : value}`);
        }
      });
  

      const token = localStorage.getItem('authToken');

      const response = await api.post('/recipe/add', formData, {
        headers: {
          Authorization: `Bearer ${token}`
         
        }
      });
  
      return response.data;
    } catch (error: any) {
      console.error('API Error:', error);
  
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        throw error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw { description: 'No response received from server', error: error.message };
      } else {
        console.error('Error setting up request:', error.message);
        throw { description: 'Error setting up request', error: error.message };
      }
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