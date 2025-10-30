import express from 'express'
import multer from 'multer'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

// 🗂️ Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, 'public/uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// ⚙️ Cấu hình multer để upload ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Chỉ chấp nhận file ảnh!'), false)
  }
})

// ==========================================
// ✅ Helper: Đọc / Ghi file db.json
// ==========================================
const dbPath = path.join(__dirname, 'db.json')
const writeDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8')

const readDB = () => {
  if (!fs.existsSync(dbPath)) {
    const defaultData = { products: [], categories: [], users: [] }
    writeDB(defaultData)
    return defaultData
  }

  const raw = fs.readFileSync(dbPath, 'utf8').trim()
  if (raw === '') {
    const defaultData = { products: [], categories: [], users: [] }
    writeDB(defaultData)
    return defaultData
  }

  try {
    return JSON.parse(raw)
  } catch (err) {
    console.error('❌ db.json bị lỗi định dạng:', err.message)
    const defaultData = { products: [], categories: [], users: [] }
    writeDB(defaultData)
    return defaultData
  }
}

// ==========================================
// ✅ ROUTES SẢN PHẨM
// ==========================================
app.get('/products', (req, res) => {
  try {
    const db = readDB()
    res.json(db.products || [])
  } catch {
    res.status(500).json({ error: 'Không thể lấy danh sách sản phẩm' })
  }
})

app.get('/products/:id', (req, res) => {
  try {
    const db = readDB()
    const product = db.products.find(p => String(p.id) === String(req.params.id))
    if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' })
    res.json(product)
  } catch {
    res.status(500).json({ error: 'Không thể lấy thông tin sản phẩm' })
  }
})

app.post('/products', upload.array('images[]'), (req, res) => {
  try {
    const { name, categoryId, quantity, discount } = req.body
    if (!name || !categoryId)
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (name, categoryId)' })

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'Vui lòng chọn ít nhất một hình ảnh' })

    const db = readDB()
    const product = {
      id: 'p_' + Date.now(),
      name: name.trim(),
      categoryId: parseInt(categoryId),
      quantity: parseInt(quantity) || 0,
      discount: parseFloat(discount) || 0,
      images: req.files.map(f => `/uploads/${f.filename}`),
      createdAt: new Date().toISOString()
    }
    db.products.push(product)
    writeDB(db)
    res.status(201).json({ success: true, message: 'Đã lưu sản phẩm', product })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server: ' + err.message })
  }
})

app.put('/products/:id', upload.array('images[]'), (req, res) => {
  try {
    const { name, categoryId, quantity, discount, existingImages } = req.body
    const db = readDB()
    const index = db.products.findIndex(p => String(p.id) === String(req.params.id))
    if (index === -1) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' })

    let oldImages = []
    try { oldImages = existingImages ? JSON.parse(existingImages) : [] } catch {}
    const newImages = req.files.map(f => `/uploads/${f.filename}`)
    db.products[index] = {
      ...db.products[index],
      name: name.trim(),
      categoryId: Number(categoryId),
      quantity: Number(quantity) || 0,
      discount: Number(discount) || 0,
      images: [...oldImages, ...newImages],
      updatedAt: new Date().toISOString()
    }
    writeDB(db)
    res.json({ message: 'Đã cập nhật sản phẩm', product: db.products[index] })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi cập nhật sản phẩm' })
  }
})

app.delete('/products/:id', (req, res) => {
  try {
    const db = readDB()
    const index = db.products.findIndex(p => String(p.id) === String(req.params.id))
    if (index === -1) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' })

    const product = db.products[index]
    product.images?.forEach(img => {
      const filePath = path.join(__dirname, 'public', img)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    })

    db.products.splice(index, 1)
    writeDB(db)
    res.json({ message: 'Đã xóa sản phẩm' })
  } catch {
    res.status(500).json({ error: 'Không thể xóa sản phẩm' })
  }
})

// ==========================================
// ✅ ROUTES DANH MỤC
// ==========================================
app.get('/categories', (req, res) => {
  try {
    const db = readDB()
    res.json(db.categories || [])
  } catch {
    res.status(500).json({ error: 'Không thể lấy danh mục' })
  }
})

app.post('/categories', (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Tên danh mục không được trống' })

    const db = readDB()
    const category = { id: 'c_' + Date.now(), name }
    db.categories.push(category)
    writeDB(db)
    res.status(201).json({ message: 'Đã thêm danh mục', category })
  } catch {
    res.status(500).json({ error: 'Lỗi khi thêm danh mục' })
  }
})

app.delete('/categories/:id', (req, res) => {
  try {
    const db = readDB()
    const index = db.categories.findIndex(c => String(c.id) === String(req.params.id))
    if (index === -1) return res.status(404).json({ error: 'Không tìm thấy danh mục' })
    db.categories.splice(index, 1)
    writeDB(db)
    res.json({ message: 'Đã xóa danh mục' })
  } catch {
    res.status(500).json({ error: 'Không thể xóa danh mục' })
  }
})

// ==========================================
// ✅ ROUTE ĐĂNG NHẬP NGƯỜI DÙNG
// ==========================================
app.get('/users', (req, res) => {
  try {
    const { userName, password } = req.query
    if (!userName || !password)
      return res.status(400).json({ error: 'Thiếu tên đăng nhập hoặc mật khẩu' })

    const db = readDB()
    const user = (db.users || []).find(
      (u) => u.userName === userName && u.password === password
    )

    if (!user) return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu' })

    res.json({ success: true, message: 'Đăng nhập thành công', user })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi đăng nhập' })
  }
})

// ==========================================
// ✅ HEALTH CHECK
// ==========================================
app.get('/', (req, res) => {
  res.json({
    message: 'API đang hoạt động',
    endpoints: {
      '/products': 'CRUD sản phẩm',
      '/categories': 'CRUD danh mục',
      '/users': 'Đăng nhập người dùng'
    }
  })
})

// ==========================================
// 🔧 Middleware lỗi chung
// ==========================================
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled Error:', err.stack)
  res.status(500).json({ error: 'Có lỗi xảy ra trên server' })
})

// ==========================================
// ✅ KHỞI ĐỘNG SERVER
// ==========================================
const PORT = 3001
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`)
  console.log(`📁 Upload folder: ${uploadsDir}`)
})
