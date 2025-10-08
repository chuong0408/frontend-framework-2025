<script setup>
import { reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
const route = useRoute()
const router = useRouter()
const id = route.params.id
const post = reactive({})

onMounted(()=> {
    Loadulieu()
})

const Loadulieu = async () => {
    if (id) {
        const response = await axios.get(`http://localhost:3000/posts/${id}`);
        if (response.status == 200) {
            Object.assign(post, response.data)
        }
    }

}
const goBack = () => {
    router.back()
}
</script>
<template>
    <div class="row g-3 align-items-start">
        <div class="col-12 col-sm-auto">
            <img :src="post.image" alt="Post 1" class="post-thumb w-100 w-sm-auto" />
        </div>
        <div class="col">
            <div class="d-flex w-100 justify-content-between">
                <RouterLink :to="`/posts/${post.id}`">
                    <h2 class="h5 mb-1">{{ post.title }}</h2>
                </RouterLink>
                <!-- <small class="text-muted">Sep 24, 2025</small> -->
                <!-- <i class="pi pi-times" style="color: red"></i> -->
                <button @click="handleDeleteEmit(post.id)">Remove</button>
            </div>
            <div class="mb-2">
                <small class="text-muted">by <strong>{{ post.creator }}</strong> · {{ post.time }} min read</small>
            </div>
            <p class="post-excerpt mb-2">
                {{ post.description }}
            </p>
            <button @click="goBack()">List Post</button>
            <!-- <div class="d-flex gap-2">
              <span class="badge text-bg-primary">News</span>
              <span class="badge text-bg-secondary">Tutorial</span>
            </div> -->

        </div>
    </div>
</template>