import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    // If Cloudinary is not configured, fall back to a placeholder or base64 (for demo)
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      // Demo mode: return a placeholder
      return NextResponse.json({
        url: "https://placehold.co/400x500/74b9ff/ffffff?text=📚",
        publicId: "demo",
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "فایلی ارسال نشده" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "فقط عکس مجاز است" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم فایل بیش از ۵ مگابایت است" }, { status: 400 });
    }

    const result = await uploadImage(file);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "خطا در آپلود عکس" },
      { status: 500 }
    );
  }
}
