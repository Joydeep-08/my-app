// app/api/create-razorpay-order/route.ts
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

// Razorpay instance — reads from env vars
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST() {
  try {
    const order = await razorpay.orders.create({
      amount: 14900,        // amount in paise (₹149 = 14900 paise)
      currency: "INR",
      receipt: `surprise_${Date.now()}`,
      notes: {
        product: "SurpriseGift",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,   // 14900
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}