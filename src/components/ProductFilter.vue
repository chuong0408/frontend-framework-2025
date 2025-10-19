<template>
  <div class="filter-container">
    <h2>🔍 Lọc Sản Phẩm</h2>

    <!-- Filter Panel -->
    <div class="filter-panel">
      <div class="filter-grid">
        <!-- Danh mục -->
        <div class="filter-group">
          <label>Danh mục</label>
          <select v-model="filters.categoryId">
            <option value="">Tất cả danh mục</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Giá từ -->
        <div class="filter-group">
          <label>Giá từ</label>
          <input type="number" v-model="filters.minPrice" placeholder="0" />
        </div>

        <!-- Giá đến -->
        <div class="filter-group">
          <label>Giá đến</label>
          <input type="number" v-model="filters.maxPrice" placeholder="1000000" />
        </div>

        <!-- Sắp xếp -->
        <div class="filter-group">
          <label>Sắp xếp</label>
          <select v-model="filters.sortBy">
            <option value="name">Tên A-Z</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="newest">Mới nhất</option>
          </select>
        </div>
      </div>

      <!-- Tìm kiếm -->
      <div class="search-row">
        <input
          type="text"
          v-model="filters.searchText"
          placeholder="🔍 Tìm kiếm sản phẩm..."
          class="search-input"
        />

        <label class="checkbox-label">
          <input type="checkbox" v-model="filters.inStock" />
          Chỉ hiện còn hàng
        </label>

        <button @click="resetFilters" class="btn-reset">🔄 Đặt lại</button>
      </div>

      <div class="result-count">
        Tìm thấy <strong>{{ filteredProducts.length }}</strong> sản phẩm
      </div>
    </div>

    <!-- Products Grid -->
    <div class="products-grid">
      <div v-for="product in filteredProducts" :key="product.id" class="product-card">
        <div class="product-image">
          <img
            :src="getImageUrl(product.images?.[0])"
            :alt="product.name"
            @error="handleImageError"
          />
        </div>

        <div class="product-info">
          <h3>{{ product.name }}</h3>

          <div class="product-price-row">
            <span class="price">{{ formatPrice(product.discount) }}₫</span>
            <span :class="['stock', product.quantity > 0 ? 'in-stock' : 'out-stock']">
              {{ product.quantity > 0 ? `Còn ${product.quantity}` : 'Hết hàng' }}
            </span>
          </div>

          <div class="product-category">
            {{ getCategoryName(product.categoryId) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredProducts.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <p>Không tìm thấy sản phẩm nào phù hợp</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const API_BASE_URL = 'http://localhost:3001'

const products = ref([])
const categories = ref([])

const filters = ref({
  categoryId: '',
  minPrice: '',
  maxPrice: '',
  searchText: '',
  sortBy: 'name',
  inStock: false
})

const filteredProducts = computed(() => {
  let result = [...products.value]

  // Lọc theo danh mục
  if (filters.value.categoryId) {
    result = result.filter(p => String(p.categoryId) === String(filters.value.categoryId))
  }

  // Lọc theo giá
  if (filters.value.minPrice) {
    result = result.filter(p => p.discount >= Number(filters.value.minPrice))
  }
  if (filters.value.maxPrice) {
    result = result.filter(p => p.discount <= Number(filters.value.maxPrice))
  }

  // Lọc theo tìm kiếm
  if (filters.value.searchText) {
    const search = filters.value.searchText.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(search))
  }

  // Lọc còn hàng
  if (filters.value.inStock) {
    result = result.filter(p => p.quantity > 0)
  }

  // Sắp xếp
  switch (filters.value.sortBy) {
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'price-asc':
      result.sort((a, b) => (a.discount || 0) - (b.discount || 0))
      break
    case 'price-desc':
      result.sort((a, b) => (b.discount || 0) - (a.discount || 0))
      break
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      break
  }

  return result
})

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  try {
    const [resProducts, resCategories] = await Promise.all([
      fetch(`${API_BASE_URL}/products`).then(r => r.json()),
      fetch(`${API_BASE_URL}/categories`).then(r => r.json())
    ])
    products.value = resProducts
    categories.value = resCategories
  } catch (error) {
    console.error('Lỗi tải dữ liệu:', error)
  }
}

const resetFilters = () => {
  filters.value = {
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    searchText: '',
    sortBy: 'name',
    inStock: false
  }
}

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/200'
  return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`
}

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/200?text=No+Image'
}

const getCategoryName = (id) => {
  return categories.value.find(c => String(c.id) === String(id))?.name || 'N/A'
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price || 0)
}
</script>

<style scoped>
.filter-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.filter-panel {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.filter-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

.filter-group select,
.filter-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-row {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.btn-reset {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-reset:hover {
  background: #5a6268;
}

.result-count {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
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
  margin: 0 0 8px;
  font-size: 16px;
  color: #333;
}

.product-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.price {
  color: #e53935;
  font-weight: 600;
  font-size: 18px;
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

.product-category {
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  display: inline-block;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}
</style>