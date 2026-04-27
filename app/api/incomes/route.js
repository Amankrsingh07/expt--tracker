import { db } from "@/lib/db"

// GET
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    const incomes = await prisma.income.findMany({
      where: userId ? { userId: Number(userId) } : {},
      orderBy: { createdAt: "desc" }
    })

    return Response.json(incomes)

  } catch (error) {
    console.error("GET /api/incomes error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// POST
export async function POST(req) {
  try {
    const body = await req.json()
    const { amount, source, userId } = body

    // Basic validation
    if (!amount || !source || !userId) {
      return Response.json(
        { error: "amount, source, and userId are required" },
        { status: 400 }
      )
    }

    const income = await prisma.income.create({
      data: {
        amount: Number(amount),
        source,
        userId: Number(userId)
      }
    })

    return Response.json(income)

  } catch (error) {
    console.error("POST /api/incomes error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}