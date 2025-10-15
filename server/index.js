import jsonServer from "json-server";
import jwt from "jsonwebtoken";
import 'dotenv/config'

const SECRET = "dev-only-secret"; // change for your local env
const PORT = process.env.PORT || 3001;

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();


import { VNPay, ignoreLogger } from 'vnpay';
// init vnpay
console.log('env', process.env)
const vnpay = new VNPay({
  // ⚡ Cấu hình bắt buộc
  tmnCode: process.env.vnp_TmnCode,
  secureSecret: process.env.vnp_HashSecret,
  vnpayHost: 'https://sandbox.vnpayment.vn',

  // 🔧 Cấu hình tùy chọn
  testMode: true, // Chế độ test
  hashAlgorithm: 'SHA512', // Thuật toán mã hóa
  enableLog: true, // Bật/tắt log
  loggerFn: ignoreLogger, // Custom logger

  // 🔧 Custom endpoints
  endpoints: {
    paymentEndpoint: 'paymentv2/vpcpay.html',
    queryDrRefundEndpoint: 'merchant_webapi/api/transaction',
    getBankListEndpoint: 'qrpayauth/api/merchant/get_bank_list',
  },
});


server.use(middlewares);
server.use(jsonServer.bodyParser);

// ---------- Auth helpers ----------
function createToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

function getUser(db, { username, password }) {
  return db.get("users").find({ username, password }).value();
}

// ---------- Routes ----------

// Register (username + password)
server.post("/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "username and password are required" });
  }

  const db = router.db;
  const existing = db.get("users").find({ username }).value();
  if (existing) {
    return res.status(409).json({ message: "username already exists" });
  }

  const nextId = (db.get("users").map("id").max().value() || 0) + 1;
  const user = { id: nextId, username, password, role: "user" };
  db.get("users").push(user).write();

  // auto-login on register (optional)
  const token = createToken({ sub: user.id, username: user.username, role: user.role });
  return res.status(201).json({ user: { id: user.id, username: user.username }, access_token: token });
});

// Login (username + password)
server.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "username and password are required" });
  }

  const db = router.db;
  const user = getUser(db, { username, password });
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = createToken({ sub: user.id, username: user.username, role: user.role || "user" });
  return res.json({ access_token: token, user: { id: user.id, username: user.username } });
});

// payment method
server.post("/init-url", (req, res) => {
  const { amount, order_id } = req.body || {};

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: Number(amount), // 100,000 VND
    vnp_IpAddr: ip,
    vnp_ReturnUrl: process.env.vnp_ReturnUrl,
    vnp_TxnRef: order_id,
    vnp_OrderInfo: 'Thanh toán đơn hàng #123',
  });
  return res.json({ url: paymentUrl });
});

server.get("/verify", (req, res) => {
  console.log('call here')
  const verify = vnpay.verifyReturnUrl(req.query);
  if (verify.isSuccess) {
    return res.json({message: 'ok'})
  } else {
     return res.status(400).json({message: 'fail'})
  }
});


// Protect specific routes (example: POST /customers requires auth)
server.use((req, res, next) => {
  const needAuth =
    req.method === "GET" && req.path.startsWith("/users");
  console.log(req.method)
  if (!needAuth) return next();

  const auth = req.headers.authorization || "";
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing Bearer token" });

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

// Use default json-server router for all CRUD
server.use(router);

// Start server
server.listen(PORT, () => {
  console.log(`Mock JSON server running on http://localhost:${PORT}`);
});