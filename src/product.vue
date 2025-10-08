<script setup>
import { ref } from 'vue';
const {products} = defineProps({
    products: Array
})
const search = ref("")
const isSuccess = ref(true);
</script>

<template>
<div>
    <h1>Danh Sách Sản Phẩm</h1>
    <span :style="{color: isSuccess ? 'green' : 'red' }">{{ search }}</span>
    <br>
    <div :class="{success: isSuccess, error: !isSuccess}">Đây là message</div>
    <input class="search-input" type="text" v-model="search" placeholder="search product ....">
    <div v-for="product in products" :key="product.id">
      <h3>{{ product.name }}</h3>
      <h3>{{ product.price }}</h3>
      <h3>{{ product.category }}</h3>
      <img :src="product.image" :alt="product.name" style="max-width:200px;"/>
      <hr>
    </div>
  </div>
</template>

<style scoped>
.search-input{
  width: 100%;
}
.message{
  color: red;
}
.success{
  color: green;
}
.error{
  color: red;
}
</style>
