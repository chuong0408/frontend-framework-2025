<script setup>
import ProductList from '../components/ProductList.vue'
import ProductForm from '../components/ProductForm.vue'
import ImageUploader from '../components/ImageUploader.vue'
</script>

<template>
  <div class="admin-container">
    <h2>Quản lý sản phẩm</h2>
    <ProductForm />
    <ProductList/>
  </div>
</template>

<style scoped>
.admin-container {
  padding: 20px;
}
</style>
