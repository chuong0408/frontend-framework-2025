<template>
  <div class="product-form">
    <h3>{{ isEditMode ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới' }}</h3>

    <input v-model="product.name" placeholder="Tên sản phẩm" />
    
    <select v-model="product.categoryId">
      <option disabled value="">-- Chọn danh mục --</option>
      <option v-for="c in categories" :key="c.id" :value="c.id">
        {{ c.name }} — {{ c.description }}
      </option>
    </select>
    
    <input v-model="product.quantity" type="number" min="0" placeholder="Số lượng" />
    
    <input v-model="product.discount" type="number" min="0" max="100" placeholder="Giảm giá (%)" />
    
    <label>Chọn hình ảnh sản phẩm (có thể chọn nhiều):</label>
    <input type="file" multiple @change="handleFileChange" accept="image/*" />

    <div class="preview" v-if="previewImages.length > 0">
      <div v-for="(img, index) in previewImages" :key="index" class="preview-item">
        <img :src="img" />
        <button type="button" @click="removeImage(index)" class="remove-btn">×</button>
      </div>
    </div>

    <div class="actions">
      <button @click="submitProduct" :disabled="loading">
        {{ loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Lưu sản phẩm') }}
      </button>
      <button @click="resetForm" class="secondary" type="button">Làm mới</button>
      <button @click="goBack" class="secondary" type="button">Quay lại</button>
    </div>

    <p v-if="message" class="message" :class="{ error: isError }">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

// Base URL cho API
const API_BASE_URL = 'http://localhost:3001'

const categories = ref([])
const product = ref({
  name: '',
  categoryId: '',
  quantity: 0,
  discount: 0
})

const files = ref([])
const previewImages = ref([])
const existingImages = ref([])
const message = ref('')
const isError = ref(false)
const loading = ref(false)
const isEditMode = ref(false)
const productId = ref(null)

onMounted(async () => {
  await loadCategories()
  
  if (route.params.id) {
    isEditMode.value = true
    productId.value = route.params.id
    console.log('🔧 Chế độ sửa - Product ID:', productId.value)
    await loadProduct(productId.value)
  } else {
    console.log(' Chế độ thêm mới')
  }
})

// Load danh sách categories
const loadCategories = async () => {
  try {
    console.log('📂 Đang tải danh mục...')
    const res = await axios.get(`${API_BASE_URL}/categories`)
    categories.value = Array.isArray(res.data) ? res.data : res.data.categories || []
    console.log('✅ Đã tải', categories.value.length, 'danh mục')
  } catch (err) {
    console.error(' Lỗi tải danh mục:', err)
    showMessage('Không thể tải danh mục', true)
  }
}

// Load dữ liệu sản phẩm cần sửa
const loadProduct = async (id) => {
  try {
    loading.value = true
    console.log('📦 Đang tải sản phẩm từ:', `${API_BASE_URL}/products/${id}`)
    
    const res = await axios.get(`${API_BASE_URL}/products/${id}`)
    const data = res.data
    
    console.log('✅ Dữ liệu sản phẩm:', data)
    
    product.value = {
      name: data.name || '',
      categoryId: data.categoryId || '',
      quantity: data.quantity || 0,
      discount: data.discount || 0
    }
    
    // Load preview images nếu có
    if (data.images && Array.isArray(data.images)) {
      existingImages.value = data.images
      previewImages.value = data.images.map(img => {
        return img.startsWith('http') ? img : `${API_BASE_URL}${img}`
      })
      console.log('🖼️ Đã tải', previewImages.value.length, 'ảnh')
    }
    
    showMessage('Đã tải thông tin sản phẩm', false)
  } catch (err) {
    console.error(' Load product error:', err)
    console.error('Response:', err.response?.data)
    showMessage('Không thể tải thông tin sản phẩm: ' + (err.response?.data?.error || err.message), true)
  } finally {
    loading.value = false
  }
}

// Xử lý khi chọn file
const handleFileChange = (e) => {
  const selected = Array.from(e.target.files)
  const valid = selected.filter(file => file.type.startsWith('image/'))

  if (valid.length !== selected.length) {
    showMessage('Một số tệp không phải hình ảnh đã bị bỏ qua', true)
  }

  files.value = valid
  
  // Tạo preview cho ảnh mới
  const newPreviews = valid.map(file => URL.createObjectURL(file))
  
  // Nếu đang edit, giữ lại ảnh cũ và thêm ảnh mới
  if (isEditMode.value) {
    previewImages.value = [
      ...existingImages.value.map(img => 
        img.startsWith('http') ? img : `${API_BASE_URL}${img}`
      ), 
      ...newPreviews
    ]
  } else {
    previewImages.value = newPreviews
  }
  
  console.log('📸 Đã chọn', valid.length, 'ảnh')
}

// Xóa ảnh khỏi preview
const removeImage = (index) => {
  previewImages.value.splice(index, 1)
  if (index < existingImages.value.length) {
    existingImages.value.splice(index, 1)
  } else {
    const fileIndex = index - existingImages.value.length
    files.value.splice(fileIndex, 1)
  }
}

const submitProduct = async () => {
  // Validation
  if (!product.value.name || !product.value.categoryId) {
    showMessage('Vui lòng nhập đầy đủ thông tin', true)
    return
  }

  if (!isEditMode.value && files.value.length === 0) {
    showMessage('Vui lòng chọn ít nhất một hình ảnh', true)
    return
  }

  loading.value = true

  const formData = new FormData()
  formData.append('name', product.value.name)
  formData.append('categoryId', product.value.categoryId)
  formData.append('quantity', product.value.quantity)
  formData.append('discount', product.value.discount)
  
  files.value.forEach((file, index) => {
    formData.append('images[]', file)
    console.log(`📎 File ${index + 1}:`, file.name)
  })
  
  if (isEditMode.value && existingImages.value.length > 0) {
    formData.append('existingImages', JSON.stringify(existingImages.value))
  }

  try {
    if (isEditMode.value) {
      console.log(' Đang cập nhật sản phẩm:', productId.value)
      const res = await axios.put(`${API_BASE_URL}/products/${productId.value}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      console.log(' Kết quả cập nhật:', res.data)
      showMessage('Sản phẩm đã được cập nhật thành công!', false)
      alert('Cập nhật thành công!')
    } else {
      // Thêm mới sản phẩm
      console.log(' Đang thêm sản phẩm mới')
      const res = await axios.post(`${API_BASE_URL}/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      console.log(' Kết quả thêm mới:', res.data)
      showMessage('Sản phẩm đã được thêm thành công!', false)
      alert('Thêm mới thành công!')
    }
    
    setTimeout(() => {
      router.push('/admin/products')
    }, 500)
  } catch (err) {
    console.error(' Submit error:', err)
    console.error('Response:', err.response?.data)
    showMessage(
      isEditMode.value ? 'Lỗi khi cập nhật sản phẩm' : 'Lỗi khi thêm sản phẩm', 
      true
    )
  } finally {
    loading.value = false
  }
}


const resetForm = () => {
  if (isEditMode.value) {

    loadProduct(productId.value)
  } else {

    product.value = { 
      name: '', 
      categoryId: '', 
      quantity: 0, 
      discount: 0 
    }
    files.value = []
    previewImages.value = []
    existingImages.value = []
  }
  message.value = ''
  isError.value = false
}

const goBack = () => {
  router.push('/admin/products')
}


const showMessage = (msg, error = false) => {
  message.value = msg
  isError.value = error
  setTimeout(() => {
    message.value = ''
    isError.value = false
  }, 3000)
}
</script>

<style scoped>
.product-form {
  max-width: 600px;
  margin: 30px auto;
  padding: 24px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

h3 {
  margin-bottom: 16px;
  color: #333;
  font-size: 24px;
}

input,
select {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
}

input:focus,
select:focus {
  outline: none;
  border-color: #007bff;
}

label {
  font-weight: 500;
  margin-bottom: 6px;
  display: block;
  color: #555;
}

.preview {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background-color: #c82333;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button.secondary {
  background-color: #6c757d;
}

button.secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  margin-top: 12px;
  padding: 10px;
  border-radius: 6px;
  font-weight: 500;
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

.message.error {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
</style>