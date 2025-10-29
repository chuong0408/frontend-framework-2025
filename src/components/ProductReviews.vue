<template>
  <div class="reviews-container">
    <div class="reviews-header">
      <h3> Đánh giá sản phẩm</h3>
      <div class="rating-summary">
        <div class="average-rating">
          <span class="rating-number">{{ averageRating.toFixed(1) }}</span>
          <div class="stars">{{ getStars(averageRating) }}</div>
          <span class="total-reviews">({{ reviews.length }} đánh giá)</span>
        </div>
      </div>
    </div>

    <div v-if="canReview" class="review-form">
      <h4> Viết đánh giá của bạn</h4>
      
      <div class="rating-input">
        <label>Chọn số sao:</label>
        <div class="stars-input">
          <button 
            v-for="star in 5" 
            :key="star"
            @click="newReview.rating = star"
            :class="['star-btn', { active: star <= newReview.rating }]"
          >
            {{ star <= newReview.rating ? '⭐' : '☆' }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>Nhận xét:</label>
        <textarea 
          v-model="newReview.comment"
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
          rows="4"
        ></textarea>
      </div>

      <button @click="submitReview" class="btn-submit" :disabled="!isValid">
        Gửi đánh giá
      </button>
    </div>

    <div v-else class="login-prompt">
      <p>Vui lòng <router-link to="/login">đăng nhập</router-link> để đánh giá sản phẩm</p>
    </div>

    <div class="reviews-list">
      <div v-if="reviews.length === 0" class="no-reviews">
        <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
      </div>

      <div v-else>
        <div v-for="review in sortedReviews" :key="review.id" class="review-item">
          <div class="review-header">
            <div class="user-info">
              <div class="avatar">{{ review.userName.charAt(0).toUpperCase() }}</div>
              <div>
                <strong>{{ review.userName }}</strong>
                <div class="stars">{{ getStars(review.rating) }}</div>
              </div>
            </div>
            <span class="review-date">{{ formatDate(review.createdAt) }}</span>
          </div>
          
          <p class="review-comment">{{ review.comment }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { auth } from '../store/auth'
import axios from 'axios'

const route = useRoute()
const API_BASE_URL = 'http://localhost:3001'

const props = defineProps({
  productId: {
    type: String,
    required: true
  }
})

const reviews = ref([])
const newReview = ref({
  rating: 5,
  comment: ''
})

const canReview = computed(() => auth.isAuthenticated)

const isValid = computed(() => {
  return newReview.value.rating > 0 && newReview.value.comment.trim().length > 0
})

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return sum / reviews.value.length
})

const sortedReviews = computed(() => {
  return [...reviews.value].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )
})

onMounted(async () => {
  await loadReviews()
})

const loadReviews = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/reviews?productId=${props.productId}`
    )
    reviews.value = response.data
  } catch (error) {
    console.error('Lỗi tải đánh giá:', error)
  }
}

const submitReview = async () => {
  if (!isValid.value) return

  try {
    const review = {
      productId: props.productId,
      userId: auth.user?.id,
      userName: auth.user?.fullName || auth.user?.username,
      rating: newReview.value.rating,
      comment: newReview.value.comment,
      createdAt: new Date().toISOString()
    }

    await axios.post(`${API_BASE_URL}/reviews`, review)
    
    alert('✅ Cảm ơn bạn đã đánh giá!')
    
    newReview.value = {
      rating: 5,
      comment: ''
    }
    
    await loadReviews()
  } catch (error) {
    console.error('Lỗi gửi đánh giá:', error)
    alert('Có lỗi xảy ra. Vui lòng thử lại!')
  }
}

const getStars = (rating) => {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5 ? 1 : 0
  const emptyStars = 5 - fullStars - halfStar
  
  return '⭐'.repeat(fullStars) + 
         (halfStar ? '⭐' : '') + 
         '☆'.repeat(emptyStars)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.reviews-container {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 2px solid #eee;
}

.reviews-header {
  margin-bottom: 30px;
}

.reviews-header h3 {
  margin: 0 0 15px;
  font-size: 24px;
  color: #333;
}

.rating-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
}

.average-rating {
  display: flex;
  align-items: center;
  gap: 15px;
}

.rating-number {
  font-size: 48px;
  font-weight: 700;
  color: #ffc107;
}

.stars {
  font-size: 24px;
}

.total-reviews {
  color: #666;
  font-size: 14px;
}

.review-form {
  background: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 30px;
}

.review-form h4 {
  margin: 0 0 20px;
  color: #333;
}

.rating-input {
  margin-bottom: 20px;
}

.rating-input label {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
  color: #555;
}

.stars-input {
  display: flex;
  gap: 8px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 0;
}

.star-btn:hover {
  transform: scale(1.2);
}

.star-btn.active {
  color: #ffc107;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #555;
}

.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.btn-submit {
  padding: 12px 30px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background: #0056b3;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-prompt {
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 30px;
}

.login-prompt a {
  color: #007bff;
  font-weight: 600;
}

.reviews-list {
  margin-top: 30px;
}

.no-reviews {
  text-align: center;
  padding: 40px;
  color: #666;
}

.review-item {
  background: white;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 15px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.avatar {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}

.user-info strong {
  display: block;
  color: #333;
  margin-bottom: 5px;
}

.review-date {
  color: #999;
  font-size: 13px;
}

.review-comment {
  margin: 0;
  color: #555;
  line-height: 1.6;
  font-size: 15px;
}
</style>