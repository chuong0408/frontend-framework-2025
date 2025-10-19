import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export const sendOrderEmail = async (order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.customer.email,
    subject: `Đơn hàng ${order.orderCode} đã được đặt thành công`,
    html: `
      <h2>Cảm ơn bạn đã đặt hàng!</h2>
      <p>Mã đơn hàng: <strong>${order.orderCode}</strong></p>
      <p>Tổng tiền: <strong>${order.payment.total.toLocaleString()}₫</strong></p>
      <p>Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
    `
  }

  await transporter.sendMail(mailOptions)
}