import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createNotification({
  userId,
  type,
  message,
  link,
  fromUserId,
}: {
  userId: string;
  type: string;
  message: string;
  link?: string;
  fromUserId?: string;
}) {
  try {
    // Don't notify users about their own actions
    if (userId === fromUserId) return;

    await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        link: link || null,
        fromUserId: fromUserId || null,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}