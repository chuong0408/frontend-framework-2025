<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../store/auth'

const router = useRouter()
const username = ref('')
const password = ref('')
const message = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    message.value = 'Vui lòng điền đầy đủ thông tin'
    return
  }

  try {
    loading.value = true
    
    const response = await fetch(
      `http://localhost:3001/users?userName=${username.value}&password=${password.value}`
    )
    const users = await response.json()

    if (users.length > 0) {
      const user = users[0]
      
      // Lưu thông tin user kèm role vào auth store
      auth.login({
        username: user.userName,
        email: user.email,
        fullName: user.fullName,
        role: user.role || 'user' // ← Lưu role, mặc định là 'user'
      })

      // Redirect theo role
      if (user.role === 'admin') {
        router.push('/admin/products')
      } else {
        router.push('/') // User thường vào trang home
      }
    } else {
      message.value = 'Sai tài khoản hoặc mật khẩu'
    }
  } catch (error) {
    console.error('Lỗi đăng nhập:', error)
    message.value = 'Có lỗi xảy ra. Vui lòng kiểm tra kết nối!'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <h2>Đăng nhập</h2>
    <input v-model="username" placeholder="Tên đăng nhập" :disabled="loading" />
    <input v-model="password" type="password" placeholder="Mật khẩu" :disabled="loading" />
    <button @click="handleLogin" :disabled="loading">
      {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
    </button>
    <p class="error">{{ message }}</p>

    <p class="register-link">
      Chưa có tài khoản?
      <router-link to="/register">Đăng ký ngay</router-link>
    </p>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

input {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

input:disabled {
  background-color: #f5f5f5;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error {
  color: red;
  text-align: center;
  margin-top: 10px;
}

.register-link {
  text-align: center;
  margin-top: 15px;
}

.register-link a {
  color: #4CAF50;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>