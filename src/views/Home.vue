<script setup>
import { auth } from '../store/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>
<template>
  <div>Home</div>
  <button type="button" class="btn btn-logout" @click="logout">
    Đăng xuất
  </button>
</template>
