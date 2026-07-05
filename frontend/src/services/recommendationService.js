import api from './api'

export const recommendationService = {
  async generate(formData) {
    const res = await api.post('/api/recommend', formData)
    return res.data
  },

  async getHistory(params = {}) {
    const res = await api.get('/api/history', { params })
    return res.data
  },

  async deleteRecommendation(id) {
    const res = await api.delete(`/api/history/${id}`)
    return res.data
  },
}
