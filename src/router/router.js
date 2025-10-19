import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import ProductList from '../components/ProductList.vue'
import ProductForm from '../components/ProductForm.vue'
import ProductDetail from '../components/ProductDetail.vue'
import UserAdmin from '../components/UserAdmin.vue'
import OrderAdmin from '../components/OrderAdmin.vue'
import { auth } from '../store/auth'
import Checkout from '../views/Checkout.vue'
import Register from '../views/Register.vue'

const routes = [
  // Trang chủ
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  // Profile
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  // Giỏ hàng
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/Cart.vue')
  },
  // Checkout
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout
  },
  // Danh sách sản phẩm (dùng chung cho cả Admin và User)
  {
    path: '/products',
    name: 'ProductsPublic',
    component: ProductList
  },
  // Chi tiết sản phẩm (dùng chung)
  {
    path: '/products/:id',
    name: 'ProductDetailPublic',
    component: ProductDetail
  },
  // 🆕 Yêu thích
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('../views/Favorites.vue'),
    meta: { requiresAuth: true }
  },
  // 🆕 Lọc sản phẩm
  {
    path: '/products/filter',
    name: 'ProductFilter',
    component: () => import('../components/ProductFilter.vue')
  },

  // Routes dành cho ADMIN
  {
    path: '/admin',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    },
    children: [
      {
        path: '',
        redirect: '/admin/products'
      },
      {
        path: 'products',
        component: ProductList,
        name: 'ProductListAdmin',
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'products/add',
        component: ProductForm,
        name: 'ProductAdd',
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'products/edit/:id',
        component: ProductForm,
        name: 'ProductEdit',
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'products/detail/:id',
        component: ProductDetail,
        name: 'ProductDetailAdmin',
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'users',
        component: UserAdmin,
        name: 'UserAdmin',
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'orders',
        component: OrderAdmin,
        name: 'OrderAdmin',
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      // 🆕 Thống kê khách hàng
      {
        path: 'customers',
        name: 'CustomerStats',
        component: () => import('../components/CustomerStats.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      // 🆕 Báo cáo
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('../views/Reports.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      }
    ]
  },
  // Đơn hàng của user
  {
    path: '/my-orders',
    name: 'MyOrders',
    component: () => import('../views/MyOrders.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login')
    return
  }

  if (to.meta.requiresAdmin && !auth.isAdmin()) {
    alert('Bạn không có quyền truy cập trang này!')
    next('/')
    return
  }

  if ((to.path === '/login' || to.path === '/register') && auth.isAuthenticated) {
    if (auth.isAdmin()) {
      next('/admin/products')
    } else {
      next('/')
    }
    return
  }

  next()
})

export default router