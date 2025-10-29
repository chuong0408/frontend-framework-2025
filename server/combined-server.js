import express from 'express'
import multer from 'multer'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import jwt from 'jsonwebtoken'
import { VNPay, ignoreLogger } from 'vnpay'
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const SECRET = "dev-only-secret"
const PORT = 3001

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

// Tạo thư mục uploads nếu chưa có
const uploadsDir = path.join(__dirname, 'public/uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// ============ HELPER FUNCTIONS ============
const readDB = () => {
  const dbPath = path.join(__dirname, 'db.json')
  if (fs.existsSync(dbPath)) {
    const raw = fs.readFileSync(dbPath, 'utf8')
    return JSON.parse(raw)
  }
  return { users: [], products: [], categories: [], orders: [], reviews: [], favorites: [] }
}

const writeDB = (data) => {
  const dbPath = path.join(__dirname, 'db.json')
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8')
}

// ============ MULTER CONFIG ============
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname
    cb(null, uniqueName)
  }
})

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false)
    }
  }
})

// ============ AUTH ROUTES ============

// Login
app.post('/login', (req, res) => {
  const { userName, password } = req.body || {}
  
  if (!userName || !password) {
    return res.status(400).json({ message: 'userName and password are required' })
  }

  const db = readDB()
  const user = db.users.find(u => u.userName === userName && u.password === password)
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' })
  }

  const token = jwt.sign(
    { sub: user.id, username: user.userName, role: user.role || 'user' }, 
    SECRET, 
    { expiresIn: '1h' }
  )
  
  return res.json({ 
    access_token: token, 
    user: { 
      id: user.id, 
      userName: user.userName,
      email: user.email,
      fullName: user.fullName,
      role: user.role || 'user'
    } 
  })
})

// Register
app.post('/register', (req, res) => {
  const { userName, password, fullName, email } = req.body || {}
  
  if (!userName || !password) {
    return res.status(400).json({ message: 'userName and password are required' })
  }

  const db = readDB()
  const existing = db.users.find(u => u.userName === userName)
  
  if (existing) {
    return res.status(409).json({ message: 'userName already exists' })
  }

  const newUser = { 
    id: Date.now().toString(), 
    userName, 
    password, 
    fullName: fullName || '',
    email: email || '',
    role: 'user' 
  }
  
  db.users.push(newUser)
  writeDB(db)

  const token = jwt.sign(
    { sub: newUser.id, username: newUser.userName, role: newUser.role }, 
    SECRET, 
    { expiresIn: '1h' }
  )
  
  return res.status(201).json({ 
    user: { id: newUser.id, userName: newUser.userName }, 
    access_token: token 
  })
})

// ============ USER ROUTES ============
app.get('/users', (req, res) => {
  try {
    const db = readDB()
    const { userName, password } = req.query
    
    let users = db.users || []
    
    // Filter by query params
    if (userName) {
      users = users.filter(u => u.userName === userName)
    }
    if (password) {
      users = users.filter(u => u.password === password)
    }
    
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy users' })
  }
})

app.get('/users/:id', (req, res) => {
  try {
    const db = readDB()
    const user = db.users.find(u => String(u.id) === String(req.params.id))
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' })
  }
})

app.post('/users', (req, res) => {
  try {
    const db = readDB()
    const newUser = {
      id: Date.now().toString(),
      ...req.body
    }
    db.users.push(newUser)
    writeDB(db)
    res.status(201).json(newUser)
  } catch (err) {
    res.status(500).json({ error: 'Error creating user' })
  }
})

app.put('/users/:id', (req, res) => {
  try {
    const db = readDB()
    const index = db.users.findIndex(u => String(u.id) === String(req.params.id))
    
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    db.users[index] = { ...db.users[index], ...req.body }
    writeDB(db)
    res.json(db.users[index])
  } catch (err) {
    res.status(500).json({ error: 'Error updating user' })
  }
})

app.delete('/users/:id', (req, res) => {
  try {
    const db = readDB()
    const index = db.users.findIndex(u => String(u.id) === String(req.params.id))
    
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    db.users.splice(index, 1)
    writeDB(db)
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user' })
  }
})

// ============ PRODUCT ROUTES ============
app.get('/products', (req, res) => {
  try {
    const db = readDB()
    res.json(db.products || [])
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy sản phẩm' })
  }
})

app.get('/products/:id', (req, res) => {
  try {
    const db = readDB()
    const product = db.products.find(p => String(p.id) === String(req.params.id))
    
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' })
    }
    
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy thông tin sản phẩm' })
  }
})

app.post('/products', upload.array('images[]'), (req, res) => {
  try {
    const { name, categoryId, quantity, discount } = req.body
    
    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' })
    }
    
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`)

    const product = {
      id: 'p_' + Date.now(),
      name: name.trim(),
      categoryId: parseInt(categoryId),
      discount: parseFloat(discount) || 0,
      quantity: parseInt(quantity) || 0,
      images: imagePaths,
      createdAt: new Date().toISOString()
    }

    const db = readDB()
    db.products.push(product)
    writeDB(db)
    
    res.json({ message: 'Đã lưu sản phẩm', product })
  } catch (err) {
    console.error('Error adding product:', err)
    res.status(500).json({ error: 'Lỗi khi thêm sản phẩm' })
  }
})

app.put('/products/:id', upload.array('images[]'), (req, res) => {
  try {
    const id = req.params.id
    const { name, categoryId, quantity, discount, existingImages } = req.body
    
    const db = readDB()
    const index = db.products.findIndex(p => String(p.id) === String(id))
    
    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' })
    }

    let oldImages = []
    try {
      oldImages = existingImages ? JSON.parse(existingImages) : []
    } catch (e) {
      oldImages = []
    }

    const newImagePaths = req.files.map(file => `/uploads/${file.filename}`)
    const allImages = [...oldImages, ...newImagePaths]

    db.products[index] = {
      ...db.products[index],
      name,
      categoryId: Number(categoryId),
      quantity: Number(quantity) || 0,
      discount: Number(discount) || 0,
      images: allImages,
      updatedAt: new Date().toISOString()
    }

    writeDB(db)
    res.json({ message: 'Đã cập nhật sản phẩm', product: db.products[index] })
  } catch (err) {
    console.error('Error updating product:', err)
    res.status(500).json({ error: 'Lỗi khi cập nhật sản phẩm' })
  }
})

app.delete('/products/:id', (req, res) => {
  try {
    const db = readDB()
    const index = db.products.findIndex(p => String(p.id) === String(req.params.id))
    
    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' })
    }

    db.products.splice(index, 1)
    writeDB(db)
    res.json({ message: 'Đã xóa sản phẩm' })
  } catch (err) {
    res.status(500).json({ error: 'Không thể xóa sản phẩm' })
  }
})

// ============ CATEGORY ROUTES ============
app.get('/categories', (req, res) => {
  try {
    const db = readDB()
    res.json(db.categories || [])
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh mục' })
  }
})

app.post('/categories', (req, res) => {
  try {
    const db = readDB()
    const newCategory = {
      id: Date.now().toString(),
      ...req.body
    }
    db.categories.push(newCategory)
    writeDB(db)
    res.status(201).json(newCategory)
  } catch (err) {
    res.status(500).json({ error: 'Error creating category' })
  }
})

app.put('/categories/:id', (req, res) => {
  try {
    const db = readDB()
    const index = db.categories.findIndex(c => String(c.id) === String(req.params.id))
    
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    db.categories[index] = { ...db.categories[index], ...req.body }
    writeDB(db)
    res.json(db.categories[index])
  } catch (err) {
    res.status(500).json({ error: 'Error updating category' })
  }
})

app.delete('/categories/:id', (req, res) => {
  try {
    const db = readDB()
    const index = db.categories.findIndex(c => String(c.id) === String(req.params.id))
    
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    db.categories.splice(index, 1)
    writeDB(db)
    res.json({ message: 'Category deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Error deleting category' })
  }
})

// ============ ORDER ROUTES ============
app.get('/orders', (req, res) => {
  try {
    const db = readDB()
    res.json(db.orders || [])
  } catch (err) {
    res.status(500).json({ error: 'Error fetching orders' })
  }
})

app.post('/orders', (req, res) => {
  try {
    const db = readDB()
    const newOrder = {
      id: Date.now().toString(),
      ...req.body
    }
    db.orders.push(newOrder)
    writeDB(db)
    res.status(201).json(newOrder)
  } catch (err) {
    res.status(500).json({ error: 'Error creating order' })
  }
})

app.put('/orders/:id', (req, res) => {
  try {
    const db = readDB()
    const index = db.orders.findIndex(o => String(o.id) === String(req.params.id))
    
    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' })
    }
    
    db.orders[index] = { ...db.orders[index], ...req.body }
    writeDB(db)
    res.json(db.orders[index])
  } catch (err) {
    res.status(500).json({ error: 'Error updating order' })
  }
})

// ============ REVIEW ROUTES ============
app.get('/reviews', (req, res) => {
  try {
    const db = readDB()
    const { productId } = req.query
    
    let reviews = db.reviews || []
    if (productId) {
      reviews = reviews.filter(r => String(r.productId) === String(productId))
    }
    
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ error: 'Error fetching reviews' })
  }
})

app.post('/reviews', (req, res) => {
  try {
    const db = readDB()
    const newReview = {
      id: Date.now().toString(),
      ...req.body
    }
    db.reviews.push(newReview)
    writeDB(db)
    res.status(201).json(newReview)
  } catch (err) {
    res.status(500).json({ error: 'Error creating review' })
  }
})

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Combined API Server',
    endpoints: {
      auth: ['POST /login', 'POST /register'],
      users: ['GET /users', 'GET /users/:id', 'POST /users', 'PUT /users/:id', 'DELETE /users/:id'],
      products: ['GET /products', 'POST /products', 'PUT /products/:id', 'DELETE /products/:id'],
      categories: ['GET /categories', 'POST /categories', 'PUT /categories/:id', 'DELETE /categories/:id'],
      orders: ['GET /orders', 'POST /orders', 'PUT /orders/:id'],
      reviews: ['GET /reviews', 'POST /reviews']
    }
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Có lỗi xảy ra trên server' })
})

app.listen(PORT, () => {
  console.log(`✅ Combined Server running at http://localhost:${PORT}`)
  console.log(`📁 Upload folder: ${uploadsDir}`)
  console.log(`📂 Database: ${path.join(__dirname, 'db.json')}`)
})cd server
