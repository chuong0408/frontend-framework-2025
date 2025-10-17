<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { auth } from '../store/auth'
import { cart } from '../store/cart'

const route = useRoute()
const router = useRouter()
const API_BASE_URL = 'http://localhost:3001'

const product = ref(null)
const allProducts = ref([])
const categories = ref([])
const loading = ref(true)
const selectedImage = ref('')
const quantity = ref(1)

const isAdmin = computed(() => auth.isAdmin())

// Sản phẩm liên quan
const relatedProducts = computed(() => {
  if (!product.value || !allProducts.value.length) return []
  return allProducts.value
    .filter(p =>
      String(p.categoryId) === String(product.value.categoryId) &&
      String(p.id) !== String(product.value.id)
    )
    .slice(0, 4)
})

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

const increaseQty = () => {
  if (quantity.value < product.value.quantity) {
    quantity.value++
  }
}

const decreaseQty = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = () => {
  if (product.value.quantity === 0) return

  cart.addItem(product.value, quantity.value)
  alert(` Đã thêm ${quantity.value} sản phẩm "${product.value.name}" vào giỏ hàng!`)
}

const addRelatedToCart = (relatedProduct) => {
  if (relatedProduct.quantity === 0) return

  cart.addItem(relatedProduct, 1)
  alert(` Đã thêm "${relatedProduct.name}" vào giỏ hàng!`)
}

const deleteProduct = async () => {
  if (!confirm('⚠️ Bạn có chắc chắn muốn xóa sản phẩm này?')) return

  try {
    await axios.delete(`${API_BASE_URL}/products/${product.value.id}`)
    alert(' Đã xóa sản phẩm thành công!')
    router.push('/admin/products')
  } catch (error) {
    console.error(' Lỗi khi xóa:', error)
    alert(' Không thể xóa sản phẩm!')
  }
}

onMounted(async () => {
  await loadData()
})

watch(() => route.params.id, () => {
  loadProductDetail()
})

const loadData = async () => {
  try {
    const [resCategories, resProducts] = await Promise.all([
      axios.get(`${API_BASE_URL}/categories`),
      axios.get(`${API_BASE_URL}/products`)
    ])

    categories.value = resCategories.data
    allProducts.value = resProducts.data

    await loadProductDetail()
  } catch (err) {
    console.error(' Lỗi tải dữ liệu:', err)
  }
}

  const loadProductDetail = async () => {
    try {
      const id = route.params.id
      const response = await axios.get(`${API_BASE_URL}/products/${id}`)
      product.value = response.data
      selectedImage.value = product.value.images?.[0] || ''
      quantity.value = 1

      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error(' Lỗi tải sản phẩm:', error)
      product.value = null
    } finally {
      loading.value = false
    }
  }
</script>
<template>
  <div class="container">
    <h2>Chi tiết sản phẩm</h2>

    <div v-if="product" class="product-detail">
      <div class="product-gallery">
        <div class="main-image">
          <img :src="getImageUrl(selectedImage || product.images?.[0])" :alt="product.name" @error="handleImageError" />
        </div>

        <div class="product-images" v-if="product.images?.length > 1">
          <div v-for="(img, index) in product.images" :key="index" class="image-wrapper"
            :class="{ active: selectedImage === img }" @click="selectedImage = img">
            <img :src="getImageUrl(img)" :alt="`${product.name} - ${index + 1}`" />
          </div>
        </div>
      </div>

      <div class="product-info">
        <p><strong>Tên sản phẩm:</strong> {{ product.name }}</p>
        <p><strong>Danh mục:</strong> {{ getCategoryName(product.categoryId) }}</p>
        <p class="quantity">
          <strong>Số lượng còn:</strong>
          <span :class="product.quantity > 0 ? 'in-stock' : 'out-stock'">
            {{ product.quantity || 0 }}
          </span>
        </p>
        <p v-if="product.discount > 0" class="discount">
          <strong>Giảm giá:</strong> {{ product.discount }}%
        </p>

        <div v-if="!isAdmin && product.quantity > 0" class="quantity-selector">
          <label>Số lượng:</label>
          <div class="qty-controls">
            <button @click="decreaseQty" :disabled="quantity <= 1">-</button>
            <input v-model.number="quantity" type="number" min="1" :max="product.quantity" />
            <button @click="increaseQty" :disabled="quantity >= product.quantity">+</button>
          </div>
        </div>

        <div class="action-buttons">
          <template v-if="isAdmin">
            <router-link :to="`/admin/products/edit/${product.id}`" class="btn btn-edit">
              Sửa sản phẩm
            </router-link>
            <button @click="deleteProduct" class="btn btn-delete">
              Xóa sản phẩm
            </button>
          </template>
          <template v-else>
            <button @click="addToCart" class="btn btn-add-cart" :disabled="product.quantity === 0">
              {{ product.quantity > 0 ? '🛒 Thêm vào giỏ hàng' : 'Hết hàng' }}
            </button>
            <router-link to="/cart" class="btn btn-view-cart">
              👁️ Xem giỏ hàng ({{ cart.totalItems }})
            </router-link>
          </template>
        </div>

        <router-link :to="isAdmin ? '/admin/products' : '/products'" class="back-button">
          ← Quay lại danh sách
        </router-link>
      </div>
    </div>

    <div v-else>
      <p> Không tìm thấy sản phẩm hoặc có lỗi khi tải dữ liệu.</p>
    </div>

    <div v-if="!isAdmin && relatedProducts.length > 0" class="related-products">
      <h3> Sản phẩm liên quan</h3>

      <div class="related-grid">
        <div v-for="related in relatedProducts" :key="related.id" class="related-card">
          <router-link :to="`/products/${related.id}`" class="related-link">
            <div class="related-image">
              <img :src="getImageUrl(related.images?.[0])" :alt="related.name" @error="handleImageError" />
              <span v-if="related.discount > 0" class="discount-badge">
                -{{ related.discount }}%
              </span>
            </div>

            <div class="related-info">
              <h4>{{ related.name }}</h4>
              <p class="related-category">{{ getCategoryName(related.categoryId) }}</p>
              <p class="related-quantity">Còn: {{ related.quantity || 0 }}</p>
            </div>
          </router-link>

          <button @click="addRelatedToCart(related)" class="btn-quick-add" :disabled="related.quantity === 0">
            {{ related.quantity > 0 ? ' Thêm' : 'Hết hàng' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

h2 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 60px;
}

@media (max-width: 992px) {
  .product-detail {
    grid-template-columns: 1fr;
  }
}

.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.main-image {
  width: 100%;
  height: 400px;
  border-radius: 10px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.image-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.image-wrapper:hover,
.image-wrapper.active {
  border-color: #007bff;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-info p {
  font-size: 18px;
  color: #555;
  line-height: 1.6;
}

.product-info strong {
  color: #222;
  font-weight: 600;
}

.quantity {
  font-size: 16px;
}

.in-stock {
  color: #28a745;
  font-weight: 600;
}

.out-stock {
  color: #e53935;
  font-weight: 600;
}

.discount {
  color: #e53935;
  font-weight: 600;
}

.quantity-selector {
  margin: 15px 0;
}

.quantity-selector label {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qty-controls button {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background: white;
  font-size: 20px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.qty-controls button:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.qty-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-controls input {
  width: 80px;
  height: 40px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  text-align: center;
  display: inline-block;
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
}

.btn-view-cart {
  background-color: #007bff;
  color: white;
}

.btn-view-cart:hover {
  background-color: #0056b3;
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

.back-button {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #5a6268;
}

/* Sản phẩm liên quan */
.related-products {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 2px solid #eee;
}

.related-products h3 {
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.related-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.related-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.related-link {
  text-decoration: none;
  color: inherit;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.related-image {
  position: relative;
  width: 100%;
  height: 200px;
  background-color: #f5f5f5;
  overflow: hidden;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.related-card:hover .related-image img {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #e53935;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.related-info {
  padding: 15px;
  flex: 1;
}

.related-info h4 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #333;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-category {
  color: #666;
  font-size: 13px;
  margin: 5px 0;
}

.related-quantity {
  color: #28a745;
  font-size: 13px;
  font-weight: 500;
  margin: 5px 0 0;
}

.btn-quick-add {
  width: 100%;
  padding: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-quick-add:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-quick-add:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }

  .related-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}
</style>