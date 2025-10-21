<template>
  <div class="favorites-container">
    <h2> Sản phẩm yêu thích</h2>

    <div v-if="loading" class="loading">
      <p>⏳ Đang tải...</p>
    </div>

    <div v-else-if="favoriteProducts.length === 0" class="empty-state">
      <div class="empty-icon">💔</div>
      <p>Chưa có sản phẩm yêu thích nào</p>
      <router-link to="/products" class="btn-shop">
        Khám phá sản phẩm
      </router-link>
    </div>

    <div v-else class="products-grid">
      <div 
        v-for="product in favoriteProducts" 
        :key="product.id" 
        class="product-card"
      >
        <button 
          @click="toggleFavorite(product.id)" 
          class="btn-favorite active"
        >
          ❤️
        </button>

        <router-link :to="`/products/${product.id}`" class="product-link">
          <div class="product-image">
            <img 
              :src="getImageUrl(product.images?.[0])" 
              :alt="product.name"
              @error="handleImageError"
            />
          </div>

          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="price">{{ formatPrice(product.discount) }}₫</p>
            <p :class="['stock', product.quantity > 0 ? 'in-stock' : 'out-stock']">
              {{ product.quantity > 0 ? `Còn ${product.quantity}` : 'Hết hàng' }}
            </p>
          </div>
        </router-link>

        <button 
          @click="addToCart(product)" 
          class="btn-add-cart"
          :disabled="product.quantity === 0"
        >
          {{ product.quantity > 0 ? '🛒 Thêm vào giỏ' : 'Hết hàng' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { favorites } from '../store/favorites'
import { cart } from '../store/cart'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001'
const products = ref([])
const loading = ref(true)

const favoriteProducts = computed(() => {
  return products.value.filter(p => favorites.isFavorite(p.id))
})

onMounted(async () => {
  await loadProducts()
})

const loadProducts = async () => {
  try {
    loading.value = true
    const response = await axios.get(`${API_BASE_URL}/products`)
    products.value = response.data
  } catch (error) {
    console.error('Lỗi tải sản phẩm:', error)
  } finally {
    loading.value = false
  }
}

const toggleFavorite = (productId) => {
  favorites.toggle(productId)
  if (!favorites.isFavorite(productId)) {
    alert('Đã xóa khỏi danh sách yêu thích')
  }
}

const addToCart = (product) => {
  cart.addItem(product, 1)
  alert(`Đã thêm "${product.name}" vào giỏ hàng!`)
}

const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`
}

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/200?text=No+Image'
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price || 0)
}
</script>

<style scoped>
.favorites-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.btn-shop {
  display: inline-block;
  padding: 12px 30px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

.product-card {
  position: relative;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.btn-favorite {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}

.btn-favorite:hover {
  transform: scale(1.1);
}

.btn-favorite.active {
  animation: heartbeat 0.3s;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.product-link {
  text-decoration: none;
  color: inherit;
}

.product-image {
  width: 100%;
  height: 200px;
  background: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #333;
}

.price {
  color: #e53935;
  font-weight: 600;
  font-size: 18px;
  margin: 8px 0;
}

.stock {
  font-size: 13px;
  font-weight: 500;
}

.in-stock {
  color: #28a745;
}

.out-stock {
  color: #dc3545;
}

.btn-add-cart {
  width: 100%;
  padding: 12px;
  background: #28a745;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-add-cart:hover:not(:disabled) {
  background: #218838;
}

.btn-add-cart:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>