<template>
  <div class="register-container">
    <h2>Đăng ký tài khoản</h2>

    <input v-model="username" placeholder="Tên đăng nhập (*)" type="text" :disabled="loading" />

    <input v-model="fullName" placeholder="Họ và tên" type="text" :disabled="loading" />

    <input v-model="email" placeholder="Email (*)" type="email" :disabled="loading" />

    <input v-model="password" type="password" placeholder="Mật khẩu (*)" :disabled="loading" />

    <input v-model="confirmPassword" type="password" placeholder="Xác nhận mật khẩu (*)" :disabled="loading" />

    <button @click="register" :disabled="loading">
      {{ loading ? 'Đang xử lý...' : 'Đăng ký' }}
    </button>

    <p :class="message.includes('thành công') ? 'success' : 'error'">
      {{ message }}
    </p>

    <p class="login-link">
      Đã có tài khoản?
      <router-link to="/login">Đăng nhập ngay</router-link>
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      message: '',
      loading: false
    }
  },
  methods: {
    async register() {
      // Validate dữ liệu
      if (!this.username || !this.password || !this.confirmPassword || !this.email) {
        this.message = 'Vui lòng điền đầy đủ thông tin'
        return
      }

      if (this.password !== this.confirmPassword) {
        this.message = 'Mật khẩu xác nhận không khớp'
        return
      }

      if (this.password.length < 6) {
        this.message = 'Mật khẩu phải có ít nhất 6 ký tự'
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        this.message = 'Email không hợp lệ'
        return
      }

      try {
        this.loading = true

        console.log('Đang kiểm tra username:', this.username)

        // Kiểm tra username đã tồn tại chưa
        const checkUrl = `http://localhost:3001/users?userName=${this.username}`
        console.log('URL kiểm tra:', checkUrl)

        const checkResponse = await fetch(checkUrl)
        console.log('Response status:', checkResponse.status)

        const existingUsers = await checkResponse.json()
        console.log('Existing users:', existingUsers)
        console.log('Số lượng user trùng:', existingUsers.length)

        if (existingUsers.length > 0) {
          this.message = 'Tên đăng nhập đã tồn tại'
          this.loading = false
          return
        }

        // Tạo user mới với role mặc định là "user"
        const newUser = {
          userName: this.username,
          fullName: this.fullName,
          email: this.email,
          password: this.password,
          role: "user" // Role mặc định
        }

        console.log('Đang tạo user mới:', newUser)

        // Lưu vào db.json
        const response = await fetch('http://localhost:3001/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newUser)
        })

        console.log('Response tạo user:', response.status)

        if (response.ok) {
          const createdUser = await response.json()
          console.log('User đã tạo:', createdUser)

          this.message = 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...'

          setTimeout(() => {
            this.$router.push('/login')
          }, 1500)
        } else {
          this.message = 'Đăng ký thất bại. Vui lòng thử lại!'
        }
      } catch (error) {
        console.error('Lỗi đăng ký:', error)
        this.message = 'Có lỗi xảy ra: ' + error.message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register-container {
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
  cursor: not-allowed;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
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

.success {
  color: green;
  text-align: center;
  margin-top: 10px;
}

.login-link {
  text-align: center;
  margin-top: 15px;
}

.login-link a {
  color: #4CAF50;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>