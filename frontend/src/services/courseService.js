import api from '../api/client';

export const courseService = {
  async getAll(params = {}) {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/course-categories');
    return response.data;
  },
};
