import { PrismaClient } from "@prisma/client";
import { notifyAchievement } from "./notifications";

var prisma = new PrismaClient();

export var ACHIEVEMENTS = [
    { key: "first_checkin", title: "First Check-in", description: "Complete your first mood check-in", emoji: "🏅" },
    { key: "streak_7", title: "Week Warrior", description: "Check in for 7 consecutive days", emoji: "🔥" },
    { key: "streak_30", title: "Monthly Master", description: "Check in for 30 consecutive days", emoji: "⭐" },
    { key: "journal_10", title: "Reflective", description: "Write 10 journal entries", emoji: "📖" },
    { key: "journal_25", title: "Thoughtful", description: "Write 25 journal entries", emoji: "💭" },
    { key: "goal_first", title: "Goal Getter", description: "Complete your first goal", emoji: "🎯" },
    { key: "goal_10", title: "Achiever", description: "Complete 10 goals", emoji: "🏆" },
    { key: "checkins_100", title: "Century", description: "Reach 100 check-ins", emoji: "🌟" },
    { key: "member_30", title: "Loyal", description: "Be a member for 30 days", emoji: "🌱" },
];

export async function unlockAchievement(userId: string, key: string) {
    try {
        await prisma.achievement.create({
            data: { userId, key },
        });
        return true;
    } catch (e) {
        return false;
    }
}

export async function checkAchievements(userId: string) {
    var newlyUnlocked: string[] = [];

    var checkInCount = await prisma.moodEntry.count({ where: { userId } });
    if (checkInCount >= 1) {
        if (await unlockAchievement(userId, "first_checkin")) newlyUnlocked.push("first_checkin");
    }
    if (checkInCount >= 100) {
        if (await unlockAchievement(userId, "checkins_100")) newlyUnlocked.push("checkins_100");
    }

    var entries = await prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
    });

    var streak = calculateStreak(entries.map(function (e: any) { return e.createdAt; }));
    if (streak >= 7) {
        if (await unlockAchievement(userId, "streak_7")) newlyUnlocked.push("streak_7");
    }
    if (streak >= 30) {
        if (await unlockAchievement(userId, "streak_30")) newlyUnlocked.push("streak_30");
    }

    var journalCount = await prisma.journalEntry.count({ where: { userId } });
    if (journalCount >= 10) {
        if (await unlockAchievement(userId, "journal_10")) newlyUnlocked.push("journal_10");
    }
    if (journalCount >= 25) {
        if (await unlockAchievement(userId, "journal_25")) newlyUnlocked.push("journal_25");
    }

    var completedGoals = await prisma.goal.count({
        where: { userId, completed: true },
    });
    if (completedGoals >= 1) {
        if (await unlockAchievement(userId, "goal_first")) newlyUnlocked.push("goal_first");
    }
    if (completedGoals >= 10) {
        if (await unlockAchievement(userId, "goal_10")) newlyUnlocked.push("goal_10");
    }

    var user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
        var daysSinceJoin = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000);
        if (daysSinceJoin >= 30) {
            if (await unlockAchievement(userId, "member_30")) newlyUnlocked.push("member_30");
        }
    }

    // Send notifications for newly unlocked achievements
    for (var i = 0; i < newlyUnlocked.length; i++) {
        await notifyAchievement(userId, newlyUnlocked[i]);
    }

    return newlyUnlocked;
}

function calculateStreak(dates: Date[]): number {
    if (dates.length === 0) return 0;

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var uniqueDates = Array.from(
        new Set(dates.map(function (d: any) {
            var day = new Date(d);
            day.setHours(0, 0, 0, 0);
            return day.getTime();
        }))
    ).sort(function (a: any, b: any) { return b - a; });

    var streak = 0;
    var checkDate = today.getTime();

    for (var j = 0; j < uniqueDates.length; j++) {
        if (uniqueDates[j] === checkDate) {
            streak++;
            checkDate -= 86400000;
        } else if (uniqueDates[j] < checkDate) {
            break;
        }
    }

    return streak;
}