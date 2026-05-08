import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      recipientName,
      occasion,
      finalMessage,
      coupon,
      finalPrice,
      balloons, // Array<{ id: string; message: string; imageBase64: string | null }>
    } = body;

    // ── 1. Verify Razorpay HMAC signature ─────────────────────────────────
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature. Payment could not be verified." },
        { status: 400 }
      );
    }

    // ── 2. Get logged-in user ──────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 3. Upload balloon images to Supabase Storage ───────────────────────
    const uploadedBalloons = await Promise.all(
      (balloons as Array<{ id: string; message: string; imageBase64: string | null }>).map(
        async (balloon, index) => {
          let imageUrl: string | null = null;

          if (balloon.imageBase64 && balloon.imageBase64.startsWith("data:")) {
            try {
              const [meta, base64Data] = balloon.imageBase64.split(",");
              const mimeType = meta.split(";")[0].split(":")[1]; // e.g. "image/jpeg"
              const extension = mimeType.split("/")[1];           // e.g. "jpeg"

              const byteCharacters = atob(base64Data);
              const byteArray = new Uint8Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteArray[i] = byteCharacters.charCodeAt(i);
              }
              const blob = new Blob([byteArray], { type: mimeType });

              // Store under userId/timestamp-index.ext so RLS policy matches
              const fileName = `${user.id}/${Date.now()}-${index}.${extension}`;

              const { data: uploadData, error: uploadError } = await supabase.storage
                .from("balloon-images")
                .upload(fileName, blob, { contentType: mimeType, upsert: false });

              if (uploadError) {
                console.error(`Balloon ${index} upload error:`, uploadError.message);
              } else {
                const { data: urlData } = supabase.storage
                  .from("balloon-images")
                  .getPublicUrl(uploadData.path);
                imageUrl = urlData.publicUrl;
              }
            } catch (uploadErr) {
              console.error(`Balloon ${index} processing error:`, uploadErr);
            }
          }

          return {
            message: balloon.message,
            imageUrl,
            orderIndex: index,
          };
        }
      )
    );

    // ── 4. Generate unique slug ────────────────────────────────────────────
    const slug = nanoid(10); // e.g. "V1StGXR8_Z"

    // ── 5. Set expiry = now + 15 days ──────────────────────────────────────
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 15);

    // ── 6. Insert surprise row ─────────────────────────────────────────────
    const { data: surprise, error: surpriseError } = await supabase
      .from("surprises")
      .insert({
        creator_id: user.id,
        recipient_name: recipientName,
        occasion,
        final_message: finalMessage,
        status: "active",
        unique_slug: slug,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (surpriseError || !surprise) {
      console.error("Surprise insert error:", surpriseError?.message);
      return NextResponse.json(
        { error: "Failed to save surprise. Please contact support." },
        { status: 500 }
      );
    }

    // ── 7. Insert balloon rows ─────────────────────────────────────────────
    const balloonRows = uploadedBalloons.map((b) => ({
      surprise_id: surprise.id,
      message: b.message,
      image_url: b.imageUrl,
      order_index: b.orderIndex,
    }));

    const { error: balloonsError } = await supabase
      .from("balloons")
      .insert(balloonRows);

    if (balloonsError) {
      console.error("Balloons insert error:", balloonsError.message);
      // Surprise was saved — don't fail silently, but don't block user either
      return NextResponse.json(
        { error: "Surprise saved but balloon cards failed. Contact support." },
        { status: 500 }
      );
    }
// After payment is confirmed, increment the creator's usage count
if (coupon && coupon !== "none") {
  await supabase.rpc("increment_coupon_usage", {
  p_code: coupon,
  p_amount: finalPrice,
});
}
    // ── 8. Return slug ─────────────────────────────────────────────────────
    return NextResponse.json({ success: true, slug });

  } catch (error) {
    console.error("Finalize route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}