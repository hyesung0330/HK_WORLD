import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addXp, XP_RULES } from "@/lib/xp";

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
        }

        const userId = parseInt(session.user.id);
        const user = await prisma.$queryRaw<any[]>`
            SELECT id, consecutive_days as "consecutiveDays", last_attendance_date as "lastAttendanceDate", xp 
            FROM users 
            WHERE id = ${userId}
        `;

        if (!user || user.length === 0) {
            return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });
        }
        
        const userData = user[0];

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // 이미 오늘 출석했는지 확인
        if (userData.lastAttendanceDate) {
            const lastDate = new Date(userData.lastAttendanceDate);
            const lastAttendanceDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
            
            if (lastAttendanceDay.getTime() === today.getTime()) {
                return NextResponse.json({ message: "이미 오늘 출석체크를 완료했습니다." }, { status: 400 });
            }
        }

        // 연속 출석 여부 확인
        let newConsecutiveDays = 1;
        if (userData.lastAttendanceDate) {
            const lastDate = new Date(userData.lastAttendanceDate);
            const lastAttendanceDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
            
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastAttendanceDay.getTime() === yesterday.getTime()) {
                newConsecutiveDays = (userData.consecutiveDays || 0) + 1;
            }
        }

        // 기본 XP 지급
        let xpToGain = XP_RULES.ATTENDANCE.DAILY;
        let bonusMessage = "";

        // 보너스 XP 계산
        if (newConsecutiveDays === 3) {
            xpToGain += XP_RULES.ATTENDANCE.BONUS_3;
            bonusMessage = "3일 연속 출석 보너스!";
        } else if (newConsecutiveDays === 5) {
            xpToGain += XP_RULES.ATTENDANCE.BONUS_5;
            bonusMessage = "5일 연속 출석 보너스!";
        } else if (newConsecutiveDays === 7) {
            xpToGain += XP_RULES.ATTENDANCE.BONUS_7;
            bonusMessage = "7일 연속 출석 보너스!";
        } else if (newConsecutiveDays === 14) {
            xpToGain += XP_RULES.ATTENDANCE.BONUS_14;
            bonusMessage = "14일 연속 출석 보너스!";
        } else if (newConsecutiveDays === 30) {
            xpToGain += XP_RULES.ATTENDANCE.BONUS_30;
            bonusMessage = "30일 연속 출석 보너스!";
        }

        // DB 업데이트
        await prisma.$executeRaw`
            INSERT INTO attendances (user_id, date) 
            VALUES (${userData.id}, ${now})
        `;

        await prisma.$executeRaw`
            UPDATE users 
            SET consecutive_days = ${newConsecutiveDays}, 
                last_attendance_date = ${now}, 
                xp = xp + ${xpToGain}
            WHERE id = ${userData.id}
        `;

        // 레벨 및 역할 업데이트 (addXp 함수 내부에 포함되어 있음)
        // 하지만 위에서 직접 업데이트했으므로 여기서 한 번 더 호출하거나 addXp 로직을 활용해야 함
        // addXp를 쓰면 내부적으로 update와 updateUserStats를 호출하므로 더 깔끔함
        // 하지만 consecutiveDays도 업데이트해야 하므로 여기서는 직접 updateUserStats를 호출하겠음
        const { updateUserStats } = await import("@/lib/xp");
        await updateUserStats(userData.id);

        return NextResponse.json({
            message: bonusMessage || "출석체크가 완료되었습니다!",
            xpGained: xpToGain,
            consecutiveDays: newConsecutiveDays
        });

    } catch (error) {
        console.error("ATTENDANCE_POST_ERROR", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
        }

        const userId = parseInt(session.user.id);
        const user = await prisma.$queryRaw<any[]>`
            SELECT consecutive_days as "consecutiveDays", last_attendance_date as "lastAttendanceDate"
            FROM users 
            WHERE id = ${userId}
        `;

        if (!user || user.length === 0) {
            return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });
        }

        const userData = user[0];

        // 오늘 출석 여부 확인
        let isTodayChecked = false;
        if (userData.lastAttendanceDate) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const lastDate = new Date(userData.lastAttendanceDate);
            const lastAttendanceDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
            
            if (lastAttendanceDay.getTime() === today.getTime()) {
                isTodayChecked = true;
            }
        }

        // 이번 달 출석 기록 가져오기 (달력용)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const attendances = await prisma.$queryRaw<any[]>`
            SELECT date FROM attendances 
            WHERE user_id = ${userId} AND date >= ${startOfMonth}
            ORDER BY date ASC
        `;

        return NextResponse.json({
            consecutiveDays: userData.consecutiveDays,
            isTodayChecked,
            attendances: attendances.map(a => a.date)
        });
    } catch (error) {
        console.error("ATTENDANCE_GET_ERROR", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
