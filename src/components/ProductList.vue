<template>
  <div class="product-list-container">
    <div class="header">
      <h2>Danh sách sản phẩm</h2>
      <button @click="addProduct" class="btn-add">+ Thêm sản phẩm mới</button>
    </div>

    <div v-if="loading" class="loading">
      <p>⏳ Đang tải dữ liệu...</p>
    </div>

    <div v-else-if="products.length === 0" class="empty-state">
      <p>📦 Chưa có sản phẩm nào</p>
      <button @click="addProduct" class="btn-add">Thêm sản phẩm đầu tiên</button>
    </div>

    <div v-else>
      <div class="product-grid">
        <div v-for="product in paginatedProducts" :key="product.id" class="product-card">
          <div class="product-image">
            <img :src="getImageUrl(product.images[0])" v-if="product.images && product.images.length"
              :alt="product.name" @error="handleImageError" />
            <div v-else class="no-image">📷</div>
          </div>

          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="category">
              <span class="label">Danh mục:</span>
              {{ getCategoryName(product.categoryId) }}
            </p>
            <p class="quantity">
              <span class="label">Số lượng:</span>
              {{ product.quantity || 0 }}
            </p>
            <p class="discount" v-if="product.discount > 0">
              <span class="label">Giảm giá:</span>
              {{ product.discount }}%
            </p>
          </div>

          <div class="actions">
            <button @click="editProduct(product.id)" class="btn-edit">
              ✏️ Sửa
            </button>
            <button @click="deleteProduct(product.id)" class="btn-delete">
              🗑️ Xóa
            </button>
            <router-link :to="`/admin/products/detail/${product.id}`" class="btn-detail">
              🔍 Xem chi tiết
            </router-link>

          </div>
        </div>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button @click="prevPage" :disabled="currentPage === 1">
          ← Trang trước
        </button>
        <span class="page-info">Trang {{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">
          Trang sau →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// Base URL cho API
const API_BASE_URL = 'http://localhost:3001'

const products = ref([])
const categories = ref([])
const loading = ref(true)

const currentPage = ref(1)
const itemsPerPage = 6

// Computed properties
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return products.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(products.value.length / itemsPerPage)
})

// Pagination methods
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Load data khi component mount
onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  try {
    loading.value = true
    console.log('📂 Đang tải dữ liệu từ:', API_BASE_URL)

    const [resProducts, resCategories] = await Promise.all([
      axios.get(`${API_BASE_URL}/products`),
      axios.get(`${API_BASE_URL}/categories`)
    ])

    products.value = resProducts.data
    categories.value = resCategories.data

    console.log('✅ Đã tải', products.value.length, 'sản phẩm')
    console.log('✅ Đã tải', categories.value.length, 'danh mục')
  } catch (err) {
    console.error('❌ Lỗi khi tải dữ liệu:', err)
    alert('Không thể tải dữ liệu. Vui lòng kiểm tra:\n1. Server đã chạy chưa?\n2. URL có đúng không?')
  } finally {
    loading.value = false
  }
}

// Helper function để lấy URL ảnh
const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`
}

// Handle lỗi khi ảnh không load được
const handleImageError = (e) => {
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect fill="%23ddd" width="120" height="120"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="40"%3E📷%3C/text%3E%3C/svg%3E'
}

// Lấy tên danh mục
const getCategoryName = (id) => {
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.name : 'Không rõ'
}

// Xóa sản phẩm
const deleteProduct = async (id) => {
  if (!confirm('⚠️ Bạn có chắc chắn muốn xóa sản phẩm này?\nThao tác này không thể hoàn tác!')) return

  try {
    console.log('🗑️ Đang xóa sản phẩm:', id)
    await axios.delete(`${API_BASE_URL}/products/${id}`)

    // Xóa khỏi danh sách local
    products.value = products.value.filter(p => String(p.id) !== String(id))

    // Điều chỉnh trang hiện tại nếu cần
    if (paginatedProducts.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }

    console.log('✅ Đã xóa sản phẩm thành công')
    alert('✅ Đã xóa sản phẩm thành công!')
  } catch (err) {
    console.error('❌ Lỗi khi xóa sản phẩm:', err)
    alert('❌ Không thể xóa sản phẩm. Vui lòng thử lại!')
  }
}

// Chuyển đến trang sửa sản phẩm
const editProduct = (id) => {
  console.log('✏️ Chuyển đến trang sửa sản phẩm:', id)
  router.push(`/admin/products/edit/${id}`)
}

// Chuyển đến trang thêm sản phẩm
const addProduct = () => {
  console.log('➕ Chuyển đến trang thêm sản phẩm mới')
  router.push('/admin/products/add')
}
</script>

<style scoped>
.product-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 16px;
}

.header h2 {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.btn-add {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-add:hover {
  background-color: #218838;
}

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state p {
  font-size: 18px;
  margin-bottom: 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

@media (max-width: 992px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}

.product-card {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 200px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: 48px;
  color: #ccc;
}

.product-info {
  padding: 16px;
  flex-grow: 1;
}

.product-info h3 {
  margin: 0 0 12px;
  font-size: 18px;
  color: #333;
  font-weight: 600;
  line-height: 1.4;
}

.product-info p {
  margin: 6px 0;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.label {
  font-weight: 500;
  color: #555;
}

.discount {
  color: #dc3545;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
}

.actions button {
  flex: 1;
  padding: 8px 12px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-edit {
  background-color: #007bff;
  color: white;
}

.btn-edit:hover {
  background-color: #0056b3;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-delete:hover {
  background-color: #c82333;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding: 20px 0;
}

.pagination button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.pagination button:hover:not(:disabled) {
  background-color: #0056b3;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-info {
  font-weight: 600;
  color: #333;
  font-size: 15px;
}
.btn-detail {
  background-color: #17a2b8;
  color: white;
  text-align: center;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}

.btn-detail:hover {
  background-color: #138496;
}

</style>