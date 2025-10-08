<template>
  <div class="login-card">
    <h2>Đăng nhập</h2>
    <input v-model="username" type="text" placeholder="Tên đăng nhập" />
    <input v-model="password" type="password" placeholder="Mật khẩu" />
    <button @click="handleLogin">Đăng nhập</button>
    <p :class="loginSuccess ? 'success' : 'error'">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Mock dữ liệu người dùng
const users = [
  { username: 'admin', password: '123456', role: 'admin' },
  { username: 'user1', password: 'abc123', role: 'user' }
]

const username = ref('')
const password = ref('')
const message = ref('')
const loginSuccess = ref(false)
const router = useRouter()

function handleLogin() {
  const foundUser = users.find(
    (u) => u.username === username.value && u.password === password.value
  )

  if (foundUser) {
    localStorage.setItem('user', JSON.stringify(foundUser))
    message.value = 'Đăng nhập thành công'
    loginSuccess.value = true
    setTimeout(() => {
      router.push(foundUser.role === 'admin' ? '/admin/products' : '/products')
    }, 1000)
  } else {
    message.value = 'Sai tên đăng nhập hoặc mật khẩu'
    loginSuccess.value = false
  }
}
</script>

<style scoped>
.login-card {
  max-width: 400px;
  margin: 40px auto;
  padding: 24px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
input {
  display: block;
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
button {
  padding: 10px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
.success {
  color: green;
  margin-top: 10px;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
