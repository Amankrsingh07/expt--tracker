import { getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req, context) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: paramId } = await context.params;
    const id = Number(paramId);

    if (!Number.isInteger(id) || id <= 0) {
      return Response.json(
        { error: "Invalid id", received: paramId },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== user.id) {
      return Response.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return Response.json(
      { notification: updatedNotification },
      { status: 200 }
    );
  } catch (error) {
    console.error("Notification PUT error:", error);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: paramId } = await context.params;
    const id = Number(paramId);

    if (!Number.isInteger(id) || id <= 0) {
      return Response.json(
        { error: "Invalid id", received: paramId },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== user.id) {
      return Response.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    await prisma.notification.delete({
      where: { id },
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Notification DELETE error:", error);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}