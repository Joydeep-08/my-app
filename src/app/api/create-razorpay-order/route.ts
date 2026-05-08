import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Connect to your Supabase database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // use service role key, not anon key
);

export async function POST(req: Request) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Payment configuration error" }, { status: 500 });
  }

  try {
    const { coupon } = await req.json();

    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const basePrice = 79;
    let finalPrice = basePrice;
    let creatorName = "none";

    // If the user entered a coupon code...
    if (coupon) {
      // Look it up in your Supabase table
      const { data, error } = await supabase
        .from("coupon_codes")
        .select("*")
        .eq("code", coupon.trim().toUpperCase())
        .single();

      // If code doesn't exist in the table, reject it
      if (error || !data) {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
      }

      // Apply the discount from the database
      finalPrice = Math.max(basePrice - data.discount_amount, 1);
      creatorName = data.creator_name; // e.g. "Aastha"
    }

    // Create the Razorpay order
    // The "notes" field is just extra info attached to the order
    // You can see these notes inside your Razorpay dashboard too!
    const order = await razorpay.orders.create({
      amount: finalPrice * 100,
      currency: "INR",
      receipt: `surprise_${Date.now()}`,
      notes: {
        coupon: coupon || "none",
        referred_by: creatorName,   // 👈 this is the key part
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