<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const id = route.params.id
const product = ref({})

const Loadulieu = async () => {
  if (id) {
    const response = await axios.get(`http://localhost:3000/products/${id}`)
    product.value = response.data
  }
}

onMounted(() => {
  Loadulieu()
})
</script>
<template>
  <div class="container mt-4">
    <div class="row g-4 align-items-start">
      <div class="col-12 col-md-4 text-center">
        <img
          :src="product.image || 'https://via.placeholder.com/250'"
          alt="product image"
          class="img-fluid rounded shadow-sm mb-3"
          style="max-width: 250px;"
        />
      </div>
      <div class="col-12 col-md-8">
        <h2 class="mb-3">{{ product.title}}</h2>
        <div class="mb-2">
          <span class="badge bg-primary me-2">
            {{ product.category}}
          </span>
          <span class="badge bg-success">
            {{ product.price}}
          </span>
        </div>
        <p class="lead mt-3">{{ product.description}}</p>
      </div>
    </div>
    <router-link :to="`/products`" class="btn btn-outline-secondary mt-4">
      Quay Lại
    </router-link>
  </div>
</template>
<style scoped>
</style>