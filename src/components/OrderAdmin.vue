<template>
  <div class="order-admin-container">
    <div class="header">
      <h2> Quản lý đơn hàng</h2>
      <div class="filter-group">
        <select v-model="filterStatus" @change="filterOrders" class="filter-select">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang giao hàng</option>
          <option value="delivered">Đã giao hàng</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <p> Đang tải dữ liệu...</p>
    </div>

    <div v-else-if="filteredOrders.length === 0" class="empty-state">
      <p> Không có đơn hàng nào</p>
    </div>

    <div v-else class="table-container">
      <table class="order-table">
        <thead>
          <tr>
            <th>Mã đơn hàng</th>
            <th>Khách hàng</th>
            <th>Sản phẩm</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Ngày đặt</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td>
              <strong>{{ order.orderCode }}</strong>
            </td>
            <td>
              <div class="customer-info">
                <strong>{{ order.customer.fullName }}</strong>
                <small>{{ order.customer.phone }}</small>
                <small>{{ order.customer.email }}</small>
              </div>
            </td>
            <td>
              <div class="items-info">
                <div v-for="item in order.items" :key="item.productId" class="item-row">
                  <span>{{ item.name }} x{{ item.quantity }}</span>
                </div>
              </div>
            </td>
            <td>
              <strong class="total-price">{{ formatPrice(order.payment.total) }}₫</strong>
              <small class="payment-method">
                {{ getPaymentMethodText(order.payment.method) }}
              </small>
            </td>
            <td>
              <span :class="['status-badge', `status-${order.status}`]">
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td>
              <small>{{ formatDate(order.createdAt) }}</small>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="viewOrder(order)" class="btn-view" title="Xem chi tiết">
                  Xem chi tiết
                </button>
                <button @click="openStatusModal(order)" class="btn-edit" title="Cập nhật trạng thái">
                  Đổi trạng thái
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showStatusModal" class="modal-overlay" @click="closeStatusModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Cập nhật trạng thái đơn hàng</h3>
          <button @click="closeStatusModal" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <div class="order-info">
            <p><strong>Mã đơn hàng:</strong> {{ selectedOrder?.orderCode }}</p>
            <p><strong>Khách hàng:</strong> {{ selectedOrder?.customer.fullName }}</p>
            <p><strong>Trạng thái hiện tại:</strong> 
              <span :class="['status-badge', `status-${selectedOrder?.status}`]">
                {{ getStatusText(selectedOrder?.status) }}
              </span>
            </p>
          </div>

          <div class="form-group">
            <label>Chọn trạng thái mới:</label>
            <select v-model="newStatus" class="status-select">
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="shipping">Đang giao hàng</option>
              <option value="delivered">Đã giao hàng</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <p v-if="message" :class="['message', messageType]">{{ message }}</p>

          <div class="modal-actions">
            <button @click="updateStatus" class="btn-save" :disabled="updating">
              {{ updating ? 'Đang cập nhật...' : 'Cập nhật' }}
            </button>
            <button @click="closeStatusModal" class="btn-cancel">Hủy</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h3>Chi tiết đơn hàng</h3>
          <button @click="closeDetailModal" class="btn-close">×</button>
        </div>

        <div class="modal-body" v-if="selectedOrder">
          <div class="detail-section">
            <h4> Thông tin đơn hàng</h4>
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
                <span :class="['status-badge', `status-${selectedOrder.status}`]">
                  {{ getStatusText(selectedOrder.status) }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4> Thông tin khách hàng</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Họ tên:</label>
                <span>{{ selectedOrder.customer.fullName }}</span>
              </div>
              <div class="detail-item">
                <label>Số điện thoại:</label>
                <span>{{ selectedOrder.customer.phone }}</span>
              </div>
              <div class="detail-item">
                <label>Email:</label>
                <span>{{ selectedOrder.customer.email }}</span>
              </div>
              <div class="detail-item full-width">
                <label>Địa chỉ:</label>
                <span>{{ selectedOrder.customer.address }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4> Sản phẩm</h4>
            <div class="products-list">
              <div v-for="item in selectedOrder.items" :key="item.productId" class="product-item">
                <div class="product-image">
                  <img :src="getImageUrl(item.image)" :alt="item.name" @error="handleImageError" />
                </div>
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

          <div class="detail-section">
            <h4> Thanh toán</h4>
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
                <strong class="total-amount">{{ formatPrice(selectedOrder.payment.total) }}₫</strong>
              </div>
              <div class="payment-method-info">
                <span class="badge">{{ getPaymentMethodText(selectedOrder.payment.method) }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedOrder.note" class="detail-section">
            <h4> Ghi chú</h4>
            <p class="note-text">{{ selectedOrder.note }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001'

const orders = ref([])
const loading = ref(false)
const filterStatus = ref('')
const showStatusModal = ref(false)
const showDetailModal = ref(false)
const selectedOrder = ref(null)
const newStatus = ref('')
const message = ref('')
const messageType = ref('')
const updating = ref(false)

const filteredOrders = computed(() => {
  if (!filterStatus.value) {
    return orders.value
  }
  return orders.value.filter(order => order.status === filterStatus.value)
})

onMounted(async () => {
  await loadOrders()
})

const loadOrders = async () => {
  try {
    loading.value = true
    const response = await axios.get(`${API_BASE_URL}/orders?_sort=createdAt&_order=desc`)
    orders.value = response.data
  } catch (error) {
    console.error(' Lỗi tải đơn hàng:', error)
    alert('Không thể tải danh sách đơn hàng')
  } finally {
    loading.value = false
  }
}

const filterOrders = () => {
  // Trigger computed property update
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

const getPaymentMethodText = (method) => {
  const methodMap = {
    cod: 'COD',
    transfer: 'Chuyển khoản',
    card: 'Thẻ tín dụng'
  }
  return methodMap[method] || method
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
  e.target.src = 'https://via.placeholder.com/60x60?text=No+Image'
}

const openStatusModal = (order) => {
  selectedOrder.value = order
  newStatus.value = order.status
  showStatusModal.value = true
  message.value = ''
}

const closeStatusModal = () => {
  showStatusModal.value = false
  selectedOrder.value = null
  newStatus.value = ''
  message.value = ''
}

const viewOrder = (order) => {
  selectedOrder.value = order
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedOrder.value = null
}

const updateStatus = async () => {
  if (!newStatus.value) {
    showMessage('Vui lòng chọn trạng thái', 'error')
    return
  }

  if (newStatus.value === selectedOrder.value.status) {
    showMessage('Trạng thái không thay đổi', 'error')
    return
  }

  try {
    updating.value = true

    const updatedOrder = {
      ...selectedOrder.value,
      status: newStatus.value,
      updatedAt: new Date().toISOString()
    }

    const response = await axios.put(
      `${API_BASE_URL}/orders/${selectedOrder.value.id}`,
      updatedOrder
    )

    if (response.status === 200) {
      const index = orders.value.findIndex(o => o.id === selectedOrder.value.id)
      if (index !== -1) {
        orders.value[index] = response.data
      }

      showMessage('Cập nhật trạng thái thành công!', 'success')
      
      setTimeout(() => {
        closeStatusModal()
      }, 1500)
    }
  } catch (error) {
    console.error(' Lỗi cập nhật:', error)
    showMessage('Không thể cập nhật trạng thái. Vui lòng thử lại!', 'error')
  } finally {
    updating.value = false
  }
}

const showMessage = (msg, type) => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}
</script>

<style scoped>
.order-admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.header h2 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.filter-group {
  display: flex;
  gap: 10px;
  align-items: center;
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

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 18px;
}

.table-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.order-table thead {
  background-color: #f8f9fa;
}

.order-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
}

.order-table td {
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
  vertical-align: top;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-info strong {
  color: #333;
  font-size: 14px;
}

.customer-info small {
  color: #666;
  font-size: 12px;
}

.items-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 250px;
}

.item-row {
  font-size: 13px;
  color: #555;
}

.total-price {
  color: #e53935;
  font-size: 16px;
  display: block;
  margin-bottom: 5px;
}

.payment-method {
  display: block;
  color: #666;
  font-size: 12px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-confirmed {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-shipping {
  background-color: #d4edda;
  color: #155724;
}

.status-delivered {
  background-color: #d4edda;
  color: #155724;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-view {
  background-color: #17a2b8;
  color: white;
}

.btn-view:hover {
  background-color: #138496;
}

.btn-edit {
  background-color: #ffc107;
  color: #000;
}

.btn-edit:hover {
  background-color: #e0a800;
}

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
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
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

.order-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.order-info p {
  margin: 8px 0;
  color: #555;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.status-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.status-select:focus {
  outline: none;
  border-color: #007bff;
}

.message {
  padding: 10px;
  border-radius: 4px;
  margin: 15px 0;
  text-align: center;
  font-size: 14px;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.modal-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-save {
  background-color: #28a745;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: #218838;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background-color: #5a6268;
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
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
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

.total-amount {
  color: #e53935;
  font-size: 18px;
}

.payment-method-info {
  margin-top: 15px;
  text-align: center;
}

.badge {
  display: inline-block;
  padding: 6px 16px;
  background-color: #007bff;
  color: white;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
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