<template>
  <div class="reports-container">
    <h2>📊 Báo cáo & Thống kê</h2>

    <!-- Cảnh báo tồn kho -->
    <LowStockAlert />

    <!-- Tổng quan -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>{{ formatPrice(stats.revenue) }}₫</h3>
          <p>Tổng doanh thu</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <h3>{{ stats.totalOrders }}</h3>
          <p>Tổng đơn hàng</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>{{ stats.completedOrders }}</h3>
          <p>Đơn hoàn thành</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <h3>{{ formatPrice(stats.averageOrderValue) }}₫</h3>
          <p>Giá trị TB/đơn</p>
        </div>
      </div>
    </div>

    <!-- Biểu đồ doanh thu -->
    <div class="chart-container">
      <h3>Doanh thu theo tháng</h3>
      <canvas ref="revenueChart"></canvas>
    </div>

    <!-- Top sản phẩm bán chạy -->
    <div class="top-products">
      <h3>🔥 Top 5 sản phẩm bán chạy</h3>
      <div class="product-list">
        <div v-for="(product, index) in topProducts" :key="product.id" class="product-row">
          <div class="rank">{{ index + 1 }}</div>
          <img :src="getImageUrl(product.images?.[0])" :alt="product.name" />
          <div class="product-info">
            <strong>{{ product.name }}</strong>
            <span>Đã bán: {{ product.totalSold }} sản phẩm</span>
          </div>
          <div class="product-revenue">
            {{ formatPrice(product.totalSold * product.discount) }}₫
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import LowStockAlert from '../components/LowStockAlert.vue'
import Chart from 'chart.js/auto'

const API_BASE_URL = 'http://localhost:3001'
const revenueChart = ref(null)
const orders = ref([])
const products = ref([])

const stats = computed(() => {
  const revenue = orders.value.reduce((sum, o) => sum + o.payment.total, 0)
  const totalOrders = orders.value.length
  const completedOrders = orders.value.filter(o => o.status === 'delivered').length
  
  return {
    revenue,
    totalOrders,
    completedOrders,
    averageOrderValue: totalOrders > 0 ? revenue / totalOrders : 0
  }
})

const topProducts = computed(() => {
  const productSales = {}
  
  orders.value.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = 0
      }
      productSales[item.productId] += item.quantity
    })
  })
  
  return products.value
    .map(p => ({
      ...p,
      totalSold: productSales[p.id] || 0
    }))
    .filter(p => p.totalSold > 0)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5)
})

onMounted(async () => {
  await loadData()
  await nextTick()
  drawChart()
})

const loadData = async () => {
  try {
    const [resOrders, resProducts] = await Promise.all([
      fetch(`${API_BASE_URL}/orders`).then(r => r.json()),
      fetch(`${API_BASE_URL}/products`).then(r => r.json())
    ])
    orders.value = resOrders
    products.value = resProducts
  } catch (error) {
    console.error('Lỗi tải dữ liệu:', error)
  }
}

const drawChart = () => {
  if (!revenueChart.value) return
  
  const monthlyData = {}
  orders.value.forEach(order => {
    const month = new Date(order.createdAt).toISOString().slice(0, 7)
    monthlyData[month] = (monthlyData[month] || 0) + order.payment.total
  })
  
  const labels = Object.keys(monthlyData).sort()
  const data = labels.map(month => monthlyData[month])
  
  new Chart(revenueChart.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Doanh thu (₫)',
        data,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatPrice(value) + '₫'
          }
        }
      }
    }
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price || 0)
}

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/60'
  return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`
}
</script>

<style scoped>
.reports-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  gap: 15px;
  align-items: center;
}

.stat-icon {
  font-size: 40px;
}

.stat-content h3 {
  margin: 0 0 5px;
  color: #333;
  font-size: 24px;
}

.stat-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.chart-container {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.chart-container h3 {
  margin: 0 0 20px;
  color: #333;
}

.top-products {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.top-products h3 {
  margin: 0 0 20px;
  color: #333;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-row {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.rank {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
}

.product-row img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.product-info strong {
  color: #333;
  font-size: 15px;
}

.product-info span {
  color: #666;
  font-size: 13px;
}

.product-revenue {
  font-size: 18px;
  font-weight: 700;
  color: #28a745;
}
</style>