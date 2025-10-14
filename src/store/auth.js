import { reactive } from 'vue'

export const auth = reactive({
  isAuthenticated: false,
  user: null,
  login(userData) {
    this.isAuthenticated = true
    this.user = userData 
    localStorage.setItem('user', JSON.stringify(userData))
  },

  logout() {
    this.isAuthenticated = false
    this.user = null
    localStorage.removeItem('user')
  },
  checkAuth() {
    const userData = localStorage.getItem('user')
    if (userData) {
      this.user = JSON.parse(userData)
      this.isAuthenticated = true
    }
  },
  isAdmin() {
    return this.user && this.user.role === 'admin'
  },

  isUser() {
    return this.user && this.user.role === 'user'
  }
})

auth.checkAuth()