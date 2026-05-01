"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Login failed");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    }

    setLoading(false);
  };

return (
  <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-black">

    <div className="w-full max-w-md">

      {/* 🔷 Brand */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          ExpensePro
        </h1>
        <p className="text-sm text-muted mt-1">
          Welcome back 👋
        </p>
      </div>

      {/* 🧾 Card */}
      <Card className="shadow-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">

        <CardHeader>
          <CardTitle className="text-center text-xl">
            Sign in to your account
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                {...register("email")}
                placeholder="you@example.com"
                className="input"
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label>Password</Label>
              <Input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="input"
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Button */}
            <Button
              className="w-full mt-2"
              disabled={!isValid || loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

          </form>

          {/* Footer */}
          <p className="text-center text-sm mt-6 text-muted">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-indigo-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Bottom note */}
      <p className="text-center text-xs text-muted mt-6">
        Secure • Private • Reliable
      </p>

    </div>
  </div>
);
}
