<script setup>
import { auth } from '../store/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const logout = () => {
    auth.logout()
    router.push('/login')
}
</script>

<template>
    <div>
        <nav>
            <div>
                <router-link to="/admin/products" class="btn btn-success">
                    Trang chủ
                </router-link>
                <router-link to="/profile">
                    <i class="icon-user"></i> Profile
                </router-link>
            </div>
            
            <!-- Sửa: Bỏ () sau isAuthenticated -->
            <div v-if="!auth.isAuthenticated">
                <router-link to="/register" class="btn btn-primary">
                    Đăng ký
                </router-link>
            </div>
            
            <div v-if="!auth.isAuthenticated">
                <router-link to="/login" class="btn btn-primary">
                    Đăng nhập
                </router-link>
            </div>

            <div v-if="auth.isAuthenticated">
                <span class="user-info">Xin chào, {{ auth.user?.username }}</span>
                <button type="button" class="btn btn-light" @click="logout">
                    Đăng xuất
                </button>
            </div>
        </nav>

        <router-view />
    </div>
</template>

<style scoped>
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background: #f8f9fa;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

nav > div {
    display: flex;
    gap: 10px;
    align-items: center;
}

.btn {
    padding: 8px 16px;
    text-decoration: none;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-success {
    background-color: #28a745;
    color: white;
}

.btn-success:hover {
    background-color: #218838;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-primary:hover {
    background-color: #0056b3;
}

.btn-light {
    background-color: #f8f9fa;
    color: #333;
    border: 1px solid #ddd;
}

.btn-light:hover {
    background-color: #e2e6ea;
}

.user-info {
    margin-right: 10px;
    color: #333;
    font-weight: 500;
}

.icon-user {
    margin-right: 5px;
}

a {
    color: inherit;
    text-decoration: none;
}

a:hover {
    opacity: 0.8;
}
</style>