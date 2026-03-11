import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "이메일을 입력해주세요." }, { status: 400 });
    }

    // 1. 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "해당 이메일로 가입된 사용자가 없습니다." }, { status: 404 });
    }

    // 2. 일반 회원인지 확인 (소셜 로그인 사용자는 password가 없음)
    if (!user.password) {
      return NextResponse.json({ message: "소셜 계정으로 가입된 사용자입니다. 해당 소셜 서비스를 이용해 로그인해주세요." }, { status: 400 });
    }

    // 3. 임시 비밀번호 생성 (8자리)
    const tempPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcryptjs.hash(tempPassword, 10);

    // 4. DB 업데이트
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // 5. 이메일 발송
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Textra 임시 비밀번호 안내</h2>
        <p>안녕하세요, Textra입니다.</p>
        <p>요청하신 임시 비밀번호가 발급되었습니다. 로그인 후 반드시 비밀번호를 변경해 주세요.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${tempPassword}</span>
        </div>
        <p style="color: #666; font-size: 12px;">본인이 요청하지 않은 경우, 고객센터로 문의해 주세요.</p>
      </div>
    `;

    const emailRes = await sendEmail({
      to: email,
      subject: "[Textra] 임시 비밀번호 발급 안내",
      html: emailHtml,
    });

    if (!emailRes.success) {
      // 이메일 발송 실패 시 (환경 변수 미설정 등)
      console.error("이메일 발송 실패:", emailRes.error);
      
      const isDev = process.env.NODE_ENV === "development";
      const errorMessage = emailRes.error === "EMAIL_USER_OR_PASS_MISSING"
        ? "이메일 서비스가 설정되지 않았습니다. 관리자에게 EMAIL_USER와 EMAIL_PASS 설정을 확인해 달라고 요청하세요."
        : "임시 비밀번호는 생성되었으나 이메일 발송에 실패했습니다. 관리자에게 문의하세요.";

      // 개발 환경에서는 이메일 발송 실패해도 200을 반환하여 UI에서 임시 비밀번호를 볼 수 있게 함
      if (isDev) {
        return NextResponse.json({ 
          message: `[개발모드] ${errorMessage}`,
          debug: `임시 비밀번호: ${tempPassword}`
        }, { status: 200 });
      }

      return NextResponse.json({ 
        message: errorMessage,
      }, { status: 500 });
    }

    return NextResponse.json({ message: "이메일로 임시 비밀번호를 전송했습니다." });
  } catch (error: any) {
    console.error("FORGOT_PASSWORD_ERROR", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
