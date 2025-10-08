<script setup>
import { ref } from 'vue'

// Thông tin cá nhân
const name = ref('Phạm Đình Chương')
const editingName = ref(false)

const title = ref('Full stack Developer')
const editingTitle = ref(false)

const address = ref('Buôn Ma thuột, Đaklak, VietNam')
const editingAddress = ref(false)

const phone = '+84-339-857-395'

const email = ref('chuongpdpk03971@gmail.com')
const editingEmail = ref(false)

const website = 'https://figurezone.io.vn'
const avatar = '/beauty_1713225973765.jpg' // ảnh đặt trong thư mục public

// Mạng xã hội, công cụ, kỹ năng
const social = ['LinkedIn', 'GitHub', 'Twitter', 'Facebook', 'Zalo']
const tools = ['Duanmau-fpoly']
const skills = [
  'HTML/CSS',
  'JavaScript',
  'PHP',
  'Lavarel',
  'Responsive Web Design',
  'Visual Studio',
  'WordPress'
]

const summary = ref(
  'Full stack Developer với hơn 5 năm kinh nghiệm, chuyên tạo giao diện người dùng hấp dẫn, tối ưu trải nghiệm và làm việc hiệu quả với HTML5, CSS3, JavaScript.'
)
const editingSummary = ref(false)

const experience = [
  {
    role: 'Full stack Developer',
    company: 'Fpoly Tây Nguyên',
    time: 'Sep 2024 – Hiện tại',
    location: 'VietNam, VN',
    tasks: ['Fullstack developer']
  },
  {
    role: 'Front End Developer',
    company: 'SPAL',
    time: 'Sep 2024 – Hiện tại',
    location: 'VietNam, VN',
    tasks: [
      'Xây dựng website tương thích đa thiết bị',
      'Làm việc với HTML5, CSS3, JavaScript, Bootstrap',
      'Giao tiếp với khách hàng và đội ngũ kỹ thuật'
    ]
  }
]

const education = {
  degree: 'Associate in Computer Science',
  school: 'FPT Polytechnic Tây Nguyên',
  time: 'Sep 2024 – Jul 2026',
  honors: 'Tốt nghiệp loại xuất sắc'
}

function stopEditing(field) {
  field.value = false
}
</script>

<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-md-4 bg-light p-4 rounded text-center">
        <img :src="avatar" alt="Avatar" class="img-fluid rounded-circle mb-3" style="width: 200px; height: 200px; object-fit: cover;" />
        <h3 class="text-primary" @click="editingName = true">
          <template v-if="!editingName">{{ name }}</template>
          <input v-else v-model="name" @blur="stopEditing(editingName)" @keyup.enter="stopEditing(editingName)" />
        </h3>
        <p class="fw-bold" @click="editingTitle = true">
          <template v-if="!editingTitle">{{ title }}</template>
          <input v-else v-model="title" @blur="stopEditing(editingTitle)" @keyup.enter="stopEditing(editingTitle)" />
        </p>
        <hr />
        <h5>📍 Thông tin liên hệ</h5>
        <ul class="list-unstyled text-start">
          <li @click="editingAddress = true">
            <template v-if="!editingAddress">🏠 {{ address }}</template>
            <input v-else v-model="address" @blur="stopEditing(editingAddress)" @keyup.enter="stopEditing(editingAddress)" />
          </li>
          <li>📞 {{ phone }}</li>
          <li @click="editingEmail = true">
            <template v-if="!editingEmail">📧 {{ email }}</template>
            <input v-else v-model="email" @blur="stopEditing(editingEmail)" @keyup.enter="stopEditing(editingEmail)" />
          </li>
          <li>🌐 <a :href="website" target="_blank">{{ website }}</a></li>
        </ul>

        <h5>🔗 Mạng xã hội</h5>
        <ul class="list-inline">
          <li v-for="item in social" :key="item" class="list-inline-item">
            <span class="badge bg-secondary">{{ item }}</span>
          </li>
        </ul>

        <h5>🧠 Quản lý dự án</h5>
        <ul class="text-start">
          <li v-for="tool in tools" :key="tool">{{ tool }}</li>
        </ul>

        <h5>💻 Kỹ năng lập trình & thiết kế</h5>
        <ul class="text-start">
          <li v-for="skill in skills" :key="skill">{{ skill }}</li>
        </ul>
      </div>

      <div class="col-md-8 p-4">
        <h4 class="text-success">👨‍💻 Giới thiệu</h4>
        <p @click="editingSummary = true">
          <template v-if="!editingSummary">{{ summary }}</template>
          <textarea v-else v-model="summary" rows="3" class="form-control" @blur="stopEditing(editingSummary)" />
        </p>

        <h4 class="text-success mt-4">📂 Kinh nghiệm làm việc</h4>
        <div v-for="job in experience" :key="job.company" class="mb-3">
          <h5>{{ job.role }} / {{ job.company }}</h5>
          <small>{{ job.time }} – {{ job.location }}</small>
          <ul>
            <li v-for="task in job.tasks" :key="task">{{ task }}</li>
          </ul>
        </div>

        <h4 class="text-success mt-4">🎓 Học vấn</h4>
        <p><strong>{{ education.degree }}</strong> – {{ education.school }}</p>
        <small>{{ education.time }} | {{ education.honors }}</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
a {
  text-decoration: none;
}
input {
  width: 100%;
  margin-top: 5px;
}
</style>
