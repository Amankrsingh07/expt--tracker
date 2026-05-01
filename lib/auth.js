import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "expense_tracker_secret_key";

export const hashPassword = (password) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const getUserFromRequest = async (req) => {
  try {
    let token = req.cookies?.get?.("expense_token")?.value || null;

    if (!token) {
      const cookieHeader = req.headers?.get?.("cookie") || "";
      const cookie = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("expense_token="));

      if (cookie) token = cookie.split("=")[1];
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.id) },
    });

    return user || null;
  } catch (err) {
    return null;
  }
};