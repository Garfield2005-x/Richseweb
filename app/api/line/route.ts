import { NextResponse } from "next/server"

type CartItem = {
  id: number
  name: string
  quantity: number
  price: number
}

type LineRequestBody = {
  fullName: string
  phone: string
  address: string
  city: string
  postalCode: string
  shippingMethod: string
  subtotal: number
  tax: number
  total: number
  shippingCost?: number
  discountAmount?: number
  discountCode?: string
  cart: CartItem[]
}

export async function POST(req: Request) {
  const body: LineRequestBody = await req.json()

  const productList = body.cart
    .map(
      (item) => `• ${item.name}
  จำนวน: ${item.quantity}
  ราคา: $${item.price}
  รวม: $${(item.price * item.quantity).toFixed(2)}`
    )
    .join("\n\n")

  const message = `
📦 มีออเดอร์ใหม่

👤 ชื่อ: ${body.fullName}
📞 เบอร์: ${body.phone}

🏠 ที่อยู่:
${body.address}
${body.city} ${body.postalCode}

🚚 วิธีการจัดส่ง: ${body.shippingMethod}

🛍 รายการสินค้า:
${productList}

💰 Subtotal: $${body.subtotal.toFixed(2)}
🚚 Shipping: $${body.shippingCost?.toFixed(2) || "0.00"}

${
  body.discountAmount && body.discountAmount > 0
    ? `🎟 โค้ดส่วนลด: ${body.discountCode}
💸 ส่วนลด: -$${body.discountAmount.toFixed(2)}`
    : ""
}

💳 ยอดสุทธิ: $${body.total.toFixed(2)}
`

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      to: "C0b778d20a6877e76023a328f9485b564",
      messages: [
        {
          type: "text",
          text: message
        }
      ]
    })
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error("LINE API ERROR:", errorText)

    return NextResponse.json(
      { error: errorText },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}