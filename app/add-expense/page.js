'use client';
import Layout from '@/components/Layout';
import ExpenseForm from '@/components/ExpenseForm';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AddExpensePage() {
  const router = useRouter();
  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
            💰 Add New Expense
          </h1>
          <p className="text-muted text-lg">Track your spending and stay within budget</p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <p className="text-4xl mb-2">📝</p>
              <p className="font-semibold">Add Details</p>
              <p className="text-sm text-muted mt-1">Fill in amount, category & date</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <p className="text-4xl mb-2">🎯</p>
              <p className="font-semibold">Check Budget</p>
              <p className="text-sm text-muted mt-1">System will warn if over budget</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6 text-center">
              <p className="text-4xl mb-2">✅</p>
              <p className="font-semibold">Save & Track</p>
              <p className="text-sm text-muted mt-1">Your expense is instantly tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              💳 Expense Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ExpenseForm onSuccess={() => router.push('/expenses?refresh=' + Date.now())} />
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">💡 Pro Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✓ Use descriptive category names for better tracking</p>
            <p>✓ Add a brief description to remember what you spent on</p>
            <p>✓ Set category budgets to control spending</p>
            <p>✓ Review your expenses weekly to stay on track</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
