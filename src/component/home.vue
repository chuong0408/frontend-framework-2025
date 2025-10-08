<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'

import { useRouter } from 'vue-router'
const router = useRouter();
const isLoggedIn = ref(!!localStorage.getItem('currentUser'))

const logout = () => {
    localStorage.removeItem('currentUser')
    isLoggedIn.value = false
    router.push('/')
}


</script>
<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div class="container-fluid">
            <router-link class="navbar-brand fw-bold" to="/">Trang chủ</router-link>
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <router-link class="nav-link" to="/profile">Profile</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/posts">Post</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/products">Product</router-link>
                    </li>
                </ul>
                <div class="d-flex">
                    <router-link v-if="!isLoggedIn" class="btn btn-outline-primary me-2" to="/login">Login</router-link>
                    <button v-else @click="logout" class="btn btn-danger">Đăng xuất</button>
                </div>
            </div>
        </div>
    </nav>
</template>

<style scoped>
/* Tổng thể navbar */
.navbar {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid #e2e8f0;
    background-color: #ffffff;
    padding: 12px 24px;
}

/* Logo / thương hiệu */
.navbar-brand {
    font-size: 1.5rem;
    color: #0d6efd;
    transition: color 0.3s ease;
}

.navbar-brand:hover {
    color: #0a58ca;
}

/* Menu điều hướng */
.nav-link {
    font-weight: 500;
    color: #495057;
    margin-right: 16px;
    transition: color 0.3s ease;
}

.nav-link:hover {
    color: #0d6efd;
}

/* Nút đăng nhập / đăng xuất */
.btn {
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 6px;
}

.btn-outline-primary {
    border-color: #0d6efd;
    color: #0d6efd;
}

.btn-outline-primary:hover {
    background-color: #0d6efd;
    color: #fff;
}

.btn-danger {
    background-color: #dc3545;
    border: none;
}

.btn-danger:hover {
    background-color: #bb2d3b;
}

/* Responsive fix nếu cần */
@media (max-width: 768px) {
    .navbar-nav {
        flex-direction: column;
        gap: 10px;
    }

    .d-flex {
        flex-direction: column;
        gap: 10px;
    }
}
</style>