import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // ✅ Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // ✅ Check existing user
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await hashPassword(password);

    // ✅ Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // ✅ Default categories
    const defaultCategories = [
      "E-commerce",
      "Sports",
      "Medical",
      "Food",
      "Travel",
    ];

    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({
        name: cat,
        userId: user.id,
      })),
    });

    // ✅ Generate token
    const token = signToken({ id: user.id });

    // ✅ Response
    const response = NextResponse.json({
      message: "Signup successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    // ✅ Set cookie
    response.cookies.set("expense_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}