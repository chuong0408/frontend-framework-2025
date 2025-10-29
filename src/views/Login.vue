<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../store/auth'
import axios from 'axios'

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
    message.value = ''
    
    // ✅ Sửa lại query string
    const response = await axios.get(
      `http://localhost:3001/users`,
      {
        params: {
          userName: username.value,
          password: password.value
        }
      }
    )

    console.log('Response:', response.data)

    if (response.data && response.data.length > 0) {
      const user = response.data[0]
      
      // Lưu thông tin user vào auth store
      auth.login({
        username: user.userName,
        email: user.email,
        fullName: user.fullName,
        role: user.role || 'user'
      })

      message.value = 'Đăng nhập thành công!'

      // Redirect theo role
      setTimeout(() => {
        if (user.role === 'admin') {
          router.push('/admin/products')
        } else {
          router.push('/')
        }
      }, 500)
      
    } else {
      message.value = 'Sai tài khoản hoặc mật khẩu'
    }
    
  } catch (error) {
    console.error('Lỗi đăng nhập:', error)
    
    if (error.response) {
      // Server trả về response nhưng có lỗi
      message.value = `Lỗi server: ${error.response.status}`
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      message.value = 'Không thể kết nối đến server. Vui lòng kiểm tra server đang chạy!'
    } else {
      message.value = 'Có lỗi xảy ra: ' + error.message
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <h2>🔐 Đăng nhập</h2>
    
    <input 
      v-model="username" 
      placeholder="Tên đăng nhập" 
      :disabled="loading" 
      @keyup.enter="handleLogin"
    />
    
    <input 
      v-model="password" 
      type="password" 
      placeholder="Mật khẩu" 
      :disabled="loading" 
      @keyup.enter="handleLogin"
    />
    
    <button @click="handleLogin" :disabled="loading">
      {{ loading ? '⏳ Đang xử lý...' : '🚀 Đăng nhập' }}
    </button>
    
    <p v-if="message" :class="message.includes('thành công') ? 'success' : 'error'">
      {{ message }}
    </p>

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
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

input {
  display: block;
  width: 100%;
  margin: 12px 0;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

button {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.error {
  color: #e53935;
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  background: #ffebee;
  padding: 10px;
  border-radius: 6px;
}

.success {
  color: #2e7d32;
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  background: #e8f5e9;
  padding: 10px;
  border-radius: 6px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.register-link a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>