"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";

const schema = z
  .object({
    name: z.string().min(2, "Enter valid name"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Signup failed");
      } else {
        // redirect after success
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  return (
  <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-950">

    <div className="w-full max-w-md">

      {/* 🔷 Branding */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          ExpensePro
        </h1>
        <p className="text-sm text-muted mt-1">
          Create your account to get started
        </p>
      </div>

      {/* 🧾 Card */}
      <Card className="shadow-2xl border border-gray-200 dark:border-gray-800 backdrop-blur-md bg-white/70 dark:bg-slate-900/70">
        
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Sign Up
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >

            {/* Name */}
            <div className="space-y-1">
              <Label>Name</Label>
              <Input placeholder="John Doe" {...register("name")} />
              {errors.name && (
                <p className="text-red-500 text-xs">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-xs">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <Label>Confirm Password</Label>
              <Input type="password" placeholder="••••••••" {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/30 p-2 rounded">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              className="w-full mt-2"
              disabled={!isValid || loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>

          </form>

          {/* Footer */}
          <p className="text-center text-sm mt-6 text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-600 hover:underline"
            >
              Login
            </Link>
          </p>
        </CardContent>
      </Card>

    </div>
  </div>
);
}