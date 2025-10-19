import { reactive } from 'vue'

export const favorites = reactive({
  items: [],
  
  init() {
    const saved = localStorage.getItem('favorites')
    if (saved) {
      this.items = JSON.parse(saved)
    }
  },
  
  save() {
    localStorage.setItem('favorites', JSON.stringify(this.items))
  },
  
  add(productId) {
    if (!this.items.includes(productId)) {
      this.items.push(productId)
      this.save()
    }
  },
  
  remove(productId) {
    this.items = this.items.filter(id => id !== productId)
    this.save()
  },
  
  toggle(productId) {
    if (this.isFavorite(productId)) {
      this.remove(productId)
    } else {
      this.add(productId)
    }
  },
  
  isFavorite(productId) {
    return this.items.includes(productId)
  },
  
  clear() {
    this.items = []
    this.save()
  }
})

favorites.init()