<template>
  <div v-if="lowStockProducts.length > 0" class="alert-container">
    <div class="alert-header">
      <h3>⚠️ Cảnh báo sắp hết hàng</h3>
      <button @click="showAlert = !showAlert">
        {{ showAlert ? '▼' : '▲' }}
      </button>
    </div>
    
    <div v-if="showAlert" class="alert-body">
      <div v-for="product in lowStockProducts" :key="product.id" class="alert-item">
        <div class="item-info">
          <strong>{{ product.name }}</strong>
          <span class="stock-badge" :class="getStockClass(product.quantity)">
            Còn {{ product.quantity }} sản phẩm
          </span>
        </div>
        <button @click="goToProduct(product.id)" class="btn-view">
          Xem chi tiết
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const products = ref([])
const showAlert = ref(true)
const stockThreshold = ref(10) // Ngưỡng cảnh báo

const lowStockProducts = computed(() => {
  return products.value.filter(p => p.quantity > 0 && p.quantity <= stockThreshold.value)
})

onMounted(async () => {
  const res = await fetch('http://localhost:3001/products')
  products.value = await res.json()
})

const getStockClass = (quantity) => {
  if (quantity <= 3) return 'critical'
  if (quantity <= 5) return 'warning'
  return 'low'
}

const goToProduct = (id) => {
  router.push(`/admin/products/edit/${id}`)
}
</script>

<style scoped>
.alert-container {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-header h3 {
  margin: 0;
  color: #856404;
}

.alert-header button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}

.alert-body {
  margin-top: 15px;
}

.alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stock-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.stock-badge.critical {
  background: #f8d7da;
  color: #721c24;
}

.stock-badge.warning {
  background: #fff3cd;
  color: #856404;
}

.stock-badge.low {
  background: #d1ecf1;
  color: #0c5460;
}

.btn-view {
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>