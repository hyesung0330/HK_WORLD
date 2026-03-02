import { prisma } from "./prisma";
import { UserRole, BestEditorType } from "@prisma/client";

export const XP_RULES = {
    POST: 20,
    LIKE: 50,
    VIEW: 0.2, // 1 XP per 5 views
    AWARD: {
        GOLD: 100000,
        SILVER: 20000,
        BRONZE: 10000,
    },
};

export function calculateLevel(totalXp: number): number {
    let level = 1;
    let requiredXp = 100;
    let currentTotalXp = totalXp;

    while (currentTotalXp >= requiredXp) {
        currentTotalXp -= requiredXp;
        level++;
        requiredXp = level * 100;
        // Prevent infinite loop or too high level if needed, but 100 increment is safe
        if (level >= 100) break; 
    }
    return level;
}

export async function updateUserStats(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            posts: {
                include: {
                    _count: {
                        select: { likes: true }
                    }
                }
            },
            awardsReceived: true,
        }
    });

    if (!user) return;

    // Calculate total stats
    const totalLikes = user.posts.reduce((sum, post) => sum + post._count.likes, 0);
    const totalViews = user.posts.reduce((sum, post) => sum + post.views, 0);
    
    const bronzeAwards = user.awardsReceived.filter(a => a.type === BestEditorType.BRONZE).length;
    const silverAwards = user.awardsReceived.filter(a => a.type === BestEditorType.SILVER).length;
    const goldAwards = user.awardsReceived.filter(a => a.type === BestEditorType.GOLD).length;

    const level = calculateLevel(user.xp);
    let newRole = UserRole.JUNIOR;

    if (level >= 50) {
        const cond1 = totalLikes >= 100 && totalViews >= 10000;
        const cond2 = bronzeAwards >= 100 || silverAwards >= 50 || goldAwards >= 10;
        if (cond1 || cond2) {
            newRole = UserRole.PROFESSIONAL;
        } else {
            newRole = UserRole.PRO; // Stay at PRO if level 50 but conditions not met?
            // Actually requirement says Professional Editor is level 50.
            // "전문 에디터 등업 조건... 전문 에디터 (레벨 50)"
            // This might mean you need level 50 AND conditions.
        }
    } else if (level >= 31) {
        const cond1 = totalLikes >= 100 && totalViews >= 2000;
        const cond2 = bronzeAwards >= 10 || silverAwards >= 5 || goldAwards >= 1;
        if (cond1 || cond2) {
            newRole = UserRole.PRO;
        } else {
            newRole = UserRole.SENIOR;
        }
    } else if (level >= 11) {
        const cond1 = totalLikes >= 10 && totalViews >= 30;
        const cond2 = bronzeAwards >= 1;
        if (cond1 || cond2) {
            newRole = UserRole.SENIOR;
        } else {
            newRole = UserRole.JUNIOR;
        }
    }

    // Special case: if level is high but doesn't meet role requirements, 
    // we might need to cap the role.
    // The requirement says: 
    // Junior (1-10)
    // Senior (11-30)
    // Pro (31-49)
    // Professional (50)
    
    // Let's refine role based on level first, then check conditions for "upgrading"
    
    if (level >= 50) {
        const cond = (totalLikes >= 100 && totalViews >= 10000) || bronzeAwards >= 100 || silverAwards >= 50 || goldAwards >= 10;
        newRole = cond ? UserRole.PROFESSIONAL : UserRole.PRO;
    } else if (level >= 31) {
        const cond = (totalLikes >= 100 && totalViews >= 2000) || bronzeAwards >= 10 || silverAwards >= 5 || goldAwards >= 1;
        newRole = cond ? UserRole.PRO : UserRole.SENIOR;
    } else if (level >= 11) {
        const cond = (totalLikes >= 10 && totalViews >= 30) || bronzeAwards >= 1;
        newRole = cond ? UserRole.SENIOR : UserRole.JUNIOR;
    } else {
        newRole = UserRole.JUNIOR;
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            level: level,
            role: newRole,
        }
    });
}

export async function addXp(userId: number, xpAmount: number) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            xp: { increment: xpAmount }
        }
    });
    await updateUserStats(userId);
}
