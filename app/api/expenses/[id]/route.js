import prisma from "@/lib/prisma";

// ✅ GET single expense
export async function GET(req, { params }) {
  try {
    // ⚠️ Next.js params is async
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.findUnique({
      where: { id: Number(id) },
      include: {
        category: true, // 👈 needed for expense.category?.name in frontend
      },
    });

    if (!expense) {
      return Response.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    return Response.json({ expense });

  } catch (error) {
    console.error("GET EXPENSE ERROR:", error);

    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
// DELETE expense
// export async function DELETE(req, { params }) {
//   try {
//     const { id } = params;

//     if (!id) {
//       return Response.json(
//         { error: "Expense ID is required" },
//         { status: 400 }
//       );
//     }

//     const expenseId = Number(id);

//     if (isNaN(expenseId)) {
//       return Response.json(
//         { error: "Invalid expense ID" },
//         { status: 400 }
//       );
//     }

//     // Check if exists
//     const existing = await prisma.expense.findUnique({
//       where: { id: expenseId }
//     });

//     if (!existing) {
//       return Response.json(
//         { error: "Expense not found" },
//         { status: 404 }
//       );
//     }

//     // Delete
//     await prisma.expense.delete({
//       where: { id: expenseId }
//     });

//     return Response.json({
//       message: "Expense deleted successfully"
//     });

//   } catch (error) {
//     console.error("DELETE EXPENSE ERROR:", error);

//     return Response.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
// DELETE expense
export async function DELETE(req, { params }) {
  try {
    // ✅ IMPORTANT (Next.js async params)
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }

    // Optional: check if exists
    const existing = await prisma.expense.findUnique({
      where: { id: Number(id) }
    });

    if (!existing) {
      return Response.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    // ✅ Delete
    await prisma.expense.delete({
      where: { id: Number(id) }
    });

    return Response.json({
      message: "Expense deleted successfully"
    });

  } catch (error) {
    console.error("DELETE EXPENSE ERROR:", error);

    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}