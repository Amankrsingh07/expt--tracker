import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // ✅ Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // ✅ Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // ❗ Do NOT reveal if user exists or not (security)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Check password
    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Generate token
    const token = signToken({ id: user.id });

    // ✅ Response
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    // ✅ Secure cookie
    response.cookies.set("expense_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 🔥 important
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}