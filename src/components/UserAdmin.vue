<template>
    <div class="user-admin-container">
        <div class="header">
            <h2>Quản lý tài khoản người dùng</h2>
            <!-- <button @click="showAddForm = true" class="btn-add">+ Thêm người dùng</button> -->
        </div>

        <div v-if="loading" class="loading">
            <p>⏳ Đang tải dữ liệu...</p>
        </div>

        <div v-else>
            <div class="table-container">
                <table class="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên đăng nhập</th>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.id">
                            <td>{{ user.id }}</td>
                            <td>{{ user.userName }}</td>
                            <td>{{ user.fullName || 'Chưa cập nhật' }}</td>
                            <td>{{ user.email || 'Chưa cập nhật' }}</td>
                            <td>
                                <span :class="['badge', user.role === 'admin' ? 'badge-admin' : 'badge-user']">
                                    {{ user.role === 'admin' ? 'Admin' : 'User' }}
                                </span>
                            </td>
                            <td>
                                <div class="actions">
                                    <button @click="editUser(user)" class="btn-edit"> Sửa</button>
                                    <button @click="deleteUser(user.id)" class="btn-delete"
                                        :disabled="user.role === 'admin'">
                                         Xóa
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="showAddForm || editingUser" class="modal-overlay" @click="closeForm">
                <div class="modal-content" @click.stop>
                    <div class="modal-header">
                        <h3>{{ editingUser ? 'Sửa thông tin người dùng' : 'Thêm người dùng mới' }}</h3>
                        <button @click="closeForm" class="btn-close">×</button>
                    </div>

                    <div class="modal-body">
                        <div class="form-group">
                            <label>Tên đăng nhập (*)</label>
                            <input v-model="formData.userName" type="text" :disabled="!!editingUser"
                                placeholder="Nhập tên đăng nhập" />
                        </div>

                        <div class="form-group">
                            <label>Họ và tên</label>
                            <input v-model="formData.fullName" type="text" placeholder="Nhập họ tên" />
                        </div>

                        <div class="form-group">
                            <label>Email (*)</label>
                            <input v-model="formData.email" type="email" placeholder="Nhập email" />
                        </div>

                        <div class="form-group" v-if="!editingUser">
                            <label>Mật khẩu (*)</label>
                            <input v-model="formData.password" type="password" placeholder="Nhập mật khẩu" />
                        </div>

                        <div class="form-group">
                            <label>Vai trò</label>
                            <select v-model="formData.role">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <p v-if="message" :class="['message', messageType]">{{ message }}</p>

                        <div class="modal-actions">
                            <button @click="submitUser" class="btn-save" :disabled="loading">
                                {{ loading ? 'Đang xử lý...' : (editingUser ? 'Cập nhật' : 'Thêm mới') }}
                            </button>
                            <button @click="closeForm" class="btn-cancel">Hủy</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { auth } from '../store/auth'

const API_BASE_URL = 'http://localhost:3001'

const users = ref([])
const loading = ref(false)
const showAddForm = ref(false)
const editingUser = ref(null)
const message = ref('')
const messageType = ref('')
const currentUserId = ref(null)

const formData = ref({
    userName: '',
    fullName: '',
    email: '',
    password: '',
    role: 'user'
})

onMounted(async () => {
    await loadUsers()
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    currentUserId.value = userData.id
})

const loadUsers = async () => {
    try {
        loading.value = true
        const response = await axios.get(`${API_BASE_URL}/users`)
        users.value = response.data
    } catch (error) {
        console.error('Lỗi tải danh sách:', error)
        showMessage('Không thể tải danh sách người dùng', 'error')
    } finally {
        loading.value = false
    }
}

const editUser = (user) => {
    editingUser.value = user
    formData.value = {
        userName: user.userName,
        fullName: user.fullName || '',
        email: user.email || '',
        password: user.password,
        role: user.role
    }
}

const closeForm = () => {
    showAddForm.value = false
    editingUser.value = null
    formData.value = {
        userName: '',
        fullName: '',
        email: '',
        password: '',
        role: 'user'
    }
    message.value = ''
}

const submitUser = async () => {
    if (!formData.value.userName || !formData.value.email) {
        showMessage('Vui lòng điền đầy đủ thông tin bắt buộc', 'error')
        return
    }

    if (!editingUser.value && !formData.value.password) {
        showMessage('Vui lòng nhập mật khẩu', 'error')
        return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.value.email)) {
        showMessage('Email không hợp lệ', 'error')
        return
    }

    try {
        loading.value = true

        if (editingUser.value) {
            await axios.put(`${API_BASE_URL}/users/${editingUser.value.id}`, {
                ...editingUser.value,
                ...formData.value
            })
            showMessage('Cập nhật thành công!', 'success')
        } else {
            const checkResponse = await axios.get(`${API_BASE_URL}/users?userName=${formData.value.userName}`)
            if (checkResponse.data.length > 0) {
                showMessage('Tên đăng nhập đã tồn tại', 'error')
                loading.value = false
                return
            }

            await axios.post(`${API_BASE_URL}/users`, formData.value)
            showMessage('Thêm người dùng thành công!', 'success')
        }

        await loadUsers()
        setTimeout(() => {
            closeForm()
        }, 1500)
    } catch (error) {
        console.error('Lỗi:', error)
        showMessage('Có lỗi xảy ra. Vui lòng thử lại!', 'error')
    } finally {
        loading.value = false
    }
}

const deleteUser = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return

    try {
        loading.value = true
        await axios.delete(`${API_BASE_URL}/users/${id}`)
        showMessage('Xóa người dùng thành công!', 'success')
        await loadUsers()
    } catch (error) {
        console.error('Lỗi xóa:', error)
        showMessage('Không thể xóa người dùng', 'error')
    } finally {
        loading.value = false
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
.user-admin-container {
    max-width: 1200px;
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
    color: #333;
}

.btn-add {
    padding: 10px 20px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
}

.btn-add:hover {
    background-color: #218838;
}

.loading {
    text-align: center;
    padding: 40px;
    color: #666;
}

.table-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.user-table {
    width: 100%;
    border-collapse: collapse;
}

.user-table thead {
    background-color: #f8f9fa;
}

.user-table th {
    padding: 15px;
    text-align: left;
    font-weight: 600;
    color: #555;
    border-bottom: 2px solid #dee2e6;
}

.user-table td {
    padding: 15px;
    border-bottom: 1px solid #dee2e6;
}

.badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.badge-admin {
    background-color: #ffc107;
    color: #000;
}

.badge-user {
    background-color: #17a2b8;
    color: white;
}

.actions {
    display: flex;
    gap: 8px;
}

.actions button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
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
}

.modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
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
}

.btn-close {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #999;
}

.btn-close:hover {
    color: #333;
}

.modal-body {
    padding: 20px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #555;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
}

.form-group input:disabled {
    background-color: #f5f5f5;
}

.message {
    padding: 10px;
    border-radius: 4px;
    margin: 15px 0;
    text-align: center;
}

.message.success {
    background-color: #d4edda;
    color: #155724;
}

.message.error {
    background-color: #f8d7da;
    color: #721c24;
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
    font-weight: 500;
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
</style>