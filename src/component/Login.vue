<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const users = ref([])
const userName = ref('')
const password = ref('')
const message = ref('')
const isSuccess = ref(false)

const loadDuLieu = async () => {
    console.log(`the component is now mounted.`)
    const response = await axios.get('http://localhost:3000/users');
    if (response.status == 200) {
      users.value = response.data
    }
}
const login = async () => {
    if (userName.value === "") {
        message.value = "username not empty" 
    }
    else if (password.value === "") {
        message.value = "password not empty"
    }
    else {
        const user = users.value.find(
            u => u.userName === userName.value && u.password === password.value
        )
        if (user) {
            message.value = 'Đăng nhập thành công'
            isSuccess.value = true
            localStorage.setItem('currentUser', JSON.stringify(user))
            router.push('/')
        } else {
            message.value = 'Đăng nhập thất bại'
            isSuccess.value = false
        }
    }
}
onMounted(() => {
    loadDuLieu()
})
</script>
<template>
    <h1>Login</h1>
    <router-link :to="`/`"><h2 class="h5 mb-1">Trang chu</h2></router-link>

    <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <form @submit.prevent="login" class="border p-4 rounded shadow bg-light">
          <h3 class="text-center mb-4">Đăng nhập</h3>

          <div class="mb-3">
            <label for="username" class="form-label">Tên đăng nhập</label>
            <input type="text" id="username" v-model="userName" class="form-control" placeholder="user name" />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Mật khẩu</label>
            <input type="password" id="password" v-model="password" class="form-control" placeholder="password" />
          </div>

          <button type="submit" class="btn btn-primary w-100">Đăng nhập</button>
          
          <div class="mt-3 text-center">
            <span :class="isSuccess ? 'text-success' : 'text-danger'">{{ message }}</span>
          </div>
          <router-link :to="`/singup`"><h2 class="h5 mb-1">Dang ky</h2></router-link>
        </form>
      </div>
    </div>
  </div>
</template>
<style scoped>
.success{
    color: green;
  }
  .erron{
    color: rgb(255, 0, 0);
  }
  form {
  width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}
input.form-control {
  width: 100%;
  padding: 10px;
  margin-top: 15px;
  border: 1px solid #aaa;
  border-radius: 4px;
}
.btn {
  width: 100%;
}
.success {
  color: green;
  display: block;
  margin-top: 10px;
}
.error {
  color: red;
  display: block;
  margin-top: 10px;
}
</style>