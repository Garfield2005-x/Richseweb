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
  province: string
  district: string
  subdistrict: string
  postcode: string
  shippingMethod: string
  subtotal: number
  total: number
  shippingCost?: number
  discountAmount?: number
  discountCode?: string
  cart: CartItem[]
  order_number: string
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
 
🧾 Order: ${body.order_number}
👤 ชื่อ: ${body.fullName}
📞 เบอร์: ${body.phone}

🏠 ที่อยู่:
${body.address}
ต.${body.subdistrict} อ.${body.district}
จ.${body.province} ${body.postcode}

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