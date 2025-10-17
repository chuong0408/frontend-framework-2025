<template>
  <div class="product-list-container">
    <div class="header">
      <h2>Danh sách sản phẩm</h2>
      <button v-if="isAdmin" @click="addProduct" class="btn-add">
        + Thêm sản phẩm mới
      </button>
    </div>

    <div v-if="loading" class="loading">
      <p>⏳ Đang tải dữ liệu...</p>
    </div>

    <div v-else-if="products.length === 0" class="empty-state">
      <p>📦 Chưa có sản phẩm nào</p>
      <button v-if="isAdmin" @click="addProduct" class="btn-add">
        Thêm sản phẩm đầu tiên
      </button>
    </div>

    <div v-else>
      <div class="product-grid">
        <div v-for="product in paginatedProducts" :key="product.id" class="product-card">
          <div class="product-image">
            <img :src="getImageUrl(product.images[0])" v-if="product.images && product.images.length"
              :alt="product.name" @error="handleImageError" />
            <div v-else class="no-image">📷</div>

            <span v-if="product.discount > 0" class="discount-badge">
              -{{ product.discount }}%
            </span>
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
          </div>

          <div v-if="isAdmin" class="actions admin-actions">
            <button @click="editProduct(product.id)" class="btn-edit">
               Sửa
            </button>
            <button @click="deleteProduct(product.id)" class="btn-delete">
               Xóa
            </button>
            <router-link :to="`/admin/products/detail/${product.id}`" class="btn-detail">
              Chi tiết
            </router-link>
          </div>

          <!-- Actions cho User -->
          <div v-else class="actions user-actions">
            <router-link :to="`/products/${product.id}`" class="btn-view">
              Xem chi tiết
            </router-link>
            <button @click="addToCart(product)" class="btn-add-cart" :disabled="product.quantity === 0">
              {{ ' Thêm vào giỏ'  }}
            </button>
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
import { auth } from '../store/auth'
import { cart } from '../store/cart'

const router = useRouter()
const API_BASE_URL = 'http://localhost:3001'

const products = ref([])
const categories = ref([])
const loading = ref(true)
const currentPage = ref(1)
const itemsPerPage = 6

// Check if user is admin
const isAdmin = computed(() => auth.isAdmin())

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return products.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(products.value.length / itemsPerPage)
})

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

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  try {
    loading.value = true
    const [resProducts, resCategories] = await Promise.all([
      axios.get(`${API_BASE_URL}/products`),
      axios.get(`${API_BASE_URL}/categories`)
    ])
    products.value = resProducts.data
    categories.value = resCategories.data
  } catch (err) {
    console.error('❌ Lỗi khi tải dữ liệu:', err)
    alert('Không thể tải dữ liệu. Vui lòng kiểm tra server!')
  } finally {
    loading.value = false
  }
}

const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`
}

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
}

const getCategoryName = (id) => {
  const cat = categories.value.find(c => String(c.id) === String(id))
  return cat ? cat.name : 'Không rõ'
}

// Admin functions
const deleteProduct = async (id) => {
  if (!confirm('⚠️ Bạn có chắc chắn muốn xóa sản phẩm này?')) return

  try {
    await axios.delete(`${API_BASE_URL}/products/${id}`)
    products.value = products.value.filter(p => String(p.id) !== String(id))
    if (paginatedProducts.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
    alert('✅ Đã xóa sản phẩm thành công!')
  } catch (err) {
    console.error('❌ Lỗi khi xóa:', err)
    alert('❌ Không thể xóa sản phẩm!')
  }
}

const editProduct = (id) => {
  router.push(`/admin/products/edit/${id}`)
}

const addProduct = () => {
  router.push('/admin/products/add')
}

// User functions
const addToCart = (product) => {
  if (product.quantity === 0) return

  cart.addItem(product, 1)
  alert(`✅ Đã thêm "${product.name}" vào giỏ hàng!`)
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
  position: relative;
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

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #e53935;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
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
}

.label {
  font-weight: 500;
  color: #555;
}

.actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
}

.admin-actions {
  flex-wrap: wrap;
}

.admin-actions button,
.admin-actions a {
  flex: 1;
  min-width: 80px;
}

.user-actions {
  flex-direction: column;
}

.actions button,
.actions a {
  padding: 8px 12px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
  text-align: center;
  display: inline-block;
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

.btn-detail {
  background-color: #17a2b8;
  color: white;
}

.btn-detail:hover {
  background-color: #138496;
}

.btn-view {
  background-color: #6c757d;
  color: white;
}

.btn-view:hover {
  background-color: #5a6268;
}

.btn-add-cart {
  background-color: #28a745;
  color: white;
}

.btn-add-cart:hover:not(:disabled) {
  background-color: #218838;
}

.btn-add-cart:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
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
</style>