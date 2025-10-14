<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

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


<template>
  <div class="login-card">
    <h2>Đăng nhập</h2>
    <input v-model="username" type="text" placeholder="Tên đăng nhập" />
    <input v-model="password" type="password" placeholder="Mật khẩu" />
    <button @click="handleLogin">Đăng nhập</button>
    <p :class="loginSuccess ? 'success' : 'error'">{{ message }}</p>
  </div>
</template>



<style scoped>
.login-card {
  max-width: 400px;
  margin: 60px auto;
  padding: 32px;
  border-radius: 12px;
  background: linear-gradient(to bottom right, #ffffff, #f0f4ff);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.login-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
  font-size: 24px;
}

input {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

.success {
  color: #28a745;
  text-align: center;
  font-weight: 500;
  margin-top: 12px;
}

.error {
  color: #dc3545;
  text-align: center;
  font-weight: 500;
  margin-top: 12px;
}

/* Responsive */
  @media (max-width: 480px) {
    .login-card {
      padding: 24px;
      margin: 40px 16px;
    }

    h2 {
      font-size: 20px;
    }

    input,
    button {
      font-size: 15px;
    }
  }
</style>
