import { NextRequest, NextResponse } from "next/server";
import { login, logout, isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { password, action } = await req.json();

    if (action === "logout") {
      await logout();
      return NextResponse.json({ success: true });
    }

    if (!password) {
      return NextResponse.json({ error: "رمز عبور را وارد کنید" }, { status: 400 });
    }

    const success = await login(password);
    if (!success) {
      return NextResponse.json({ error: "رمز عبور اشتباه است 😊" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطا در ورود" }, { status: 500 });
  }
}

export async function GET() {
  const authenticated = await isAuthenticated();
  return NextResponse.json({ authenticated });
}
