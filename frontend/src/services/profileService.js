import api from './api'

export const profileService = {
  async getProfile() {
    const res = await api.get('/api/profile')
    return res.data
  },

  async updateProfile(data) {
    const res = await api.put('/api/profile', data)
    return res.data
  },

  async changePassword(data) {
    const res = await api.put('/api/profile/password', data)
    return res.data
  },
}
