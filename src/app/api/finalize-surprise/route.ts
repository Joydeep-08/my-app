// app/api/finalize-surprise/route.ts
// Placeholder for Prompt 14 — real logic (upload images, save to Supabase) comes in Prompt 15.
// For now it just verifies payment succeeded and returns success.
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // These fields will come from the frontend after Razorpay confirms payment
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // Basic presence check — real signature verification comes in Prompt 15
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    // Prompt 15 will: verify HMAC signature, upload images, save to Supabase, return slug
    return NextResponse.json({
      success: true,
      message: "Payment received — surprise will be saved in Prompt 15",
      // slug will be returned here in Prompt 15
    });
  } catch (error) {
    console.error("Finalize error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}