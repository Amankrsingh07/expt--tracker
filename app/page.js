import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ExpensePro";
  return (
    <>
    <Navbar/>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4">
      
      <Card className="w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">
            {appName}
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Smart expense tracking for modern users 💸
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          
          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/signup">Create Account</Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Login to Account</Link>
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
            <span className="text-xs text-gray-500">Secure & Fast</span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-surface text-center">
              💰 Track Expenses
            </div>
            <div className="p-3 rounded-lg bg-surface text-center">
              📊 Smart Charts
            </div>
            <div className="p-3 rounded-lg bg-surface text-center">
              ⚡ Monthly Limits
            </div>
            <div className="p-3 rounded-lg bg-surface text-center">
              🌙 Dark Mode
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
    <Footer/>
    </>
  );
}