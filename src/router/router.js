import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import ProductList from '../components/ProductList.vue'
import ProductForm from '../components/ProductForm.vue'
import ProductDetail from '../components/ProductDetail.vue'
import UserAdmin from '../components/UserAdmin.vue'
import { auth } from '../store/auth'
import Register from '../views/Register.vue'

const routes = [
  // Trang chủ cho tất cả người dùng (kể cả chưa đăng nhập)
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
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
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
        name: 'ProductList',
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
        name: 'ProductDetail',
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      // Quản lý người dùng
      {
        path: 'users',
        component: UserAdmin,
        name: 'UserAdmin',
        meta: { requiresAuth: true, requiresAdmin: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  console.log('Navigating to:', to.path)
  console.log('User authenticated:', auth.isAuthenticated)
  console.log('User role:', auth.user?.role)

  // Nếu chưa đăng nhập và cố truy cập route yêu cầu auth
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    console.log('Not authenticated, redirecting to login')
    next('/login')
    return
  }

  // Nếu không phải admin và cố truy cập route admin
  if (to.meta.requiresAdmin && !auth.isAdmin()) {
    console.log('Not admin, access denied')
    alert('Bạn không có quyền truy cập trang này!')
    next('/')
    return
  }

  // Nếu đã đăng nhập và cố truy cập login/register
  if ((to.path === '/login' || to.path === '/register') && auth.isAuthenticated) {
    console.log('Already logged in, redirecting based on role')
    // Admin -> trang quản trị, User -> trang chủ
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