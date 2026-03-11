import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcryptjs from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "필수 정보를 모두 입력해주세요." }, { status: 400 });
    }

    // 1. 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return NextResponse.json({ message: "비밀번호를 변경할 수 없는 계정입니다." }, { status: 400 });
    }

    // 2. 현재 비밀번호 확인
    const isPasswordMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json({ message: "현재 비밀번호가 일치하지 않습니다." }, { status: 400 });
    }

    // 3. 새 비밀번호 해싱 및 업데이트
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (error: any) {
    console.error("CHANGE_PASSWORD_ERROR", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
