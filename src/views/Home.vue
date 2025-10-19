<template>
  <div class="home-container">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand">
        <router-link to="/">Trang chủ</router-link>
      </div>

      <div class="nav-menu">
        <router-link to="/products" class="nav-link">
          Sản phẩm
        </router-link>
        <router-link v-if="auth.isAuthenticated" to="/favorites" class="nav-link">
        Yêu thích
        </router-link>
        <router-link to="/cart" class="nav-link cart-link">
          Giỏ hàng
          <span v-if="cart.totalItems > 0" class="cart-badge">
            {{ cart.totalItems }}
          </span>
        </router-link>

        <!-- chua dang nhap -->
        <div v-if="!auth.isAuthenticated" class="auth-buttons">
          <router-link to="/register" class="btn btn-outline">
            Đăng ký
          </router-link>
          <router-link to="/login" class="btn btn-primary">
            Đăng nhập
          </router-link>
        </div>

        <!-- đăng nhập -->
        <div v-else class="user-menu">
          <router-link to="/profile" class="nav-link">
            {{ auth.user?.username || auth.user?.userName }}
          </router-link>

          <router-link v-if="auth.isAdmin()" to="/admin/products" class="nav-link admin-link">
            Quản trị
          </router-link>

          <button @click="logout" class="btn btn-logout">
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
    <div class="hero-section">
      <div class="hero-content">
        <router-link to="/products" class="btn-hero">
          Xem sản phẩm ngay →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { auth } from '../store/auth'
import { cart } from '../store/cart'
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    auth.logout()
    cart.clearCart()
    router.push('/login')
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand a {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-brand a:hover {
  color: #007bff;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-link {
  padding: 8px 16px;
  text-decoration: none;
  color: #666;
  border-radius: 6px;
  transition: all 0.3s;
  font-weight: 500;
  position: relative;
}

.nav-link:hover {
  background-color: #f5f5f5;
  color: #333;
}

.cart-link {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: 2px;
  right: 6px;
  background-color: #e53935;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

.auth-buttons,
.user-menu {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.btn-outline {
  background: transparent;
  color: #666;
  border: 1px solid #999;
}

.btn-outline:hover {
  background-color: #999;
  color: white;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-logout {
  background-color: #dc3545;
  color: white;
}

.btn-logout:hover {
  background-color: #c82333;
}

.admin-link {
  background-color: #ffc107;
  color: #000;
}

.admin-link:hover {
  background-color: #e0a800;
  color: #000;
}

/* Hero Section */
.hero-section {
  padding: 100px 20px;
  text-align: center;
}

.hero-content h1 {
  font-size: 48px;
  margin-bottom: 20px;
  color: #333;
  font-weight: 700;
}

.hero-content p {
  font-size: 20px;
  color: #666;
  margin-bottom: 40px;
}

.btn-hero {
  display: inline-block;
  padding: 15px 40px;
  background-color: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-hero:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
}

/* Features */
.features {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  font-size: 50px;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #333;
  font-weight: 600;
}

.feature-card p {
  color: #666;
  font-size: 15px;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }

  .nav-menu {
    flex-direction: column;
    width: 100%;
  }

  .nav-link,
  .btn {
    width: 100%;
    text-align: center;
  }

  .auth-buttons,
  .user-menu {
    flex-direction: column;
    width: 100%;
  }

  .hero-content h1 {
    font-size: 32px;
  }

  .hero-content p {
    font-size: 16px;
  }

  .features {
    grid-template-columns: 1fr;
  }
}
</style>