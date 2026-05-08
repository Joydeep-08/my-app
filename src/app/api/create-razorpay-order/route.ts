import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Payment configuration error" }, { status: 500 });
  }

  try {
    const { coupon, validateOnly } = await req.json(); // 👈 added validateOnly

    const basePrice = 79;
    let finalPrice = basePrice;
    let creatorName = "none";

    if (coupon) {
      const { data, error } = await supabase
        .from("coupon_codes")
        .select("*")
        .eq("code", coupon.trim().toUpperCase())
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
      }

      finalPrice = Math.max(basePrice - data.discount_amount, 1);
      creatorName = data.creator_name;
    }

    // 👇 if just validating coupon, return early — no Razorpay order created
    if (validateOnly) {
      return NextResponse.json({ finalPrice });
    }

    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: finalPrice * 100,
      currency: "INR",
      receipt: `surprise_${Date.now()}`,
      notes: {
        coupon: coupon || "none",
        referred_by: creatorName,
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
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}