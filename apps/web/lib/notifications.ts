import { PrismaClient } from "@prisma/client";
import { sendPushNotification } from "./push";

var prisma = new PrismaClient();

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        link: link || null,
      },
    });

    // Also send push notification
    await sendPushNotification(userId, title, body, { link: link || null });

    return true;
  } catch (e) {
    return false;
  }
}

export async function notifyAchievement(userId: string, achievementKey: string) {
  var achievements: any = {
    first_checkin: { title: "🏅 First Check-in", body: "You completed your first mood check-in!" },
    streak_7: { title: "🔥 Week Warrior", body: "7-day streak unlocked. Keep going!" },
    streak_30: { title: "⭐ Monthly Master", body: "30-day streak. Incredible consistency." },
    journal_10: { title: "📖 Reflective", body: "You've written 10 journal entries." },
    journal_25: { title: "💭 Thoughtful", body: "25 journal entries. Deep reflection." },
    goal_first: { title: "🎯 Goal Getter", body: "You completed your first goal!" },
    goal_10: { title: "🏆 Achiever", body: "10 goals completed. Amazing work." },
    checkins_100: { title: "🌟 Century", body: "100 check-ins. You're a pro." },
    member_30: { title: "🌱 Loyal", body: "30 days on WellConnect. Thank you for being here." },
  };

  var a = achievements[achievementKey];
  if (!a) return false;

  return createNotification(userId, "achievement", a.title, a.body);
}

export async function notifyNewInsight(userId: string, insightTitle: string, insightBody: string) {
  return createNotification(userId, "insight", "💡 " + insightTitle, insightBody);
}

export async function notifyStreakReminder(userId: string, streak: number) {
  return createNotification(
    userId,
    "streak",
    "🔥 Keep your streak alive",
    "You're on a " + streak + "-day streak. Check in today to keep it going."
  );
}