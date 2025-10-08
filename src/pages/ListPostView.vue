<script setup>
import { ref, onMounted, reactive, defineEmits } from 'vue'
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

onMounted(async () => {
  Loadulieu()
})

const handleDeleteEmit = (id) => {
  emit('remove',id)
}

const handleDelete = async (id) => {
  //b1 
  const isConfirm = confirm(`bạn có muốn xoá id = ${id} này không ?`)
  if (isConfirm) {
    //b2:
    const response = await axios.delete(`http://localhost:3000/posts/${id}`);
    if (response.status == 200) {
      //b3: load lại giao diện
      Loadulieu()
      // posts.value = response.data
      alert('xoá thành công')
    }

  }
}

const Loadulieu = async () => {
  console.log(`the component is now mounted.`)
  const response = await axios.get('http://localhost:3000/posts');
  if (response.status == 200) {
    posts.value = response.data
  }
}
const handleSubmit = async () => {
  if (post.title === "") {
    alert('title khong de trong')
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
    Loadulieu()
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

const goTo = (id) => {
  router.push(`/posts/${id}`)
}
</script>
<template>
  <main class="container py-4">
    <header class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h3 m-0">Latest Posts</h1>
     
      <form class="d-none d-sm-flex" role="search">
        <input class="form-control form-control-sm" type="search" placeholder="Search posts" />
      </form>
    </header>
    <form class="form" @submit="handleSubmit">
      <div class="mb-3">
        <label for="exampleFormControlInput1" class="form-label">title</label>
        <input v-model="post.title" type="text" class="form-control" id="exampleFormControlInput1"
          placeholder=" title post">
      </div>
      <div class="mb-3">
        <label for="exampleFormControlInput1" class="form-label">time read</label>
        <input v-model="post.time" type="number" class="form-control" id="exampleFormControlInput1"
          placeholder="time read posts">
      </div>
      <div class="mb-3">
        <label for="exampleFormControlInput1" class="form-label">image</label>
        <input v-model="post.image" type="text" class="form-control" id="exampleFormControlInput1"
          placeholder="image url">
      </div>
      <div class="mb-3">
        <label for="exampleFormControlTextarea1" class="form-label">description</label>
        <textarea v-model="post.description" class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
      </div>
      <button type="submit" class="btn btn-primary mb-5" :style="{ 'margin-right': '10px' }">add new post</button>
      <button class="btn btn-info mb-5">clear post</button>
    </form>
    <div class="list-group">

      <!-- Post item -->
      <a href="#" v-for="item in posts" :key="item.id" class="list-group-item list-group-item-action py-3">
        <div class="row g-3 align-items-start">
          <div class="col-12 col-sm-auto">
            <img :src="item.image" alt="Post 1" class="post-thumb w-100 w-sm-auto" />
          </div>
          <div class="col">
            <div class="d-flex w-100 justify-content-between">
              <RouterLink :to="`/posts/${item.id}`"><h2 class="h5 mb-1">{{ item.title }}</h2></RouterLink>
              <!-- <small class="text-muted">Sep 24, 2025</small> -->
              <!-- <i class="pi pi-times" style="color: red"></i> -->
              <button @click="handleDeleteEmit(item.id)">Remove</button>
            </div>
            <div class="mb-2">
              <small class="text-muted">by <strong>{{ item.creator }}</strong> · {{ item.time }} min read</small>
            </div>
            <p class="post-excerpt mb-2">
              {{ item.description }}
            </p>
              <button @click="goTo(item.id)">read more</button> 
            <!-- <div class="d-flex gap-2">
              <span class="badge text-bg-primary">News</span>
              <span class="badge text-bg-secondary">Tutorial</span>
            </div> -->

          </div>
        </div>
      </a>
    </div>

    <!-- Pagination -->
    <!-- <nav aria-label="Post navigation" class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item disabled"><span class="page-link">Previous</span></li>
        <li class="page-item active" aria-current="page"><span class="page-link">1</span></li>
        <li class="page-item"><a class="page-link" href="#">2</a></li>
        <li class="page-item"><a class="page-link" href="#">3</a></li>
        <li class="page-item"><a class="page-link" href="#">Next</a></li>
      </ul>
    </nav> -->
  </main>

</template>
<style scoped>
.success {
  color: green;
}

.error {
  color: red;
}

.post-excerpt {
  display: -webkit-box;
  /* -webkit-line-clamp: 2; */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-thumb {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: .5rem;
}

@media (max-width: 575.98px) {
  .post-thumb {
    width: 100%;
    height: 160px;
  }
}
</style>