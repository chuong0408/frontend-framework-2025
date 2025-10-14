<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../store/auth'

const router = useRouter()
const user = ref(null)
const isEditing = ref(false)
const message = ref('')
const loading = ref(false)

// Form data
const formData = ref({
  userName: '',
  fullName: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Load thông tin user
onMounted(async () => {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    loading.value = true
    // Lấy thông tin user từ API
    const response = await fetch(`http://localhost:3001/users?userName=${auth.user.username}`)
    const users = await response.json()
    
    if (users.length > 0) {
      user.value = users[0]
      formData.value.userName = user.value.userName
      formData.value.fullName = user.value.fullName || ''
      formData.value.email = user.value.email || ''
    }
  } catch (error) {
    console.error('Lỗi load user:', error)
    message.value = 'Không thể tải thông tin người dùng'
  } finally {
    loading.value = false
  }
})

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  message.value = ''
  // Reset password fields
  formData.value.currentPassword = ''
  formData.value.newPassword = ''
  formData.value.confirmPassword = ''
}

const handleUpdate = async () => {
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (formData.value.email && !emailRegex.test(formData.value.email)) {
    message.value = 'Email không hợp lệ'
    return
  }

  // Nếu muốn đổi mật khẩu
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

    // Cập nhật thông tin
    const updatedUser = {
      ...user.value,
      fullName: formData.value.fullName,
      email: formData.value.email,
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
      
      // Cập nhật auth store
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
</script>

<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar">
          {{ user?.userName?.charAt(0).toUpperCase() || 'U' }}
        </div>
        <h2>Thông tin cá nhân</h2>
      </div>

      <div v-if="loading" class="loading">Đang tải...</div>

      <div v-else-if="user" class="profile-content">
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
            <label>Mật khẩu:</label>
            <p>••••••••</p>
          </div>

          <div class="button-group">
            <button class="btn-edit" @click="toggleEdit">
              Chỉnh sửa
            </button>
            <button class="btn-logout" @click="handleLogout">
              Đăng xuất
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
              {{ loading ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
            <button class="btn-cancel" @click="toggleEdit" :disabled="loading">
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 600px;
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
  margin: 0;
  font-size: 24px;
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

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-group input:focus {
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

/* Responsive */
@media (max-width: 640px) {
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
}
</style>