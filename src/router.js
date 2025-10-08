import { createWebHistory, createRouter } from 'vue-router'

import Home from './component/home.vue'
import Products from './component/Products.vue'
import ProductDetail from './component/ProductDetail.vue'
import Login from './component/Login.vue'
import Admin from './component/admin.vue'
import ProductAdmin from './component/productAdmin.vue'
import NotFound from './component/NotFound.vue'

const routes = [
  { path: '/', component: Home, meta: { isAuth: false } },
  { path: '/products', component: Products, meta: { isAuth: false } },
  { path: '/products/:id', component: ProductDetail, meta: { isAuth: false } },
  { path: '/login', component: Login, meta: { isAuth: false } },
  { path: '/productAdmin', component: ProductAdmin, meta: { isAuth: true } },
  { path: '/admin', component: Admin, meta: { isAuth: true } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global guard kiểm tra đăng nhập
router.beforeEach((to, from, next) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))
  if (to.meta.isAuth && !currentUser) {
    next('/login')
  } else {
    next()
  }
})

export default router
