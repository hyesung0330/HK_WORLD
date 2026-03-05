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
    ATTENDANCE: {
        DAILY: 100,
        BONUS_3: 200,
        BONUS_5: 300,
        BONUS_7: 500,
        BONUS_14: 700,
        BONUS_30: 1000,
    }
};

export const POINT_RULES = {
    AWARD: {
        GOLD: 4000,
        SILVER: 1400,
        BRONZE: 700,
    },
};

/**
 * 누적 XP를 바탕으로 레벨 계산
 */
export function calculateLevel(totalXp: number): {
    level: number,
    currentLevelProgress: number,
    nextLevelRequiredXp: number
} {
    let level = 1;
    let remainingXp = Math.floor(totalXp);
    let requiredXpForNext = 100;

    while (remainingXp >= requiredXpForNext) {
        remainingXp -= requiredXpForNext;
        level++;
        requiredXpForNext = level * 100;
        if (level >= 100) break;
    }

    return {
        level,
        currentLevelProgress: remainingXp,
        nextLevelRequiredXp: requiredXpForNext
    };
}

/**
 * 유저의 활동 통계를 바탕으로 레벨과 역할 업데이트
 */
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
            _count: {
                select: { followers: true }
            }
        }
    });

    if (!user) return;

    // 1. 통계 집계
    const totalLikes = user.posts.reduce((sum, post) => sum + post._count.likes, 0);
    const totalViews = user.posts.reduce((sum, post) => sum + post.views, 0);
    const totalFollowers = user._count.followers;

    const bronzeAwards = user.awardsReceived.filter(a => a.type === BestEditorType.BRONZE).length;
    const silverAwards = user.awardsReceived.filter(a => a.type === BestEditorType.SILVER).length;
    const goldAwards = user.awardsReceived.filter(a => a.type === BestEditorType.GOLD).length;

    // 2. 레벨 계산
    const { level } = calculateLevel(user.xp);
    let newRole = UserRole.JUNIOR;

    // 3. 역할(Role) 결정 로직 (최신 가이드 조건 반영)

    // [Professional] 전문 에디터 조건 (Lv.50 + 올라운더 조건)
    if (level >= 50) {
        const meetsProfessionalCond =
            totalLikes >= 1000 &&
            totalViews >= 10000 &&
            goldAwards >= 10 &&
            silverAwards >= 10 && // 기존 50개에서 10개로 하향 조정 반영
            totalFollowers >= 100;

        newRole = meetsProfessionalCond ? UserRole.PROFESSIONAL : UserRole.PRO;
    }
    // [Pro] 프로 에디터 조건 (Lv.31 + 수익 창출 시작 조건)
    else if (level >= 31) {
        const meetsProCond =
            totalLikes >= 50 &&
            totalViews >= 2000 &&
            silverAwards >= 5 &&
            goldAwards >= 1 &&
            totalFollowers >= 10;

        newRole = meetsProCond ? UserRole.PRO : UserRole.SENIOR;
    }
    // [Senior] 시니어 에디터 조건 (Lv.11 + 메달 또는 순수 활동량)
    else if (level >= 11) {
        const meetsSeniorCond = bronzeAwards >= 1 || totalLikes >= 30;

        newRole = meetsSeniorCond ? UserRole.SENIOR : UserRole.JUNIOR;
    }
    else {
        newRole = UserRole.JUNIOR;
    }

    // 4. DB 업데이트
    await prisma.user.update({
        where: { id: userId },
        data: {
            level: level,
            role: newRole,
        }
    });
}

/**
 * 경험치 추가 및 통계 갱신
 */
export async function addXp(userId: number, xpAmount: number) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            xp: { increment: xpAmount }
        }
    });
    await updateUserStats(userId);
}

/**
 * 포인트 추가
 */
export async function addPoints(userId: number, pointAmount: number) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            points: { increment: pointAmount }
        }
    });
}