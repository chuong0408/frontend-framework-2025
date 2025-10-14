<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'

const products = ref([])

const product = reactive({
    id: '',
    title: '',
    price: '',
    image: '',
    category: '',
    description: ''
})

onMounted(async () => {
    console.log(`the component is now mounted.`)
    const response = await axios.get('http://localhost:3000/products');
    if (response.status == 200) {
        products.value = response.data
    }
})

const handleDelete = async (id) => {
    const isConfirm = confirm(`Ban co muon xoa id = ${id} nay khong`)
    if (isConfirm) {
        const response = await axios.delete(`http://localhost:3000/products/${id}`);
        if (response.status == 200) {
            loadDuLieu()
            alert('xoá thành công')
        }

    }
}
const loadDuLieu = async () => {
    console.log(`the component is now mounted.`)
    const response = await axios.get('http://localhost:3000/products');
    if (response.status == 200) {
        products.value = response.data
    }
}
const handleSubmit = async () => {
    if (
        product.title === "" ||
        product.price === "" ||
        product.category === "" ||
        product.image === "" ||
        product.description === ""
    ) {
        alert('Du lieu khong duoc de trong')
        return
    }
    const payload = {
        title: product.title,
        price: product.price,
        category: product.category,
        image: product.image,
        description: product.description,
        creator: 'admin',
        tags: 'news'
    }
    let response
    if (product.id) {
        response = await axios.put(`http://localhost:3000/products/${product.id}`, payload)
        if (response.status == 200) {
            loadDuLieu()
            clearData()
            alert('Da cap nhat thanh cong')
        }
    } else {
        response = await axios.post('http://localhost:3000/products', payload)
        if (response.status == 201) {
            loadDuLieu()
            clearData()
            alert('them thanh cong')
        }
    }
}
const clearData = () => {
    Object.assign(product, {
        id: '',
        title: '',
        price: '',
        image: '',
        category: '',
        description: ''
    })
}

const handleEdit = (item) => {
    Object.assign(product, {
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category,
        description: item.description
    })
}

</script>
<template>
    <header class="py-4 bg-white border-bottom mb-4">
        <div class="container d-flex align-items-center justify-content-between">
            <router-link :to="`/admin`">
                <h2 class="h5 mb-1">Quay Lai</h2>
            </router-link>
        </div>
    </header>

    <main class="container pb-5">
        <div class="row g-4">
            <!-- Products list -->
            <section class="col-lg-8">
                <div class="card shadow-sm">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span class="fw-semibold">Products</span>
                        <small class="text-secondary">Simple static list (no JavaScript)</small>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th style="width:80px">Image</th>
                                        <th>Title</th>
                                        <th style="width:140px">Category</th>
                                        <th style="width:120px" class="text-end">Price</th>
                                        <th style="width:120px" class="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody v-for="item in products" :key="item.id">
                                    <tr>
                                        <td><img :src="item.image" alt="Products" class="post-thumb w-100 w-sm-auto" />
                                        </td>
                                        <td>{{ item.title }}</td>
                                        <td><span class="badge text-bg-dark">{{ item.category }}</span></td>
                                        <td class="text-end">{{ item.price }}$</td>
                                        <button @click="handleEdit(item)"
                                            class="btn btn-sm btn-outline-secondary">Edit</button>
                                        <button @click="handleDelete(item.id)"
                                            class="btn btn-sm btn-outline-secondary">Delete</button>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Edit form -->
            <aside class="col-lg-4">
                <div class="card shadow-sm sticky-col" id="editForm">
                    <div class="card-header">Edit Product</div>
                    <div class="card-body">
                        <form action="#" method="post" @submit.prevent="handleSubmit">
                            <div class="mb-3">
                                <label for="pTitle" class="form-label">Title</label>
                                <input type="text" v-model="product.title" class="form-control" id="pTitle" name="title"
                                    placeholder="Product title" required>
                            </div>
                            <div class="mb-3">
                                <label for="pPrice" class="form-label">Price (USD)</label>
                                <input type="number" v-model="product.price" class="form-control" id="pPrice"
                                    name="price" step="0.01" min="0" placeholder="0.00" required>
                            </div>
                            <div class="mb-3">
                                <label for="pCategory" class="form-label">Category</label>
                                <select v-model="product.category" id="pCategory" class="form-select" name="category"
                                    required>
                                    <option value="" selected>Choose...</option>
                                    <option>Electronics</option>
                                    <option>Home</option>
                                    <option>Fashion</option>
                                    <option>Sports</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="pImage" class="form-label">Image URL</label>
                                <input type="url" v-model="product.image" class="form-control" id="pImage" name="image"
                                    placeholder="https://example.com/image.jpg" required>
                            </div>
                            <div class="mb-3">
                                <label for="pDesc" class="form-label">Description</label>
                                <textarea id="pDesc" v-model="product.description" class="form-control"
                                    name="description" rows="3" placeholder="Short product description"
                                    required></textarea>
                            </div>

                            <div class="d-flex gap-2">
                                <button type="submit" class="btn btn-primary">Save</button>
                                <button type="reset" class="btn btn-outline-secondary">Reset</button>
                            </div>

                            <!-- Optional hidden id field if your backend needs it -->
                            <input type="hidden" name="id" value="">
                        </form>
                    </div>
                </div>
            </aside>
        </div>
    </main>

    <footer class="py-4 bg-dark text-white">
        <div class="container d-flex flex-wrap justify-content-between align-items-center gap-3">
            <span>© <span id="year">2025</span> MyShop</span>
            <a class="btn btn-outline-light btn-sm" href="#top">Back to top</a>
        </div>
    </footer>
</template>

<style scoped></style>