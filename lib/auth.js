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

// Robust token extraction for route handlers and server components
export const getUserFromRequest = async (req) => {
  try {
    let token = null;

    // 1) Next's Request cookie API (route handlers expose this)
    token = req?.cookies?.get?.("expense_token")?.value || null;

    // 2) Fallback: cookie header parsing
    if (!token) {
      const cookieHeader = req?.headers?.get?.("cookie") || "";
      const cookie = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("expense_token="));

      if (cookie) token = cookie.split("=")[1];
    }

    // 3) If still not found, try next/headers cookies() (works in server contexts)
    if (!token) {
      try {
        // dynamic import to avoid issues in environments where next/headers isn't available
        const headers = await import("next/headers");
        // headers.cookies() may be async in some environments - await it then read the cookie
        const cookieStore = await headers.cookies();
        const ck = cookieStore.get("expense_token");
        if (ck) token = ck.value;
      } catch (e) {
        // ignore - only a fallback for Next server contexts
      }
    }

    // 4) Authorization header (Bearer) fallback
    if (!token) {
      const authHeader = req?.headers?.get?.("authorization") || "";
      if (authHeader.startsWith("Bearer ")) token = authHeader.slice(7);
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.id) },
    });

    return user || null;
  } catch (err) {
    // log once to help debug auth issues (dev only)
    if (process.env.NODE_ENV !== "production") {
      console.error("getUserFromRequest error:", err && err.message ? err.message : err);
    }
    return null;
  }
};