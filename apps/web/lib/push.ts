import { PrismaClient } from "@prisma/client";

var prisma = new PrismaClient();

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: any
) {
  try {
    var user = await prisma.user.findUnique({
      where: { id: userId },
      select: { expoPushToken: true },
    });

    if (!user?.expoPushToken) return false;

    var res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-encoding": "gzip, deflate",
      },
      body: JSON.stringify({
        to: user.expoPushToken,
        title: title,
        body: body,
        data: data || {},
        sound: "default",
      }),
    });

    return res.ok;
  } catch (e) {
    console.error("Push notification failed:", e);
    return false;
  }
}