import api from '../api/client';

export const blogService = {
  async getAll(params = {}) {
    const response = await api.get('/blog-posts', { params });
    // Returns { success: true, data: { posts: [...], total, page, limit, pages } }
    return response.data?.data || { posts: [], total: 0 };
  },

  async getById(id) {
    const response = await api.get(`/blog-posts/${id}`);
    return response.data?.data || response.data;
  },

  async getBySlug(slug) {
    const response = await api.get(`/blog-posts/slug/${slug}`);
    return response.data?.data || response.data;
  },

  async getCategories() {
    const response = await api.get('/blog-categories');
    return response.data?.data || response.data;
  },
};
