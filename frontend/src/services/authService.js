import api from './api'

export const authService = {
  async register(data) {
    const res = await api.post('/api/auth/register', data)
    return res.data
  },

  async login(data) {
    const res = await api.post('/api/auth/login', data)
    return res.data
  },
}
