import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 🔐 Hash password
export const hashPassword = (password) => {
  return bcrypt.hash(password, 10);
};

// 🔐 Compare password
export const comparePassword = (password, hash) => {
  return bcrypt.compare(password, hash);
};

// 🔐 Sign JWT
export const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 🔥 GET USER FROM COOKIE (FIXED)
export const getUserFromRequest = async (req) => {
  try {
    // Try Next.js cookies API first (NextRequest)
    let token = null;
    try {
      token = req.cookies?.get?.('expense_token')?.value || null;
    } catch (e) {
      token = null;
    }

    // Fallback: parse Cookie header
    if (!token) {
      const cookieHeader = req.headers?.get?.('cookie') || req.headers?.cookie || null;
      if (cookieHeader) {
        const match = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('expense_token='));
        if (match) token = match.split('=')[1];
      }
    }

    // Fallback: Authorization Bearer token
    if (!token) {
      const auth = req.headers?.get?.('authorization') || req.headers?.authorization || null;
      if (auth && auth.startsWith('Bearer ')) token = auth.split(' ')[1];
    }

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: Number(decoded.id) } });
    return user || null;
  } catch (err) {
    return null;
  }
};