// app/api/create-razorpay-order/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { coupon } = body;

    const Razorpay = (await import("razorpay")).default;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // 💰 Base price
    const basePrice = 79;

    // 🎟️ Coupon logic
    let finalPrice = basePrice;

    //if (coupon === "LOVE50") {
    // finalPrice = basePrice - 50;
    //}

    //if (coupon === "FIRST20") {
    //  finalPrice = basePrice - 20;
    //}

    // Prevent negative price (just in case)
    finalPrice = Math.max(finalPrice, 1);

    const order = await razorpay.orders.create({
      amount: finalPrice * 100, // paisa
      currency: "INR",
      receipt: `surprise_${Date.now()}`,
      notes: {
        product: "SurpriseGift",
        coupon: coupon || "none",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      finalPrice,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}