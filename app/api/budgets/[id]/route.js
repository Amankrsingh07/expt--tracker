import prisma from "@/lib/prisma";

// GET single budget
export async function GET(req, { params }) {
  const { id } = await params;

  const budget = await prisma.budget.findUnique({
    where: { id: Number(id) }
  });

  return Response.json(budget);
}

// DELETE budget
export async function DELETE(req, { params }) {
  const { id } = await params;

  await prisma.budget.delete({
    where: { id: Number(id) }
  });

  return Response.json({ message: "Deleted" });
}