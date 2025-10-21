<template>
    <div class="filter-container">
        <h2> Lọc & Tìm kiếm sản phẩm</h2>

        <!-- Filter Panel -->
        <div class="filter-panel">
            <!-- Search Bar -->
            <div class="search-section">
                <input type="text" v-model="filters.searchText" placeholder=" Tìm kiếm sản phẩm..."
                    class="search-input" />
                <button @click="resetFilters" class="btn-reset"> Đặt lại</button>
            </div>

            <!-- Filter Grid -->
            <div class="filter-grid">
                <!-- Danh mục -->
                <div class="filter-group">
                    <label> Danh mục</label>
                    <select v-model="filters.categoryId">
                        <option value="">Tất cả danh mục</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </option>
                    </select>
                </div>

                <!-- Sắp xếp -->
                <!-- <div class="filter-group">
                    <label>📊 Sắp xếp theo</label>
                    <select v-model="filters.sortBy">
                        <option value="name-asc">Tên A-Z</option>
                        <option value="name-desc">Tên Z-A</option>
                        <option value="price-asc">Giá thấp → cao</option>
                        <option value="price-desc">Giá cao → thấp</option>
                        <option value="discount-desc">Giảm giá nhiều nhất</option>
                        <option value="stock-asc">Tồn kho ít nhất</option>
                        <option value="stock-desc">Tồn kho nhiều nhất</option>
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                    </select>
                </div> -->
            </div>

            <!-- Quick Filters -->
            <div class="quick-filters">
                <label class="checkbox-label">
                    <input type="checkbox" v-model="filters.inStock" />
                    <span> Còn hàng</span>
                </label>

                <label class="checkbox-label">
                    <input type="checkbox" v-model="filters.hasDiscount" />
                    <span> Đang giảm giá</span>
                </label>

                <label class="checkbox-label">
                    <input type="checkbox" v-model="filters.lowStock" />
                    <span>Sắp hết hàng (≤10)</span>
                </label>
            </div>

        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>Đang tải sản phẩm...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredProducts.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>Không tìm thấy sản phẩm nào</h3>
            <p>Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
            <button @click="resetFilters" class="btn-reset-large">
                Xóa tất cả bộ lọc
            </button>
        </div>

        <!-- Products Grid -->
        <div v-else class="products-grid">
            <div v-for="product in filteredProducts" :key="product.id" class="product-card"
                @click="viewProduct(product.id)">
                <div class="product-image">
                    <img :src="getImageUrl(product.images?.[0])" :alt="product.name" @error="handleImageError" />

                    <!-- Badges -->
                    <div class="badges">
                        <span v-if="product.discount > 0" class="badge badge-discount">
                            -{{ product.discount }}%
                        </span>
                        <span v-if="product.quantity === 0" class="badge badge-outofstock">
                            Hết hàng
                        </span>
                        <span v-else-if="product.quantity <= 10" class="badge badge-lowstock">
                            Còn {{ product.quantity }}
                        </span>
                    </div>
                </div>

                <div class="product-info">
                    <h3>{{ product.name }}</h3>

                    <div class="product-category">
                        {{ getCategoryName(product.categoryId) }}
                    </div>

                    <div class="product-price-row">
                        <span class="price">{{ formatPrice(product.discount) }}₫</span>
                        <span :class="['stock', product.quantity > 0 ? 'in-stock' : 'out-stock']">
                            {{ product.quantity > 0 ? `Còn ${product.quantity}` : 'Hết hàng' }}
                        </span>
                    </div>

                    <div v-if="product.discount > 0" class="discount-info">
                        <span class="discount-badge">Giảm {{ product.discount }}%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE_URL = 'http://localhost:3001'

const products = ref([])
const categories = ref([])
const loading = ref(true)

const filters = ref({
    categoryId: '',
    minPrice: null,
    maxPrice: null,
    minStock: null,
    minDiscount: null,
    searchText: '',
    sortBy: 'name-asc',
    inStock: false,
    hasDiscount: false,
    lowStock: false
})

const filteredProducts = computed(() => {
    let result = [...products.value]

    // Lọc theo danh mục
    if (filters.value.categoryId) {
        result = result.filter(p => String(p.categoryId) === String(filters.value.categoryId))
    }

    // Lọc theo giá
    if (filters.value.minPrice !== null && filters.value.minPrice >= 0) {
        result = result.filter(p => (p.discount || 0) >= filters.value.minPrice)
    }
    if (filters.value.maxPrice !== null && filters.value.maxPrice >= 0) {
        result = result.filter(p => (p.discount || 0) <= filters.value.maxPrice)
    }

    // Lọc theo tồn kho tối thiểu
    if (filters.value.minStock !== null && filters.value.minStock >= 0) {
        result = result.filter(p => (p.quantity || 0) >= filters.value.minStock)
    }

    // Lọc theo giảm giá tối thiểu
    if (filters.value.minDiscount !== null && filters.value.minDiscount >= 0) {
        result = result.filter(p => (p.discount || 0) >= filters.value.minDiscount)
    }

    // Lọc theo tìm kiếm
    if (filters.value.searchText) {
        const search = filters.value.searchText.toLowerCase().trim()
        result = result.filter(p =>
            p.name.toLowerCase().includes(search) ||
            getCategoryName(p.categoryId).toLowerCase().includes(search)
        )
    }

    // Quick filters
    if (filters.value.inStock) {
        result = result.filter(p => p.quantity > 0)
    }

    if (filters.value.hasDiscount) {
        result = result.filter(p => (p.discount || 0) > 0)
    }

    if (filters.value.lowStock) {
        result = result.filter(p => p.quantity > 0 && p.quantity <= 10)
    }

    // Sắp xếp
    switch (filters.value.sortBy) {
        case 'name-asc':
            result.sort((a, b) => a.name.localeCompare(b.name))
            break
        case 'name-desc':
            result.sort((a, b) => b.name.localeCompare(a.name))
            break
        case 'price-asc':
            result.sort((a, b) => (a.discount || 0) - (b.discount || 0))
            break
        case 'price-desc':
            result.sort((a, b) => (b.discount || 0) - (a.discount || 0))
            break
        case 'discount-desc':
            result.sort((a, b) => (b.discount || 0) - (a.discount || 0))
            break
        case 'stock-asc':
            result.sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
            break
        case 'stock-desc':
            result.sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
            break
        case 'newest':
            result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            break
        case 'oldest':
            result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
            break
    }

    return result
})

const activeFiltersCount = computed(() => {
    let count = 0
    if (filters.value.categoryId) count++
    if (filters.value.minPrice !== null && filters.value.minPrice > 0) count++
    if (filters.value.maxPrice !== null && filters.value.maxPrice > 0) count++
    if (filters.value.minStock !== null && filters.value.minStock > 0) count++
    if (filters.value.minDiscount !== null && filters.value.minDiscount > 0) count++
    if (filters.value.inStock) count++
    if (filters.value.hasDiscount) count++
    if (filters.value.lowStock) count++
    return count
})

onMounted(async () => {
    await loadData()
})

const loadData = async () => {
    try {
        loading.value = true
        const [resProducts, resCategories] = await Promise.all([
            fetch(`${API_BASE_URL}/products`).then(r => r.json()),
            fetch(`${API_BASE_URL}/categories`).then(r => r.json())
        ])
        products.value = resProducts
        categories.value = resCategories
    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error)
        alert('Không thể tải dữ liệu. Vui lòng thử lại!')
    } finally {
        loading.value = false
    }
}

const resetFilters = () => {
    filters.value = {
        categoryId: '',
        minPrice: null,
        maxPrice: null,
        minStock: null,
        minDiscount: null,
        searchText: '',
        sortBy: 'name-asc',
        inStock: false,
        hasDiscount: false,
        lowStock: false
    }
}

const viewProduct = (productId) => {
    router.push(`/products/${productId}`)
}

const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/200'
    return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`
}

const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/200?text=No+Image'
}

const getCategoryName = (id) => {
    return categories.value.find(c => String(c.id) === String(id))?.name || 'N/A'
}

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0)
}
</script>

<style scoped>
.filter-container {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
}

h2 {
    margin-bottom: 25px;
    color: #333;
    font-size: 28px;
    font-weight: 700;
}

.filter-panel {
    background: white;
    padding: 25px;
    border-radius: 12px;
    margin-bottom: 30px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.search-section {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
}

.search-input {
    flex: 1;
    padding: 12px 20px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 15px;
    transition: border-color 0.3s;
}

.search-input:focus {
    outline: none;
    border-color: #007bff;
}

.btn-reset {
    padding: 12px 24px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    transition: background-color 0.3s;
}

.btn-reset:hover {
    background: #5a6268;
}

.filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-group label {
    font-weight: 600;
    color: #555;
    font-size: 14px;
}

.filter-group select,
.filter-group input {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.3s;
}

.filter-group select:focus,
.filter-group input:focus {
    outline: none;
    border-color: #007bff;
}

.quick-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 15px 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    margin-bottom: 15px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #555;
}

.checkbox-label input {
    cursor: pointer;
    width: 18px;
    height: 18px;
}

.checkbox-label:hover {
    color: #333;
}

.active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    margin-bottom: 15px;
}

.filter-label {
    font-weight: 600;
    color: #666;
    font-size: 14px;
}

.filter-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: #e3f2fd;
    color: #1976d2;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
}

.filter-tag button {
    background: none;
    border: none;
    color: #1976d2;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
}

.filter-tag button:hover {
    opacity: 0.7;
}

.btn-clear-all {
    padding: 6px 12px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: background-color 0.3s;
}

.btn-clear-all:hover {
    background: #c82333;
}

.result-summary {
    color: #666;
    font-size: 15px;
}

.result-summary strong {
    color: #007bff;
    font-size: 18px;
}

.loading {
    text-align: center;
    padding: 80px 20px;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.empty-state {
    text-align: center;
    padding: 80px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
    font-size: 80px;
    margin-bottom: 20px;
}

.empty-state h3 {
    margin: 0 0 10px;
    color: #333;
    font-size: 24px;
}

.empty-state p {
    color: #666;
    font-size: 16px;
    margin-bottom: 30px;
}

.btn-reset-large {
    padding: 12px 32px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: background-color 0.3s;
}

.btn-reset-large:hover {
    background: #0056b3;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 24px;
}

.product-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.product-image {
    height: 220px;
    background: #f5f5f5;
    position: relative;
    overflow: hidden;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.product-card:hover .product-image img {
    transform: scale(1.05);
}

.badges {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.badge {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 700;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.badge-discount {
    background: #e53935;
    color: white;
}

.badge-outofstock {
    background: #666;
    color: white;
}

.badge-lowstock {
    background: #ff9800;
    color: white;
}

.product-info {
    padding: 16px;
}

.product-info h3 {
    margin: 0 0 10px;
    font-size: 16px;
    color: #333;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 38px;
}

.product-category {
    display: inline-block;
    padding: 4px 10px;
    background: #f0f0f0;
    border-radius: 12px;
    font-size: 12px;
    color: #666;
    margin-bottom: 10px;
}

.product-price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.price {
    color: #e53935;
    font-weight: 700;
    font-size: 20px;
}

.stock {
    font-size: 13px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 4px;
}

.in-stock {
    background: #d4edda;
    color: #155724;
}

.out-stock {
    background: #f8d7da;
    color: #721c24;
}

.discount-info {
    display: flex;
    gap: 8px;
}

.discount-badge {
    padding: 4px 10px;
    background: #fff3cd;
    color: #856404;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

@media (max-width: 768px) {
    .filter-grid {
        grid-template-columns: 1fr;
    }

    .search-section {
        flex-direction: column;
    }

    .quick-filters {
        flex-direction: column;
        gap: 10px;
    }

    .active-filters {
        flex-direction: column;
        align-items: flex-start;
    }

    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
}
</style>