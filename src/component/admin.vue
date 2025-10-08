<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'

import { useRouter } from 'vue-router'
const router = useRouter();

const posts = ref([])
const post = reactive({
  title: '',
  time: '',
  image: '',
  description: ''
})

const emit = defineEmits(['remove'])

onMounted(async() => {
  console.log(`the component is now mounted.`)
  const response = await axios.get('http://localhost:3000/posts');
  if(response.status == 200) {
    posts.value = response.data
  }
})


const handleDelete = async (id) => {
    const isConfirm = confirm(`Ban co muon xoa id = ${id} nay khong`)
    if (isConfirm) {
    //b2:
    const response = await axios.delete(`http://localhost:3000/posts/${id}`);
    if (response.status == 200) {
      //b3: load lại giao diện
      loadDuLieu()
      // posts.value = response.data
      alert('xoá thành công')
    }

  }
}
const loadDuLieu = async () => {
    console.log(`the component is now mounted.`)
    const response = await axios.get('http://localhost:3000/posts');
    if (response.status == 200) {
      posts.value = response.data
    }
}
const handleSubmit = async (e) => {
  e.preventDefault();
  if (post.title === "") {
    alert('title khong de trong')
    return;
  }
  const payload = {
    title: post.title,
    time: post.time,
    image: post.image,
    description: post.description,
    creator: 'admin',
    tags: 'news'
  }
  const response = await axios.post('http://localhost:3000/posts', payload);
  console.log(response);
  if (response.status == 201) {
    loadDuLieu()
    clearData()
    alert('đã thêm thành công')
  }
}

const clearData = () => {
  Object.assign(post, {
    title: '',
    time: '',
    image: '',
    description: ''
  })
}


</script>
<template>
  <div class="container py-4">
    <h1 class="mb-4 text-center text-primary">Trang Admin</h1>
    <div class="row justify-content-center mb-4">
      <div class="col-auto">
        <router-link to="/" class="btn btn-outline-secondary me-2 mb-2">Trang chủ</router-link>
        <router-link to="/postAdmin" class="btn btn-outline-primary me-2 mb-2">Post</router-link>
        <router-link to="/productAdmin" class="btn btn-outline-success me-2 mb-2">Product</router-link>
        <router-link to="/userAdmin" class="btn btn-outline-warning mb-2">User</router-link>
      </div>
    </div>
    <!-- Bạn có thể thêm nội dung quản trị ở đây -->
  </div>
</template>
<style scoped>

</style>