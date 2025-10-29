<template>
  <div class="category-admin-container">
    <div class="header">
      <h2>📑 Quản lý danh mục</h2>
      <button @click="showAddForm = true" class="btn-add">
        ➕ Thêm danh mục mới
      </button>
    </div>

    <div v-if="loading" class="loading">
      <p>⏳ Đang tải dữ liệu...</p>
    </div>

    <div v-else-if="categories.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>Chưa có danh mục nào</p>
      <button @click="showAddForm = true" class="btn-add">
        Thêm danh mục đầu tiên
      </button>
    </div>

    <div v-else class="table-container">
      <table class="category-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên danh mục</th>
            <th>Mô tả</th>
            <th>Loại</th>
            <th>Số sản phẩm</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>{{ category.id }}</td>
            <td>
              <strong>{{ category.name }}</strong>
            </td>
            <td>{{ category.description || 'Chưa có mô tả' }}</td>
            <td>
              <span class="type-badge">{{ category.type || 'Chưa phân loại' }}</span>
            </td>
            <td>
              <span class="product-count">
                {{ getProductCount(category.id) }} sản phẩm
              </span>
            </td>
            <td>
              <div class="actions">
                <button @click="editCategory(category)" class="btn-edit" title="Sửa">
                  ✏️
                </button>
                <button 
                  @click="deleteCategory(category.id)" 
                  class="btn-delete"
                  :disabled="getProductCount(category.id) > 0"
                  :title="getProductCount(category.id) > 0 ? 'Không thể xóa danh mục có sản phẩm' : 'Xóa'"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form (Thêm/Sửa) -->
    <div v-if="showAddForm || editingCategory" class="modal-overlay" @click="closeForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingCategory ? '✏️ Sửa danh mục' : '➕ Thêm danh mục mới' }}</h3>
          <button @click="closeForm" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Tên danh mục <span class="required">*</span></label>
            <input 
              v-model="formData.name" 
              type="text" 
              placeholder="Nhập tên danh mục"
              :class="{ error: errors.name }"
            />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label>Mô tả</label>
            <textarea 
              v-model="formData.description" 
              placeholder="Nhập mô tả danh mục"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Loại <span class="required">*</span></label>
            <input 
              v-model="formData.type" 
              type="text" 
              placeholder="Ví dụ: Giải trí, Nghệ thuật..."
              :class="{ error: errors.type }"
            />
            <span v-if="errors.type" class="error-message">{{ errors.type }}</span>
          </div>

          <p v-if="message" :class="['message', messageType]">{{ message }}</p>

          <div class="modal-actions">
            <button 
              @click="submitCategory" 
              class="btn-save" 
              :disabled="submitting"
            >
              {{ submitting ? '⏳ Đang lưu...' : (editingCategory ? '💾 Cập nhật' : '➕ Thêm mới') }}
            </button>
            <button 
              @click="closeForm" 
              class="btn-cancel"
              :disabled="submitting"
            >
              ❌ Hủy
            </button>
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

const categories = ref([])
const products = ref([])
const loading = ref(false)
const submitting = ref(false)
const showAddForm = ref(false)
const editingCategory = ref(null)
const message = ref('')
const messageType = ref('')

const formData = ref({
  name: '',
  description: '',
  type: ''
})

const errors = ref({
  name: '',
  type: ''
})

onMounted(async () => {
  await Promise.all([loadCategories(), loadProducts()])
})

const loadCategories = async () => {
  try {
    loading.value = true
    const response = await axios.get(`${API_BASE_URL}/categories`)
    categories.value = response.data
  } catch (error) {
    console.error('❌ Lỗi tải danh mục:', error)
    showMessage('Không thể tải danh sách danh mục', 'error')
  } finally {
    loading.value = false
  }
}

const loadProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`)
    products.value = response.data
  } catch (error) {
    console.error('❌ Lỗi tải sản phẩm:', error)
  }
}

const getProductCount = (categoryId) => {
  return products.value.filter(p => String(p.categoryId) === String(categoryId)).length
}

const validateForm = () => {
  errors.value = { name: '', type: '' }
  let isValid = true

  if (!formData.value.name.trim()) {
    errors.value.name = 'Vui lòng nhập tên danh mục'
    isValid = false
  }

  if (!formData.value.type.trim()) {
    errors.value.type = 'Vui lòng nhập loại danh mục'
    isValid = false
  }

  return isValid
}

const editCategory = (category) => {
  editingCategory.value = category
  formData.value = {
    name: category.name,
    description: category.description || '',
    type: category.type || ''
  }
  message.value = ''
}

const closeForm = () => {
  showAddForm.value = false
  editingCategory.value = null
  formData.value = {
    name: '',
    description: '',
    type: ''
  }
  errors.value = { name: '', type: '' }
  message.value = ''
}

const submitCategory = async () => {
  if (!validateForm()) {
    return
  }

  try {
    submitting.value = true

    const categoryData = {
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
      type: formData.value.type.trim()
    }

    if (editingCategory.value) {
      // Cập nhật
      await axios.put(
        `${API_BASE_URL}/categories/${editingCategory.value.id}`,
        { ...editingCategory.value, ...categoryData }
      )
      showMessage('✅ Cập nhật danh mục thành công!', 'success')
    } else {
      // Thêm mới
      await axios.post(`${API_BASE_URL}/categories`, categoryData)
      showMessage('✅ Thêm danh mục thành công!', 'success')
    }

    await loadCategories()
    setTimeout(() => {
      closeForm()
    }, 1500)
  } catch (error) {
    console.error('❌ Lỗi:', error)
    showMessage('❌ Có lỗi xảy ra. Vui lòng thử lại!', 'error')
  } finally {
    submitting.value = false
  }
}

const deleteCategory = async (id) => {
  const productCount = getProductCount(id)
  
  if (productCount > 0) {
    alert(`⚠️ Không thể xóa danh mục này vì còn ${productCount} sản phẩm đang sử dụng!`)
    return
  }

  if (!confirm('⚠️ Bạn có chắc chắn muốn xóa danh mục này?')) {
    return
  }

  try {
    submitting.value = true
    await axios.delete(`${API_BASE_URL}/categories/${id}`)
    showMessage('✅ Xóa danh mục thành công!', 'success')
    await loadCategories()
  } catch (error) {
    console.error('❌ Lỗi xóa:', error)
    showMessage('❌ Không thể xóa danh mục!', 'error')
  } finally {
    submitting.value = false
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
.category-admin-container {
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
  color: #333;
  font-size: 28px;
}

.btn-add {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-add:hover {
  background-color: #218838;
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

.table-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.category-table {
  width: 100%;
  border-collapse: collapse;
}

.category-table thead {
  background-color: #f8f9fa;
}

.category-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
}

.category-table td {
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
}

.type-badge {
  display: inline-block;
  padding: 4px 12px;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.product-count {
  color: #666;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
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

.btn-delete:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #ccc;
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
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
  font-size: 32px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.required {
  color: #e53935;
}

.form-group input,
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
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-group input.error {
  border-color: #e53935;
}

.error-message {
  display: block;
  color: #e53935;
  font-size: 12px;
  margin-top: 5px;
}

.form-group textarea {
  resize: vertical;
}

.message {
  padding: 10px;
  border-radius: 6px;
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
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
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

.btn-cancel:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-add {
    width: 100%;
  }

  .table-container {
    overflow-x: scroll;
  }

  .category-table {
    min-width: 800px;
  }

  .modal-content {
    max-width: 95%;
  }
}
</style>