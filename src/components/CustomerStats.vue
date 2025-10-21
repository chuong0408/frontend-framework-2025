<template>
  <div class="customer-stats-container">
    <div class="header">
      <h2>👥 Thống kê khách hàng</h2>
      <div class="filter-group">
        <select v-model="sortBy" class="filter-select">
          <option value="spending-desc">Chi tiêu nhiều nhất</option>
          <option value="spending-asc">Chi tiêu ít nhất</option>
          <option value="orders-desc">Đơn hàng nhiều nhất</option>
          <option value="orders-asc">Đơn hàng ít nhất</option>
          <option value="recent">Mới nhất</option>
        </select>
      </div>
    </div>

    <div class="overview-cards">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>{{ stats.totalCustomers }}</h3>
          <p>Tổng khách hàng</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>{{ formatPrice(stats.totalRevenue) }}₫</h3>
          <p>Tổng doanh thu</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>{{ formatPrice(stats.averageSpending) }}₫</h3>
          <p>Chi tiêu TB/khách</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-content">
          <h3>{{ stats.topSpender }}</h3>
          <p>Khách VIP</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <p> Đang tải dữ liệu...</p>
    </div>

    <div v-else class="table-container">
      <table class="customer-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Khách hàng</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Số đơn hàng</th>
            <th>Tổng chi tiêu</th>
            <th>Chi tiêu TB</th>
            <th>Xếp hạng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(customer, index) in sortedCustomers" :key="customer.email">
            <td>{{ index + 1 }}</td>
            <td>
              <div class="customer-info">
                <div class="avatar">{{ customer.fullName.charAt(0).toUpperCase() }}</div>
                <strong>{{ customer.fullName }}</strong>
              </div>
            </td>
            <td>{{ customer.email }}</td>
            <td>{{ customer.phone }}</td>
            <td>
              <span class="badge badge-info">{{ customer.orderCount }}</span>
            </td>
            <td>
              <strong class="spending">{{ formatPrice(customer.totalSpending) }}₫</strong>
            </td>
            <td>{{ formatPrice(customer.averageOrderValue) }}₫</td>
            <td>
              <span :class="['rank-badge', getRankClass(customer.totalSpending)]">
                {{ getRank(customer.totalSpending) }}
              </span>
            </td>
            <td>
              <button @click="viewCustomerDetail(customer)" class="btn-view">
                Chi tiết
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showDetailModal && selectedCustomer" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Chi tiết khách hàng</h3>
          <button @click="closeModal" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <div class="detail-section">
            <h4>👤 Thông tin cá nhân</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Họ tên:</label>
                <span>{{ selectedCustomer.fullName }}</span>
              </div>
              <div class="detail-item">
                <label>Email:</label>
                <span>{{ selectedCustomer.email }}</span>
              </div>
              <div class="detail-item">
                <label>Số điện thoại:</label>
                <span>{{ selectedCustomer.phone }}</span>
              </div>
              <div class="detail-item">
                <label>Địa chỉ:</label>
                <span>{{ selectedCustomer.address }}</span>
              </div>
            </div>
          </div>


          <div class="detail-section">
            <h4>Thống kê mua hàng</h4>
            <div class="stats-grid">
              <div class="stat-box">
                <span class="stat-number">{{ selectedCustomer.orderCount }}</span>
                <span class="stat-label">Đơn hàng</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ formatPrice(selectedCustomer.totalSpending) }}₫</span>
                <span class="stat-label">Tổng chi tiêu</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ formatPrice(selectedCustomer.averageOrderValue) }}₫</span>
                <span class="stat-label">Giá trị TB/đơn</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ getRank(selectedCustomer.totalSpending) }}</span>
                <span class="stat-label">Xếp hạng</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4> Lịch sử đơn hàng ({{ selectedCustomer.orders.length }})</h4>
            <div class="orders-list">
              <div v-for="order in selectedCustomer.orders" :key="order.id" class="order-row">
                <div class="order-info">
                  <strong>{{ order.orderCode }}</strong>
                  <span>{{ formatDate(order.createdAt) }}</span>
                </div>
                <div class="order-status">
                  <span :class="['status-badge', `status-${order.status}`]">
                    {{ getStatusText(order.status) }}
                  </span>
                </div>
                <div class="order-total">
                  {{ formatPrice(order.payment.total) }}₫
                </div>
              </div>
            </div>
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

const loading = ref(true)
const orders = ref([])
const customers = ref([])
const sortBy = ref('spending-desc')
const selectedCustomer = ref(null)
const showDetailModal = ref(false)

const customerStats = computed(() => {
  const statsMap = {}
  
  orders.value.forEach(order => {
    const email = order.customer.email
    
    if (!statsMap[email]) {
      statsMap[email] = {
        fullName: order.customer.fullName,
        email: order.customer.email,
        phone: order.customer.phone,
        address: order.customer.address,
        orderCount: 0,
        totalSpending: 0,
        orders: []
      }
    }
    
    if (order.status === 'delivered' || order.status === 'confirmed') {
      statsMap[email].totalSpending += order.payment.total
    }
    
    statsMap[email].orderCount++
    statsMap[email].orders.push(order)
  })
  
  return Object.values(statsMap).map(customer => ({
    ...customer,
    averageOrderValue: customer.orderCount > 0 
      ? customer.totalSpending / customer.orderCount 
      : 0
  }))
})

const sortedCustomers = computed(() => {
  const sorted = [...customerStats.value]
  
  switch (sortBy.value) {
    case 'spending-desc':
      return sorted.sort((a, b) => b.totalSpending - a.totalSpending)
    case 'spending-asc':
      return sorted.sort((a, b) => a.totalSpending - b.totalSpending)
    case 'orders-desc':
      return sorted.sort((a, b) => b.orderCount - a.orderCount)
    case 'orders-asc':
      return sorted.sort((a, b) => a.orderCount - b.orderCount)
    case 'recent':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.orders[a.orders.length - 1]?.createdAt || 0)
        const dateB = new Date(b.orders[b.orders.length - 1]?.createdAt || 0)
        return dateB - dateA
      })
    default:
      return sorted
  }
})

const stats = computed(() => {
  const total = customerStats.value.length
  const revenue = customerStats.value.reduce((sum, c) => sum + c.totalSpending, 0)
  const topCustomer = customerStats.value.sort((a, b) => b.totalSpending - a.totalSpending)[0]
  
  return {
    totalCustomers: total,
    totalRevenue: revenue,
    averageSpending: total > 0 ? revenue / total : 0,
    topSpender: topCustomer?.fullName || 'N/A'
  }
})

onMounted(async () => {
  await loadOrders()
})

const loadOrders = async () => {
  try {
    loading.value = true
    const response = await axios.get(`${API_BASE_URL}/orders`)
    orders.value = response.data
  } catch (error) {
    console.error('Lỗi tải đơn hàng:', error)
  } finally {
    loading.value = false
  }
}

const getRank = (spending) => {
  if (spending >= 50000000) return 'VIP Diamond'
  if (spending >= 20000000) return 'VIP Platinum'
  if (spending >= 10000000) return 'VIP Gold'
  if (spending >= 5000000) return 'VIP Silver'
  if (spending >= 1000000) return 'Thành viên'
  return 'Mới'
}

const getRankClass = (spending) => {
  if (spending >= 50000000) return 'diamond'
  if (spending >= 20000000) return 'platinum'
  if (spending >= 10000000) return 'gold'
  if (spending >= 5000000) return 'silver'
  if (spending >= 1000000) return 'member'
  return 'new'
}

const viewCustomerDetail = (customer) => {
  selectedCustomer.value = customer
  showDetailModal.value = true
}

const closeModal = () => {
  showDetailModal.value = false
  selectedCustomer.value = null
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price || 0)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    delivered: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.customer-stats-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
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
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  gap: 15px;
  align-items: center;
}

.stat-icon {
  font-size: 40px;
}

.stat-content h3 {
  margin: 0 0 5px;
  font-size: 24px;
  color: #333;
}

.stat-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #666;
}

.table-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow-x: auto;
}

.customer-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.customer-table thead {
  background: #f8f9fa;
}

.customer-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #dee2e6;
}

.customer-table td {
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-info {
  background: #d1ecf1;
  color: #0c5460;
}

.spending {
  color: #e53935;
  font-size: 16px;
}

.rank-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
}

.rank-badge.diamond {
  background: linear-gradient(135deg, #b8cce4, #8fb3d9);
}

.rank-badge.platinum {
  background: linear-gradient(135deg, #e5e4e2, #c0c0c0);
}

.rank-badge.gold {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
}

.rank-badge.silver {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #333;
}

.rank-badge.member {
  background: #28a745;
}

.rank-badge.new {
  background: #6c757d;
}

.btn-view {
  padding: 6px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-view:hover {
  background: #0056b3;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
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
}

.btn-close {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #999;
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

.detail-item label {
  font-weight: 600;
  color: #555;
  font-size: 13px;
}

.detail-item span {
  color: #333;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.stat-box {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-info strong {
  color: #333;
  font-size: 14px;
}

.order-info span {
  color: #666;
  font-size: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.status-pending {
  background: #ffc107;
}

.status-confirmed {
  background: #17a2b8;
}

.status-shipping {
  background: #007bff;
}

.status-delivered {
  background: #28a745;
}

.status-cancelled {
  background: #dc3545;
}

.order-total {
  font-weight: 700;
  color: #e53935;
  font-size: 15px;
}

@media (max-width: 768px) {
  .detail-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .order-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>