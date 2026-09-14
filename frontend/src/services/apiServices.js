import api from '../api/client';

export const noticeService = {
  async getAll(params = {}) {
    const response = await api.get('/notices', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/notices/${id}`);
    return response.data?.data || response.data;
  },
};

export const examService = {
  async search(params = {}) {
    const response = await api.get('/exam-results', { params });
    return response.data;
  },

  async getFilters() {
    const response = await api.get('/exam-results/filters');
    return response.data?.data || response.data;
  },

  async getById(id) {
    const response = await api.get(`/exam-results/${id}`);
    return response.data?.data || response.data;
  },
};

export const bannerService = {
  async getBanners() {
    const response = await api.get('/scrolling-banners');
    return response.data;
  },
};

export const settingService = {
  async getPublicSettings() {
    const response = await api.get('/settings/public');
    return response.data?.data || response.data;
  },
};

export const teacherService = {
  async getAll(params = {}) {
    const response = await api.get('/teachers', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/teachers/${id}`);
    return response.data?.data || response.data;
  },
};

export const eventService = {
  async getAll(params = {}) {
    const response = await api.get('/events', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
};

export const faqService = {
  async getAll() {
    const response = await api.get('/faqs');
    return response.data;
  },
};

export const galleryService = {
  async getAll(params = {}) {
    const response = await api.get('/gallery-images', { params });
    return response.data;
  },
};
