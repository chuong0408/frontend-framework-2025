<template>
  <div class="my-orders-container">
    <!-- Header: Tiêu đề + Bộ lọc -->
    <div class="header">
      <h2>📦 Đơn hàng của tôi</h2>
      
      <select v-model="filterStatus" class="filter-select">
        <option value="">Tất cả trạng thái</option>
        <option value="pending">Chờ xác nhận</option>
        <option value="confirmed">Đã xác nhận</option>
        <option value="shipping">Đang giao hàng</option>
        <option value="delivered">Đã giao hàng</option>
        <option value="cancelled">Đã hủy</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <p>⏳ Đang tải đơn hàng...</p>
    </div>

    <!-- Trống - Chưa có đơn hàng -->
    <div v-else-if="filteredOrders.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>Bạn chưa có đơn hàng nào</p>
      <router-link to="/products" class="btn-shop">
        Mua sắm ngay
      </router-link>
    </div>

    <!-- Danh sách đơn hàng -->
    <div v-else class="orders-list">
      <div 
        v-for="order in filteredOrders" 
        :key="order.id" 
        class="order-card"
      >
        <!-- Header của mỗi đơn hàng -->
        <div class="order-header">
          <div>
            <strong class="order-code">#{{ order.orderCode }}</strong>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </div>
          <span 
            class="status-badge" 
            :style="{ backgroundColor: getStatusColor(order.status) }"
          >
            {{ getStatusText(order.status) }}
          </span>
        </div>

        <!-- Danh sách sản phẩm trong đơn -->
        <div class="order-items">
          <div 
            v-for="item in order.items.slice(0, 2)" 
            :key="item.productId" 
            class="order-item"
          >
            <img 
              :src="getImageUrl(item.image)" 
              :alt="item.name"
              class="item-image"
              @error="handleImageError"
            />
            <div class="item-info">
              <strong>{{ item.name }}</strong>
              <span>x{{ item.quantity }}</span>
            </div>
            <div class="item-price">
              {{ formatPrice(item.total) }}₫
            </div>
          </div>

          <!-- Nếu có nhiều hơn 2 sản phẩm -->
          <div v-if="order.items.length > 2" class="more-items">
            +{{ order.items.length - 2 }} sản phẩm khác
          </div>
        </div>

        <!-- Footer: Tổng tiền + Nút actions -->
        <div class="order-footer">
          <div class="order-total">
            <span>Tổng cộng:</span>
            <strong class="total-amount">
              {{ formatPrice(order.payment.total) }}₫
            </strong>
          </div>
          
          <div class="order-actions">
            <button 
              @click="viewOrderDetail(order)" 
              class="btn-detail"
            >
              Chi tiết
            </button>
            
            <!-- 🆕 Nút mua lại -->
            <button 
              v-if="order.status === 'delivered'"
              @click="reorder(order)" 
              class="btn-reorder"
              :disabled="reordering"
            >
              {{ reordering ? '⏳' : '🔄' }} Mua lại
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Chi Tiết Đơn Hàng -->
    <div 
      v-if="showDetailModal && selectedOrder" 
      class="modal-overlay" 
      @click="closeModal"
    >
      <div class="modal-content" @click.stop>
        <!-- Header Modal -->
        <div class="modal-header">
          <h3>Chi tiết đơn hàng</h3>
          <button @click="closeModal" class="btn-close">×</button>
        </div>

        <!-- Body Modal -->
        <div class="modal-body">
          <!-- Thông tin đơn hàng -->
          <div class="detail-section">
            <h4>📋 Thông tin đơn hàng</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Mã đơn hàng:</label>
                <span>{{ selectedOrder.orderCode }}</span>
              </div>
              <div class="detail-item">
                <label>Ngày đặt:</label>
                <span>{{ formatDate(selectedOrder.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <label>Trạng thái:</label>
                <span 
                  class="status-badge" 
                  :style="{ backgroundColor: getStatusColor(selectedOrder.status) }"
                >
                  {{ getStatusText(selectedOrder.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Thông tin người nhận -->
          <div class="detail-section">
            <h4>👤 Thông tin người nhận</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Họ tên:</label>
                <span>{{ selectedOrder.customer.fullName }}</span>
              </div>
              <div class="detail-item">
                <label>Số điện thoại:</label>
                <span>{{ selectedOrder.customer.phone }}</span>
              </div>
              <div class="detail-item full-width">
                <label>Địa chỉ:</label>
                <span>{{ selectedOrder.customer.address }}</span>
              </div>
            </div>
          </div>

          <!-- Sản phẩm -->
          <div class="detail-section">
            <h4>📦 Sản phẩm</h4>
            <div class="products-list">
              <div 
                v-for="item in selectedOrder.items" 
                :key="item.productId" 
                class="product-item"
              >
                <img 
                  :src="getImageUrl(item.image)" 
                  :alt="item.name"
                  class="product-image"
                  @error="handleImageError"
                />
                <div class="product-info">
                  <strong>{{ item.name }}</strong>
                  <p>Số lượng: {{ item.quantity }}</p>
                  <p>Đơn giá: {{ formatPrice(item.price) }}₫</p>
                </div>
                <div class="product-total">
                  <strong>{{ formatPrice(item.total) }}₫</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Thanh toán -->
          <div class="detail-section">
            <h4>💳 Thanh toán</h4>
            <div class="payment-summary">
              <div class="payment-row">
                <span>Tạm tính:</span>
                <span>{{ formatPrice(selectedOrder.payment.subtotal) }}₫</span>
              </div>
              <div class="payment-row">
                <span>Phí vận chuyển:</span>
                <span>{{ formatPrice(selectedOrder.payment.shipping) }}₫</span>
              </div>
              <div class="payment-row">
                <span>Giảm giá:</span>
                <span>-{{ formatPrice(selectedOrder.payment.discount) }}₫</span>
              </div>
              <div class="payment-row total">
                <strong>Tổng cộng:</strong>
                <strong class="total-amount">
                  {{ formatPrice(selectedOrder.payment.total) }}₫
                </strong>
              </div>
            </div>
          </div>

          <!-- Ghi chú (nếu có) -->
          <div v-if="selectedOrder.note" class="detail-section">
            <h4>📝 Ghi chú</h4>
            <p class="note-text">{{ selectedOrder.note }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../store/auth'
import { cart } from '../store/cart'
import axios from 'axios'

const router = useRouter()
const API_BASE_URL = 'http://localhost:3001'

// State
const orders = ref([])
const loading = ref(true)
const reordering = ref(false)
const filterStatus = ref('')
const selectedOrder = ref(null)
const showDetailModal = ref(false)

// Computed
const filteredOrders = computed(() => {
  if (!filterStatus.value) return orders.value
  return orders.value.filter(order => order.status === filterStatus.value)
})

// Methods
const loadOrders = async () => {
  try {
    loading.value = true
    const userId = auth.user?.id
    
    // Lấy tất cả đơn hàng
    const response = await axios.get(`${API_BASE_URL}/orders?_sort=createdAt&_order=desc`)
    
    // Lọc đơn hàng theo email của user hiện tại
    const userEmail = auth.user?.email
    orders.value = response.data.filter(order => 
      order.customer.email === userEmail
    )
  } catch (error) {
    console.error('❌ Lỗi tải đơn hàng:', error)
    alert('Không thể tải danh sách đơn hàng')
  } finally {
    loading.value = false
  }
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy'
  }
  return statusMap[status] || status
}

const getStatusColor = (status) => {
  const colorMap = {
    pending: '#ffc107',
    confirmed: '#17a2b8',
    shipping: '#007bff',
    delivered: '#28a745',
    cancelled: '#dc3545'
  }
  return colorMap[status] || '#6c757d'
}

const viewOrderDetail = (order) => {
  selectedOrder.value = order
  showDetailModal.value = true
}

const closeModal = () => {
  showDetailModal.value = false
  selectedOrder.value = null
}

// 🆕 Hàm load sản phẩm
const loadProduct = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}`)
    return response.data
  } catch (error) {
    console.error('Lỗi load sản phẩm:', error)
    return null
  }
}

// 🆕 Hàm mua lại đơn hàng
const reorder = async (order) => {
  if (!confirm('🔄 Bạn muốn mua lại tất cả sản phẩm trong đơn hàng này?')) return
  
  try {
    reordering.value = true
    let addedCount = 0
    let outOfStockProducts = []
    
    // Kiểm tra và thêm từng sản phẩm vào giỏ
    for (const item of order.items) {
      const product = await loadProduct(item.productId)
      
      if (!product) {
        console.warn(`Sản phẩm ${item.name} không tồn tại`)
        outOfStockProducts.push(`${item.name} (không còn bán)`)
        continue
      }
      
      if (product.quantity === 0) {
        outOfStockProducts.push(`${item.name} (hết hàng)`)
        continue
      }
      
      // Kiểm tra số lượng còn đủ không
      const quantityToAdd = Math.min(item.quantity, product.quantity)
      
      if (quantityToAdd < item.quantity) {
        outOfStockProducts.push(`${item.name} (chỉ còn ${product.quantity})`)
      }
      
      cart.addItem(product, quantityToAdd)
      addedCount++
    }
    
    // Thông báo kết quả
    let message = `✅ Đã thêm ${addedCount} sản phẩm vào giỏ hàng!`
    
    if (outOfStockProducts.length > 0) {
      message += `\n\n⚠️ Một số sản phẩm không thể thêm:\n• ${outOfStockProducts.join('\n• ')}`
    }
    
    alert(message)
    
    // Chuyển đến giỏ hàng
    router.push('/cart')
    
  } catch (error) {
    console.error('❌ Lỗi mua lại đơn hàng:', error)
    alert('Có lỗi xảy ra. Vui lòng thử lại!')
  } finally {
    reordering.value = false
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price || 0)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`
}

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/80x80?text=No+Image'
}

onMounted(() => {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }
  loadOrders()
})
</script>

<style scoped>
.my-orders-container {
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

.filter-select {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background-color: white;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 18px;
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
  transition: background-color 0.3s;
}

.btn-shop:hover {
  background-color: #0056b3;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.order-code {
  font-size: 18px;
  color: #333;
  margin-right: 15px;
}

.order-date {
  color: #666;
  font-size: 14px;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 12px;
  color: white;
  font-size: 13px;
  font-weight: 600;
}

.order-items {
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  background-color: #f5f5f5;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.item-info strong {
  color: #333;
  font-size: 15px;
}

.item-info span {
  color: #666;
  font-size: 13px;
}

.item-price {
  font-weight: 600;
  color: #e53935;
  font-size: 15px;
}

.more-items {
  text-align: center;
  color: #666;
  font-size: 14px;
  font-style: italic;
  margin-top: 10px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.order-total {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-total span {
  color: #666;
  font-size: 14px;
}

.total-amount {
  color: #e53935;
  font-size: 20px;
  font-weight: 700;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.btn-detail,
.btn-reorder {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-detail {
  background: #007bff;
  color: white;
}

.btn-detail:hover {
  background-color: #0056b3;
}

.btn-reorder {
  background: #28a745;
  color: white;
}

.btn-reorder:hover:not(:disabled) {
  background-color: #218838;
}

.btn-reorder:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.detail-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h4 {
  margin: 0 0 15px;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: #555;
  font-size: 13px;
}

.detail-item span {
  color: #333;
  font-size: 14px;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-item {
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  background-color: white;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.product-info strong {
  display: block;
  color: #333;
  margin-bottom: 5px;
  font-size: 14px;
}

.product-info p {
  margin: 3px 0;
  color: #666;
  font-size: 13px;
}

.product-total {
  font-size: 15px;
  color: #e53935;
  font-weight: 600;
}

.payment-summary {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #555;
  font-size: 14px;
}

.payment-row.total {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #dee2e6;
  font-size: 16px;
}

.payment-row.total .total-amount {
  font-size: 18px;
}

.note-text {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  color: #555;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-select {
    width: 100%;
  }

  .order-footer {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .order-actions {
    width: 100%;
  }

  .btn-detail,
  .btn-reorder {
    flex: 1;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .product-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .modal-content {
    max-width: 95%;
  }
}
</style>