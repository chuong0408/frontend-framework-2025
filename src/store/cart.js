// src/store/cart.js
import { reactive, computed } from 'vue'

export const cart = reactive({
    items: [],
    init() {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            this.items = JSON.parse(savedCart)
        }
    },

    saveToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.items))
    },

    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id)

        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                image: product.images?.[0] || '',
                discount: product.discount || 0,
                quantity: quantity,
                categoryId: product.categoryId
            })
        }

        this.saveToStorage()
    },

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId)
        if (item) {
            item.quantity = Math.max(1, quantity)
            this.saveToStorage()
        }
    },

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId)
        this.saveToStorage()
    },

    clearCart() {
        this.items = []
        this.saveToStorage()
    },

    get totalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0)
    },

    get totalPrice() {
        return this.items.reduce((sum, item) => {
            const price = item.discount || 0
            return sum + (price * item.quantity)
        }, 0)
    }
})

cart.init()