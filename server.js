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

// Tạo thư mục uploads nếu chưa có
const uploadsDir = path.join(__dirname, 'public/uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Cấu hình lưu ảnh
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

// Helper function để đọc db.json
const readDB = () => {
  const dbPath = path.join(__dirname, 'db.json')
  if (fs.existsSync(dbPath)) {
    const raw = fs.readFileSync(dbPath, 'utf8')
    return JSON.parse(raw)
  }
  return { products: [], categories: [] }
}

// Helper function để ghi db.json
const writeDB = (data) => {
  const dbPath = path.join(__dirname, 'db.json')
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8')
}

// ==================== ROUTES ====================

// 1. Lấy danh sách tất cả sản phẩm
app.get('/products', (req, res) => {
  try {
    const db = readDB()
    res.json(db.products || [])
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách sản phẩm' })
  }
})

// 2. Lấy chi tiết 1 sản phẩm theo ID (quan trọng cho chức năng sửa!)
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
  console.log('=== POST /products ===')
  console.log('Body:', req.body)
  console.log('Files:', req.files)
  
  try {
    const { name, categoryId, quantity, discount } = req.body
    
    // Validation
    if (!name || !categoryId) {
      console.error('❌ Missing required fields')
      return res.status(400).json({ 
        success: false,
        error: 'Thiếu thông tin bắt buộc (name, categoryId)' 
      })
    }
    
    if (!req.files || req.files.length === 0) {
      console.error('❌ No files uploaded')
      return res.status(400).json({ 
        success: false,
        error: 'Vui lòng chọn ít nhất một hình ảnh' 
      })
    }
    
    // Parse số an toàn
    const parsedQuantity = parseInt(quantity) || 0
    const parsedDiscount = parseFloat(discount) || 0
    
    if (parsedQuantity < 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Số lượng phải >= 0' 
      })
    }
    
    if (parsedDiscount < 0 || parsedDiscount > 100) {
      return res.status(400).json({ 
        success: false,
        error: 'Giảm giá phải từ 0-100' 
      })
    }
    
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`)

    const product = {
      id: 'p_' + Date.now(),
      name: name.trim(),
      categoryId: parseInt(categoryId),
      discount: parsedDiscount,
      quantity: parsedQuantity,
      images: imagePaths,
      createdAt: new Date().toISOString()
    }

    const db = readDB()
    
    if (!db.products) {
      db.products = []
    }
    
    db.products.push(product)
    writeDB(db)
    
    console.log('✅ Product added:', product)
    
    // QUAN TRỌNG: Phải return JSON hợp lệ
    return res.status(201).json({ 
      success: true,
      message: 'Đã lưu sản phẩm', 
      product: product
    })
    
  } catch (err) {
    console.error('❌ Server error:', err)
    return res.status(500).json({ 
      success: false,
      error: 'Lỗi server: ' + err.message 
    })
  }
})


// 4. Cập nhật sản phẩm
app.put('/products/:id', upload.array('images[]'), (req, res) => {
  try {
    const id = req.params.id
    const { name, categoryId, quantity, discount, existingImages } = req.body
    
    const db = readDB()
    const index = db.products.findIndex(p => String(p.id) === String(id))
    
    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' })
    }

    // Lấy ảnh cũ (nếu có)
    let oldImages = []
    try {
      oldImages = existingImages ? JSON.parse(existingImages) : []
    } catch (e) {
      oldImages = []
    }

    // Lấy ảnh mới upload
    const newImagePaths = req.files.map(file => `/uploads/${file.filename}`)
    
    // Gộp ảnh cũ và ảnh mới
    const allImages = [...oldImages, ...newImagePaths]

    // Cập nhật sản phẩm
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

// 5. Xóa sản phẩm
app.delete('/products/:id', (req, res) => {
  try {
    const id = req.params.id
    const db = readDB()
    
    const index = db.products.findIndex(p => String(p.id) === String(id))
    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' })
    }

    // Xóa các file ảnh liên quan (tùy chọn)
    const product = db.products[index]
    if (product.images && product.images.length > 0) {
      product.images.forEach(imgPath => {
        const filePath = path.join(__dirname, 'public', imgPath)
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath)
          } catch (e) {
            console.log('Không xóa được file:', filePath)
          }
        }
      })
    }

    db.products.splice(index, 1)
    writeDB(db)
    
    res.json({ message: 'Đã xóa sản phẩm' })
  } catch (err) {
    console.error('Error deleting product:', err)
    res.status(500).json({ error: 'Không thể xóa sản phẩm' })
  }
})

// 6. Lấy danh sách categories
app.get('/categories', (req, res) => {
  try {
    const db = readDB()
    res.json(db.categories || [])
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh mục' })
  }
})

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'API đang hoạt động',
    endpoints: {
      'GET /products': 'Lấy danh sách sản phẩm',
      'GET /products/:id': 'Lấy chi tiết sản phẩm',
      'POST /products': 'Thêm sản phẩm mới',
      'PUT /products/:id': 'Cập nhật sản phẩm',
      'DELETE /products/:id': 'Xóa sản phẩm',
      'GET /categories': 'Lấy danh sách danh mục'
    }
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Có lỗi xảy ra trên server' })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`)
  console.log(`📁 Upload folder: ${uploadsDir}`)
})