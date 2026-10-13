import { prisma } from "./prisma";
import { sendPushNotification } from "./push";

async function getPreferences(userId: string) {
    var prefs = await prisma.notificationPreference.findUnique({
        where: { userId },
    });

    if (!prefs) {
        prefs = await prisma.notificationPreference.create({
            data: { userId },
        });
    }

    return prefs;
}

export async function createNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    link?: string
) {
    try {
        var prefs = await getPreferences(userId);

        if (type === "achievement" && !prefs.achievements) return false;
        if (type === "insight" && !prefs.insights) return false;
        if (type === "streak" && !prefs.streakReminders) return false;
        if (type === "daily_checkin" && !prefs.dailyCheckin) return false;
        if (type === "weekly_summary" && !prefs.weeklySummary) return false;
        if (type === "reaction" && !prefs.reactions) return false;
        if (type === "reply" && !prefs.replies) return false;

        await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                body,
                link: link || null,
            },
        });

        await sendPushNotification(userId, title, body, { link: link || null });

        return true;
    } catch (e) {
        console.error("createNotification failed:", e);
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

export async function notifyStreakReminder(userId: string, streak: number, slot?: string) {
    var suffix = "";
    if (slot === "morning") suffix = " Start your day strong.";
    else if (slot === "afternoon") suffix = " You still have time today.";
    else if (slot === "evening") suffix = " Don't let it slip — check in before bed.";

    return createNotification(
        userId,
        "streak",
        "🔥 Keep your streak alive",
        "You're on a " + streak + "-day streak. Check in today to keep it going." + suffix
    );
}

export async function notifyDailyCheckin(userId: string, slot?: string) {
    var titles: any = {
        morning: "☀️ Good morning",
        afternoon: "🌤️ Afternoon check-in",
        evening: "🌙 Evening reflection",
    };
    var bodies: any = {
        morning: "How are you starting today? Take 30 seconds to check in.",
        afternoon: "Pause for a moment. How's your day going?",
        evening: "Before you wind down, how did today feel?",
    };

    var title = (slot && titles[slot]) || "🧠 How are you feeling today?";
    var body = (slot && bodies[slot]) || "Take 30 seconds to check in. It helps you understand yourself better.";

    return createNotification(userId, "daily_checkin", title, body);
}

export async function notifyReaction(
    postAuthorId: string,
    reactorName: string,
    postId: string,
    reactionEmoji: string,
    isReactorAnonymous: boolean
) {
    var who = isReactorAnonymous ? "Someone" : reactorName;
    return createNotification(
        postAuthorId,
        "reaction",
        reactionEmoji + " " + who + " reacted to your moment",
        "Tap to see it.",
        "/connect/" + postId
    );
}

export async function notifyReply(
    targetUserId: string,
    replierName: string,
    postId: string,
    isReplierAnonymous: boolean,
    isThreadedReply: boolean
) {
    var who = isReplierAnonymous ? "Someone" : replierName;
    var title = isThreadedReply
        ? "💬 " + who + " replied to your comment"
        : "💬 " + who + " replied to your moment";

    return createNotification(
        targetUserId,
        "reply",
        title,
        "Tap to read what they said.",
        "/connect/" + postId
    );
}