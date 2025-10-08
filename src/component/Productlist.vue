<template>
  <div>
    <h2>Danh sách sản phẩm</h2>
    <div v-for="product in products" :key="product.id">
      <router-link :to="`/products/${product.id}`">{{ product.name }}</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      products: [
        { id: 1, name: 'Figure Naruto' },
        { id: 2, name: 'Figure Luffy' }
      ]
    }
  }
}
</script>
