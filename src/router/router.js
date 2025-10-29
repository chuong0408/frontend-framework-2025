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
import ProductFilter from '../components/ProductFilter.vue'

const routes = [
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
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/Cart.vue')
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout
  },
  {
    path: '/products',
    name: 'ProductsPublic',
    component: ProductFilter
  },
  {
    path: '/products/:id',
    name: 'ProductDetailPublic',
    component: ProductDetail
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('../views/Favorites.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products/filter',
    name: 'ProductFilter',
    component: () => import('../components/ProductFilter.vue')
  },
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
      {
        path: 'customers',
        name: 'CustomerStats',
        component: () => import('../components/CustomerStats.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('../views/Reports.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      }, {
        path: 'categories',
        component: () => import('../components/CategoryAdmin.vue'),
        name: 'CategoryAdmin',
        meta: { requiresAuth: true, requiresAdmin: true }
      }
    ]
  },
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