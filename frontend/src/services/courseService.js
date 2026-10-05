import api from '../api/client';

export const courseService = {
  getCachedCourses() {
    return null;
  },

  async getAll(params = {}) {
    try {
      const response = await api.get('/courses', { params });
      const rawData = response.data;
      if (Array.isArray(rawData)) {
        return rawData;
      }
      if (Array.isArray(rawData?.data)) {
        return rawData.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      return [];
    }
  },

  async getById(id) {
    const response = await api.get(`/courses/${id}`);
    const data = response.data;
    return data?.course || data?.data || data;
  },

  async getCategories() {
    const response = await api.get('/course-categories');
    return response.data;
  },

  clearCache() {}
};

export default courseService;
