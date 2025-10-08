<template>
  <div>
    <h2>Đăng ký</h2>
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Mật khẩu" />
    <button @click="register">Đăng ký</button>
  </div>
</template>

<script>
export default {
  data() {
    return { email: '', password: '' }
  },
  methods: {
    register() {
      const users = JSON.parse(localStorage.getItem('users')) || []
      users.push({ email: this.email, password: this.password })
      localStorage.setItem('users', JSON.stringify(users))
      alert('Đăng ký thành công')
      this.$router.push('/login')
    }
  }
}
</script>
