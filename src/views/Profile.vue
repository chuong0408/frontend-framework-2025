<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../store/auth'

const router = useRouter()
const user = ref(null)
const isEditing = ref(false)
const message = ref('')
const loading = ref(false)

// Tab management
const activeTab = ref('info') // 'info' or 'orders'

// Orders data
const orders = ref([])
const loadingOrders = ref(false)
const selectedOrder = ref(null)
const showOrderDetail = ref(false)

// Form data
const formData = ref({
  userName: '',
  fullName: '',
  email: '',
  age: null,
  gender: '',
  desiredProducts: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Computed
const orderStats = computed(() => {
  return {
    total: orders.value.length,
    pending: orders.value.filter(o => o.status === 'pending').length,
    completed: orders.value.filter(o => o.status === 'delivered').length,
    cancelled: orders.value.filter(o => o.status === 'cancelled').length
  }
})

// Load thông tin user
onMounted(async () => {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    loading.value = true
    const response = await fetch(`http://localhost:3001/users?userName=${auth.user.username}`)
    const users = await response.json()
    
    if (users.length > 0) {
      user.value = users[0]
      formData.value.userName = user.value.userName
      formData.value.fullName = user.value.fullName || ''
      formData.value.email = user.value.email || ''
      formData.value.age = user.value.age || null
      formData.value.gender = user.value.gender || ''
      formData.value.desiredProducts = user.value.desiredProducts || ''
      
      // Load orders
      await loadOrders()
    }
  } catch (error) {
    console.error('Lỗi load user:', error)
    message.value = 'Không thể tải thông tin người dùng'
  } finally {
    loading.value = false
  }
})

// Load orders
const loadOrders = async () => {
  try {
    loadingOrders.value = true
    // Lấy đơn hàng của user (dựa vào email hoặc userId)
    const response = await fetch(`http://localhost:3001/orders?_sort=createdAt&_order=desc`)
    const allOrders = await response.json()
    
    // Filter orders by user email
    orders.value = allOrders.filter(order => 
      order.customer.email === user.value.email
    )
  } catch (error) {
    console.error('Lỗi load orders:', error)
  } finally {
    loadingOrders.value = false
  }
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  message.value = ''
  formData.value.currentPassword = ''
  formData.value.newPassword = ''
  formData.value.confirmPassword = ''
  
  if (!isEditing.value && user.value) {
    formData.value.fullName = user.value.fullName || ''
    formData.value.email = user.value.email || ''
    formData.value.age = user.value.age || null
    formData.value.gender = user.value.gender || ''
    formData.value.desiredProducts = user.value.desiredProducts || ''
  }
}

const handleUpdate = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (formData.value.email && !emailRegex.test(formData.value.email)) {
    message.value = 'Email không hợp lệ'
    return
  }

  if (formData.value.age && (formData.value.age < 0 || formData.value.age > 120)) {
    message.value = 'Tuổi phải từ 0 đến 120'
    return
  }

  if (formData.value.newPassword) {
    if (!formData.value.currentPassword) {
      message.value = 'Vui lòng nhập mật khẩu hiện tại'
      return
    }

    if (formData.value.currentPassword !== user.value.password) {
      message.value = 'Mật khẩu hiện tại không đúng'
      return
    }

    if (formData.value.newPassword.length < 6) {
      message.value = 'Mật khẩu mới phải có ít nhất 6 ký tự'
      return
    }

    if (formData.value.newPassword !== formData.value.confirmPassword) {
      message.value = 'Mật khẩu xác nhận không khớp'
      return
    }
  }

  try {
    loading.value = true

    const updatedUser = {
      ...user.value,
      fullName: formData.value.fullName,
      email: formData.value.email,
      age: formData.value.age ? parseInt(formData.value.age) : null,
      gender: formData.value.gender,
      desiredProducts: formData.value.desiredProducts,
      password: formData.value.newPassword || user.value.password
    }

    const response = await fetch(`http://localhost:3001/users/${user.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedUser)
    })

    if (response.ok) {
      user.value = await response.json()
      message.value = 'Cập nhật thông tin thành công!'
      isEditing.value = false
      
      auth.user.email = user.value.email
      auth.user.fullName = user.value.fullName
    } else {
      message.value = 'Cập nhật thất bại. Vui lòng thử lại!'
    }
  } catch (error) {
    console.error('Lỗi cập nhật:', error)
    message.value = 'Có lỗi xảy ra: ' + error.message
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

const getGenderText = (gender) => {
  const genderMap = {
    'male': 'Nam',
    'female': 'Nữ',
    'other': 'Khác'
  }
  return genderMap[gender] || 'Chưa cập nhật'
}

// Order functions
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
  return imagePath.startsWith('http') ? imagePath : `http://localhost:3001${imagePath}`
}

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/60x60?text=No+Image'
}

const viewOrderDetail = (order) => {
  selectedOrder.value = order
  showOrderDetail.value = true
}

const closeOrderDetail = () => {
  showOrderDetail.value = false
  selectedOrder.value = null
}
</script>

<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar">
          {{ user?.userName?.charAt(0).toUpperCase() || 'U' }}
        </div>
        <h2>{{ user?.fullName || user?.userName }}</h2>
        <p class="subtitle">{{ user?.email }}</p>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          :class="['tab', { active: activeTab === 'info' }]"
          @click="activeTab = 'info'"
        >
          👤 Thông tin cá nhân
        </button>
        <button 
          :class="['tab', { active: activeTab === 'orders' }]"
          @click="activeTab = 'orders'"
        >
          📦 Lịch sử đơn hàng ({{ orders.length }})
        </button>
      </div>

      <div v-if="loading" class="loading">Đang tải...</div>

      <div v-else-if="user" class="profile-content">
        <!-- Tab Thông tin cá nhân -->
        <div v-show="activeTab === 'info'">
          <!-- View Mode -->
          <div v-if="!isEditing" class="view-mode">
            <div class="info-group">
              <label>Tên đăng nhập:</label>
              <p>{{ user.userName }}</p>
            </div>

            <div class="info-group">
              <label>Họ và tên:</label>
              <p>{{ user.fullName || 'Chưa cập nhật' }}</p>
            </div>

            <div class="info-group">
              <label>Email:</label>
              <p>{{ user.email || 'Chưa cập nhật' }}</p>
            </div>

            <div class="info-group">
              <label>Tuổi:</label>
              <p>{{ user.age ? user.age + ' tuổi' : 'Chưa cập nhật' }}</p>
            </div>

            <div class="info-group">
              <label>Giới tính:</label>
              <p>{{ getGenderText(user.gender) }}</p>
            </div>

            <div class="info-group">
              <label>Sản phẩm mong muốn:</label>
              <p>{{ user.desiredProducts || 'Chưa cập nhật' }}</p>
            </div>

            <div class="info-group">
              <label>Mật khẩu:</label>
              <p>••••••••</p>
            </div>

            <div class="button-group">
              <button class="btn-edit" @click="toggleEdit">
                ✏️ Chỉnh sửa
              </button>
              <button class="btn-logout" @click="handleLogout">
                🚪 Đăng xuất
              </button>
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-else class="edit-mode">
            <div class="form-group">
              <label>Tên đăng nhập:</label>
              <input 
                v-model="formData.userName" 
                type="text"
                disabled
                class="disabled-input"
              />
              <small>Không thể thay đổi tên đăng nhập</small>
            </div>

            <div class="form-group">
              <label>Họ và tên:</label>
              <input 
                v-model="formData.fullName" 
                type="text"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div class="form-group">
              <label>Email:</label>
              <input 
                v-model="formData.email" 
                type="email"
                placeholder="Nhập email"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tuổi:</label>
                <input 
                  v-model.number="formData.age" 
                  type="number"
                  min="0"
                  max="120"
                  placeholder="Nhập tuổi"
                />
              </div>

              <div class="form-group">
                <label>Giới tính:</label>
                <select v-model="formData.gender">
                  <option value="">-- Chọn giới tính --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Sản phẩm mong muốn:</label>
              <textarea 
                v-model="formData.desiredProducts" 
                placeholder="Nhập các sản phẩm bạn quan tâm (vd: Laptop, Điện thoại...)"
                rows="3"
              ></textarea>
            </div>

            <div class="divider">
              <span>Đổi mật khẩu (Không bắt buộc)</span>
            </div>

            <div class="form-group">
              <label>Mật khẩu hiện tại:</label>
              <input 
                v-model="formData.currentPassword" 
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>

            <div class="form-group">
              <label>Mật khẩu mới:</label>
              <input 
                v-model="formData.newPassword" 
                type="password"
                placeholder="Nhập mật khẩu mới"
              />
            </div>

            <div class="form-group">
              <label>Xác nhận mật khẩu mới:</label>
              <input 
                v-model="formData.confirmPassword" 
                type="password"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <p v-if="message" :class="message.includes('thành công') ? 'success' : 'error'">
              {{ message }}
            </p>

            <div class="button-group">
              <button class="btn-save" @click="handleUpdate" :disabled="loading">
                {{ loading ? '⏳ Đang lưu...' : '💾 Lưu thay đổi' }}
              </button>
              <button class="btn-cancel" @click="toggleEdit" :disabled="loading">
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>

        <!-- Tab Lịch sử đơn hàng -->
        <div v-show="activeTab === 'orders'" class="orders-tab">
          <!-- Stats -->
          <div class="order-stats">
            <div class="stat-card">
              <div class="stat-number">{{ orderStats.total }}</div>
              <div class="stat-label">Tổng đơn</div>
            </div>
            <div class="stat-card">
              <div class="stat-number" style="color: #ffc107">{{ orderStats.pending }}</div>
              <div class="stat-label">Chờ xác nhận</div>
            </div>
            <div class="stat-card">
              <div class="stat-number" style="color: #28a745">{{ orderStats.completed }}</div>
              <div class="stat-label">Hoàn thành</div>
            </div>
            <div class="stat-card">
              <div class="stat-number" style="color: #dc3545">{{ orderStats.cancelled }}</div>
              <div class="stat-label">Đã hủy</div>
            </div>
          </div>

          <!-- Orders List -->
          <div v-if="loadingOrders" class="loading">Đang tải đơn hàng...</div>
          
          <div v-else-if="orders.length === 0" class="empty-orders">
            <div class="empty-icon">📭</div>
            <p>Bạn chưa có đơn hàng nào</p>
            <router-link to="/products" class="btn-shop">
              Mua sắm ngay
            </router-link>
          </div>

          <div v-else class="orders-list">
            <div 
              v-for="order in orders" 
              :key="order.id" 
              class="order-card"
            >
              <div class="order-header-row">
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

              <div class="order-items">
                <div 
                  v-for="item in order.items.slice(0, 2)" 
                  :key="item.productId" 
                  class="order-item"
                >
                  <img 
                    :src="getImageUrl(item.image)" 
                    :alt="item.name"
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

                <div v-if="order.items.length > 2" class="more-items">
                  +{{ order.items.length - 2 }} sản phẩm khác
                </div>
              </div>

              <div class="order-footer-row">
                <div class="order-total">
                  <span>Tổng cộng:</span>
                  <strong>{{ formatPrice(order.payment.total) }}₫</strong>
                </div>
                <button @click="viewOrderDetail(order)" class="btn-detail">
                  Chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Chi tiết đơn hàng -->
    <div 
      v-if="showOrderDetail && selectedOrder" 
      class="modal-overlay" 
      @click="closeOrderDetail"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Chi tiết đơn hàng</h3>
          <button @click="closeOrderDetail" class="btn-close">×</button>
        </div>

        <div class="modal-body">
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
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 900px;
  margin: 50px auto;
  padding: 20px;
}

.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  background: white;
  color: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  margin: 0 auto 15px;
}

.profile-header h2 {
  margin: 0 0 5px;
  font-size: 24px;
}

.subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.tab {
  flex: 1;
  padding: 15px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
}

.tab:hover {
  background-color: #f5f5f5;
  color: #333;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background-color: #f8f9ff;
}

.profile-content {
  padding: 30px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* View Mode */
.view-mode .info-group {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.view-mode .info-group:last-of-type {
  border-bottom: none;
}

.view-mode label {
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 5px;
  font-size: 14px;
}

.view-mode p {
  margin: 0;
  color: #333;
  font-size: 16px;
}

/* Edit Mode */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.disabled-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-group small {
  display: block;
  color: #999;
  font-size: 12px;
  margin-top: 5px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.divider {
  margin: 25px 0;
  text-align: center;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #ddd;
}

.divider span {
  background: white;
  padding: 0 15px;
  color: #999;
  font-size: 13px;
  position: relative;
  z-index: 1;
}

/* Buttons */
.button-group {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  background-color: #667eea;
  color: white;
}

.btn-edit:hover {
  background-color: #5568d3;
}

.btn-logout {
  background-color: #f56565;
  color: white;
}

.btn-logout:hover {
  background-color: #e53e3e;
}

.btn-save {
  background-color: #48bb78;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: #38a169;
}

.btn-cancel {
  background-color: #e2e8f0;
  color: #4a5568;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #cbd5e0;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Messages */
.error {
  color: #f56565;
  text-align: center;
  margin: 15px 0;
  font-size: 14px;
}

.success {
  color: #48bb78;
  text-align: center;
  margin: 15px 0;
  font-size: 14px;
}

/* Orders Tab */
.order-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.stat-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

.empty-orders {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.empty-orders p {
  color: #666;
  font-size: 16px;
  margin-bottom: 20px;
}

.btn-shop {
  display: inline-block;
  padding: 10px 24px;
  background-color: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-shop:hover {
  background-color: #5568d3;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 15px;
  transition: box-shadow 0.3s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.order-code {
  font-size: 16px;
  color: #333;
  margin-right: 10px;
}

.order-date {
  color: #666;
  font-size: 13px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.order-items {
  margin-bottom: 15px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
}

.order-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
}

.order-item .item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-item .item-info strong {
  font-size: 14px;
  color: #333;
}

.order-item .item-info span {
  font-size: 12px;
  color: #666;
}

.order-item .item-price {
  font-weight: 600;
  color: #e53935;
  font-size: 14px;
}

.more-items {
  text-align: center;
  color: #666;
  font-size: 13px;
  font-style: italic;
  margin-top: 8px;
}

.order-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

.order-total {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-total span {
  color: #666;
  font-size: 13px;
}

.order-total strong {
  color: #e53935;
  font-size: 18px;
}

.btn-detail {
  padding: 8px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-detail:hover {
  background-color: #5568d3;
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
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
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
  transition: color 0.3s;
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
  gap: 12px;
}

.product-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.product-item img {
  width: 60px;
  height: 60px;
  border-radius: 4px;
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
  font-size: 20px;
  color: #e53935;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-container {
    margin: 20px auto;
    padding: 10px;
  }

  .profile-content {
    padding: 20px;
  }

  .button-group {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .order-stats {
    grid-template-columns: repeat(2, 1fr);
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

@media (max-width: 480px) {
  .order-stats {
    grid-template-columns: 1fr;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab {
    border-bottom: 1px solid #e0e0e0;
    border-left: 3px solid transparent;
  }
  
  .tab.active {
    border-bottom: 1px solid #e0e0e0;
    border-left-color: #667eea;
  }
}
</style>