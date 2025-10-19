<template>
  <div class="top-products-container">
    <div class="header">
      <h2>🔥 Top 5 Sản Phẩm Bán Chạy</h2>
      <button @click="refreshData" class="btn-refresh" :disabled="loading">
        {{ loading ? '⏳' : '🔄' }} Làm mới
      </button>
    </div>

    <div v-if="loading" class="loading">
      <p>Đang tải dữ liệu...</p>
    </div>

    <div v-else-if="topProducts.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <p>Chưa có sản phẩm nào được bán</p>
    </div>

    <div v-else class="products-list">
      <div 
        v-for="(product, index) in topProducts" 
        :key="product.id" 
        class="product-card"
        @click="viewProduct(product.id)"
      >
        <!-- Rank Badge -->
        <div class="rank-badge" :class="`rank-${index + 1}`">
          {{ index + 1 }}
        </div>

        <!-- Product Image -->
        <div class="product-image">
          <img 
            :src="getImageUrl(product.images?.[0])" 
            :alt="product.name"
            @error="handleImageError"
          />
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          
          <div class="product-stats">
            <div class="stat-item">
              <span class="label">Đã bán:</span>
              <strong class="value">{{ product.totalSold }} sản phẩm</strong>
            </div>
            
            <div class="stat-item">
              <span class="label">Doanh thu:</span>
              <strong class="revenue">{{ formatPrice(product.totalRevenue) }}₫</strong>
            </div>
            
            <div class="stat-item">
              <span class="label">Tồn kho:</span>
              <span :class="['stock', product.quantity > 0 ? 'in-stock' : 'out-stock']">
                {{ product.quantity > 0 ? `Còn ${product.quantity}` : 'Hết hàng' }}
              </span>
            </div>
          </div>

          <!-- Category -->
          <div class="product-category">
            <span class="category-badge">
              {{ getCategoryName(product.categoryId) }}
            </span>
          </div>
        </div>

        <!-- Arrow Icon -->
        <div class="arrow-icon">→</div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div v-if="topProducts.length > 0" class="summary-stats">
      <div class="summary-item">
        <span>Tổng sản phẩm đã bán:</span>
        <strong>{{ totalSold }} sản phẩm</strong>
      </div>
      <div class="summary-item">
        <span>Tổng doanh thu từ Top 5:</span>
        <strong class="total-revenue">{{ formatPrice(totalRevenue) }}₫</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE_URL = 'http://localhost:3001'

const orders = ref([])
const products = ref([])
const categories = ref([])
const loading = ref(true)

// Computed: Top Products
const topProducts = computed(() => {
  // Đếm số lượng bán từ orders
  const productSales = {}
  
  orders.value.forEach(order => {
    if (order.status === 'delivered' || order.status === 'confirmed') {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            quantity: 0,
            revenue: 0
          }
        }
        productSales[item.productId].quantity += item.quantity
        productSales[item.productId].revenue += item.total
      })
    }
  })
  
  // Sắp xếp và lấy top 5
  return products.value
    .map(p => ({
      ...p,
      totalSold: productSales[p.id]?.quantity || 0,
      totalRevenue: productSales[p.id]?.revenue || 0
    }))
    .filter(p => p.totalSold > 0)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5)
})

// Computed: Total Stats
const totalSold = computed(() => {
  return topProducts.value.reduce((sum, p) => sum + p.totalSold, 0)
})

const totalRevenue = computed(() => {
  return topProducts.value.reduce((sum, p) => sum + p.totalRevenue, 0)
})

// Methods
const loadData = async () => {
  try {
    loading.value = true
    const [resOrders, resProducts, resCategories] = await Promise.all([
      fetch(`${API_BASE_URL}/orders`).then(r => r.json()),
      fetch(`${API_BASE_URL}/products`).then(r => r.json()),
      fetch(`${API_BASE_URL}/categories`).then(r => r.json())
    ])
    
    orders.value = resOrders
    products.value = resProducts
    categories.value = resCategories
  } catch (error) {
    console.error('Lỗi tải dữ liệu:', error)
    alert('Không thể tải dữ liệu. Vui lòng thử lại!')
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  await loadData()
}

const viewProduct = (productId) => {
  router.push(`/admin/products/detail/${productId}`)
}

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/80x80?text=No+Image'
  return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`
}

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/80x80?text=No+Image'
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => String(c.id) === String(categoryId))
  return category ? category.name : 'Không rõ'
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price || 0)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.top-products-container {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
  font-weight: 700;
}

.btn-refresh {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: #0056b3;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.product-card {
  display: grid;
  grid-template-columns: 50px 80px 1fr 30px;
  gap: 15px;
  align-items: center;
  padding: 15px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border-color: #007bff;
}

/* Rank Badge */
.rank-badge {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #333;
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #d4af37);
  color: white;
}

.rank-4,
.rank-5 {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

/* Product Image */
.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Info */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-name {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  line-height: 1.3;
}

.product-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.stat-item .label {
  color: #666;
}

.stat-item .value {
  color: #333;
  font-weight: 600;
}

.stat-item .revenue {
  color: #28a745;
  font-weight: 700;
}

.stock {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.in-stock {
  background: #d4edda;
  color: #155724;
}

.out-stock {
  background: #f8d7da;
  color: #721c24;
}

.product-category {
  margin-top: 5px;
}

.category-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 12px;
  color: #495057;
  font-weight: 500;
}

/* Arrow Icon */
.arrow-icon {
  font-size: 24px;
  color: #007bff;
  font-weight: 700;
}

/* Summary Stats */
.summary-stats {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 10px;
  color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: center;
}

.summary-item span {
  font-size: 14px;
  opacity: 0.9;
}

.summary-item strong {
  font-size: 24px;
  font-weight: 700;
}

.total-revenue {
  color: #ffd700;
}

/* Responsive */
@media (max-width: 768px) {
  .product-card {
    grid-template-columns: 40px 60px 1fr;
    gap: 10px;
  }

  .rank-badge {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .product-image {
    width: 60px;
    height: 60px;
  }

  .arrow-icon {
    display: none;
  }

  .product-name {
    font-size: 14px;
  }

  .stat-item {
    font-size: 12px;
  }

  .summary-stats {
    flex-direction: column;
    gap: 15px;
  }
}
</style>