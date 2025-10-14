<template>
  <div class="container">
    <h2>Chi tiết sản phẩm</h2>

    <div v-if="product" class="product-detail">
      <div class="product-images" v-if="product.images?.length">
        <div v-for="(img, index) in product.images" :key="index" class="image-wrapper">
          <img :src="getImageUrl(img)" :alt="`${product.name} - ${index + 1}`" @error="handleImageError" />
        </div>
      </div>
      <div v-else class="no-image">📷 Không có ảnh sản phẩm</div>

      <div class="product-info">
        <p><strong>Tên sản phẩm:</strong> {{ product.name }}</p>
        <p class="price"><strong>Số lượng:</strong> {{ product.quantity }}₫</p>
        <p><strong>Giảm giá:</strong> {{ product.discount || 'Không rõ' }}</p>
        <router-link to="/admin/products" class="back-button">← Quay lại danh sách</router-link>
      </div>
    </div>

    <div v-else>
      <p> Không tìm thấy sản phẩm hoặc có lỗi khi tải dữ liệu.</p>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const product = ref(null)
const loading = ref(true)
const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  return imagePath.startsWith('http') ? imagePath : `http://localhost:3001${imagePath}`
}

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
}

onMounted(async () => {
  const id = route.params.id

  try {
    const response = await axios.get(`http://localhost:3001/products/${id}`)
    product.value = response.data
  } catch (error) {
    console.error('❌ Lỗi khi tải chi tiết sản phẩm:', error)
    product.value = null
  } finally {
    loading.value = false
  }
})
</script>
<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

h2 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.product-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  align-items: flex-start;
}

.product-image {
  flex: 1 1 300px;
  max-width: 400px;
  height: auto;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-image img {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
}

.product-info {
  flex: 1 1 400px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-info p {
  font-size: 18px;
  color: #555;
  line-height: 1.6;
}

.product-info strong {
  color: #222;
  font-weight: 600;
}

.price {
  font-size: 24px;
  color: #e53935;
  font-weight: bold;
}

.description {
  font-size: 16px;
  color: #666;
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  line-height: 1.6;
}

.back-button {
  margin-top: 30px;
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #0056b3;
}
.product-images {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.image-wrapper {
  flex: 1 1 200px;
  max-width: 300px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.image-wrapper img {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
  border-radius: 10px;
}

</style>
