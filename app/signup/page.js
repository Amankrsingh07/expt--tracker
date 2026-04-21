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
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Create Account
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Name */}
              <div className="space-y-2">
                <Label>Name</Label>
                <Input autoFocus {...register("name")} />
                {errors.name && (
                  <p className="text-red-500 text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-red-500 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" {...register("confirmPassword")} />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-sm text-center">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <Button
                className="w-full"
                disabled={!isValid || loading}
              >
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            <p className="text-center text-sm mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}