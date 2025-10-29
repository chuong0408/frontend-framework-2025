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
  <div class="dashboard-wrapper">
    <nav class="navbar">
      <div class="nav-left">
        <router-link to="/admin/products" class="nav-brand">
          🏪 Trang quản trị
        </router-link>

        <div v-if="auth.isAdmin()" class="nav-menu">
          <router-link to="/admin/products" class="nav-link">
            📦 Sản phẩm
          </router-link>
          <router-link to="/admin/categories" class="nav-link">
            📑 Danh mục
          </router-link>
          <router-link to="/admin/orders" class="nav-link">
            🛒 Đơn hàng
          </router-link>
          <router-link to="/admin/users" class="nav-link">
            👥 Người dùng
          </router-link>
          <router-link to="/admin/customers" class="nav-link">
            📊 Khách hàng
          </router-link>
          <router-link to="/admin/reports" class="nav-link">
            📈 Báo cáo
          </router-link>
        </div>
        <div v-if="auth.isAuthenticated && !auth.isAdmin()" class="nav-menu">
          <router-link to="/my-orders" class="nav-link">
            📦 Đơn hàng của tôi
          </router-link>
        </div>
      </div>

      <div class="nav-right">
        <router-link to="/profile" class="nav-link">
          👤 Profile
        </router-link>

        <div v-if="!auth.isAuthenticated" class="auth-buttons">
          <router-link to="/register" class="btn btn-outline">
            Đăng ký
          </router-link>
          <router-link to="/login" class="btn btn-primary">
            Đăng nhập
          </router-link>
        </div>

        <div v-if="auth.isAuthenticated" class="user-section">
          <span class="user-info">
            Xin chào, <strong>{{ auth.user?.username }}</strong>
            <span class="user-role" v-if="auth.isAdmin()">
              (Admin)
            </span>
          </span>
          <button type="button" class="btn btn-logout" @click="logout">
            🚪 Đăng xuất
          </button>
        </div>
      </div>
    </nav>

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
  background-color: #f2f2f2;
  color: #333;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background-color: #e0e0e0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-brand {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.nav-brand:hover {
  background-color: #dcdcdc;
}

.nav-menu {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.nav-link {
  padding: 8px 16px;
  text-decoration: none;
  color: #666;
  border-radius: 6px;
  transition: background-color 0.3s, color 0.3s;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.nav-link:hover {
  background-color: #dcdcdc;
  color: #333;
}

.nav-link.router-link-active {
  background-color: #999;
  color: white;
}

.nav-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.auth-buttons {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s, color 0.3s;
  font-size: 14px;
}

.btn-outline {
  background-color: transparent;
  color: #666;
  border: 1px solid #999;
}

.btn-outline:hover {
  background-color: #999;
  color: white;
}

.btn-primary {
  background-color: #999;
  color: white;
}

.btn-primary:hover {
  background-color: #777;
}

.btn-logout {
  background-color: #b33a3a;
  color: white;
}

.btn-logout:hover {
  background-color: #992d2d;
}

.user-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-info {
  color: #444;
  font-size: 14px;
}

.user-info strong {
  color: #666;
}

.user-role {
  background-color: #ccc;
  color: #333;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 6px;
}

.content {
  padding: 24px;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .nav-left,
  .nav-right {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }

  .nav-menu {
    flex-direction: column;
    width: 100%;
  }

  .nav-link {
    width: 100%;
    text-align: center;
  }

  .user-section {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>