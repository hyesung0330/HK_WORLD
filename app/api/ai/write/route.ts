import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await auth();
        const { messages, step, topic, currentContent } = await req.json();
        const API_KEY = process.env.OPENAI_API_KEY;

        if (!API_KEY) {
            return NextResponse.json({ error: "OpenAI API 키가 설정되지 않았습니다." }, { status: 500 });
        }

        // 0. 구독/사용량 체크 (로그인 사용자 + Logra 구독자 전용)
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        }

        const rawId = session.user.id as any;
        const userId = typeof rawId === "string" ? parseInt(rawId) : Number(rawId);

        if (isNaN(userId)) {
            return NextResponse.json({ error: "유효하지 않은 사용자 ID입니다." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                lograSubscription: true,
                lograUsageCount: true,
                lograNextReset: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
        }

        // FREE 요금제: 월 10회까지만 Logra AI 사용 허용
        if (user.lograSubscription === "FREE") {
            const now = new Date();

            // 리셋 시점이 지났으면 사용량 초기화
            if (user.lograNextReset && now > user.lograNextReset) {
                const nextMonth = new Date();
                nextMonth.setMonth(nextMonth.getMonth() + 1);

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        lograUsageCount: 0,
                        lograNextReset: nextMonth,
                    },
                });

                user.lograUsageCount = 0;
            }

            if (user.lograUsageCount >= 10) {
                return NextResponse.json(
                    {
                        error:
                            "이번 달 LOGRA FREE 사용 가능 횟수(10회)를 모두 사용하셨습니다. 다음 달에 다시 이용해 주세요.",
                    },
                    { status: 403 },
                );
            }
        }

        // 1. 시스템 지침 설정: JSON 응답 강제 및 사족/마무리 멘트 금지
        let systemRoleContent = `당신은 블로그 전문 에이전트 'Logra'입니다.
        사용자는 블로그에 직접 게시할 완성된 글을 작성하려고 합니다.
        모든 답변은 반드시 지정된 JSON 형식으로만 응답해야 합니다.
        아래와 같은 형태의 문장은 절대 포함하지 마세요.
        - "도움이 필요하면 말씀해 주세요"
        - "추가로 보강하고 싶은 내용이나 수정할 부분이 있다면 말씀해 주세요"
        - 이와 유사하게 독자나 사용자에게 앞으로 어떻게 할지 묻는 질문형 문장
        글의 초입이나 끝에 독자에게 말을 거는 마무리 멘트(예: '~싶다면 말씀해 주세요', '~원하시면 도와드리겠습니다')도 넣지 마세요.
        전문적이고 서정적인 한국어 문체를 유지하되, 블로그 글 본문에만 집중하세요.`;

        switch (step) {
            case 'ideation':
                systemRoleContent += `
                [목표] 사용자가 블로그 글의 주제와 방향을 스스로 선택할 수 있도록 돕습니다.
                [JSON 형식]
                {
                  "message": "아이디어를 한두 문단으로 정리하거나 보완한 설명",
                  "suggestions": [
                    "이 주제로 블로그 전체 초안을 써줘",
                    "이 주제로 제목과 목차만 만들어줘",
                    "지금 이야기한 내용을 표 한 개로만 정리해줘"
                  ]
                }`;
                break;

            case 'structuring':
                systemRoleContent += `
                [목표] 블로그 포스트의 제목과 목차를 설계합니다.
                [JSON 형식]
                {
                  "title": "매력적인 추천 제목",
                  "content": "HTML <ul> 리스트로 작성된 목차",
                  "suggestions": [
                    "이 목차로 전체 본문을 써줘",
                    "이 목차에 표를 한 개만 넣어서 써줘",
                    "조금 더 캐주얼한 톤으로 다시 만들어줘"
                  ]
                }`;
                break;

            case 'drafting':
                systemRoleContent += `
                [목표] "${topic}"에 대한 블로그 본문을 작성합니다.
                [규칙]
                1. 사용자가 블로그에 바로 붙여 넣을 수 있는 일반적인 글 형식으로 작성합니다.
                   - <h2>, <h3>, <p>, <ul>, <li> 태그를 활용해 자연스럽게 단락을 나누세요.
                2. 기본적으로 표(<table>)는 사용하지 말고 서술형으로 작성합니다.
                   사용자가 이전 대화에서 "표로 정리해줘", "table 로 만들어줘" 등 명시적으로 요청한 경우에만,
                   글의 중간에 내용을 요약하거나 비교하는 용도의 <table>을 선택적으로 한 번 포함할 수 있습니다.
                   이때도 페이지 전체를 테이블로 만들지 말고, 표 위아래는 항상 일반 문단(<p>)으로 구성하세요.
                3. 이미지는 선택 사항이며, 넣을 경우
                   <img src="https://via.placeholder.com/800x400?text=Logra+Image" alt="Placeholder" />
                   형식을 사용하세요.
                4. 글의 초입과 끝에는 독자에게 말을 거는 문장을 넣지 말고, 내용 설명에만 집중하세요.
                5. 이 content는 페이지 전체 HTML이 아니라 블로그 글 본문 조각입니다.
                   <html>, <head>, <body>, <meta>, <title>, <script>, <style> 태그는 절대 추가하지 마세요.
                [JSON 형식]
                {
                  "title": "최종 확정 제목",
                  "content": "HTML 본문 내용",
                  "suggestions": ["조금 더 길게 써줘", "표가 필요하다면 중간에만 넣어줘", "전체 문체를 더 부드럽게 바꿔줘"]
                }`;
                break;

            case 'review':
                systemRoleContent += `
                [목표] 사용자의 요청을 반영하여 기존 본문을 수정합니다.
                현재 에디터 내용은 페이지 전체 소스가 아니라, <article> 안에 들어갈 본문 HTML 조각이라고 생각하세요.
                - <html>, <head>, <body>, <meta>, <title>, <script>, <style> 등의 태그는 추가하거나 수정하지 마세요.
                - 이미 존재하는 단락(<p>), 제목(<h2>, <h3> 등), 리스트(<ul>, <li>) 중심으로 문장만 수정/보강하세요.
                - "SEO 태그"를 추가해달라는 요청이 있어도, meta 태그를 만들지 말고
                  본문 맨 아래에 "키워드" 섹션을 하나 추가해 해시태그 형태로만 노출하세요. 예) <p>키워드: #예시1 #예시2</p>
                독자나 사용자에게 말을 거는 마무리 멘트는 추가하지 말고, 요청된 부분 위주로만 문장을 수정하거나 보강하세요.
                [JSON 형식]
                {
                  "message": "어느 부분을 어떻게 수정했는지에 대한 간단한 설명",
                  "content": "수정된 전체 HTML 본문",
                  "suggestions": ["본문 하단에 키워드 한 줄 추가", "이미지 한 장 추가", "전반적으로 더 짧게 줄이기"]
                }`;
                break;

            case 'tagging':
                systemRoleContent += `
                [목표] 블로그 글에 사용할 SEO 해시태그 5개를 생성합니다.
                - HTML 태그(<meta>, <title> 등)를 만들지 말고, 오직 해시태그 문자열만 생성하세요.
                - 예: ["#React", "#프론트엔드", "#NextJS블로그", "#웹개발", "#성능최적화"]
                - content나 다른 필드는 절대 포함하지 말고, "tags" 배열만 포함하세요.
                [JSON 형식]
                {
                  "tags": ["#태그1", "#태그2", "#태그3", "#태그4", "#태그5"]
                }`;
                break;
        }

        // 2. 메시지 구조화
        const formattedMessages = [
            { role: "system", content: systemRoleContent },
            ...messages.map((m: any) => ({
                role: m.role === "user" ? "user" : "assistant",
                content: m.content,
            })),
        ];

        // 3. API 호출
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: formattedMessages,
                temperature: 0.7,
                // JSON 모드 활성화 (시스템 프롬프트에 'JSON' 단어가 포함되어야 작동함)
                response_format: { type: "json_object" }
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenAI API Error:", data);
            return NextResponse.json(
                { error: data.error?.message || "AI 응답 생성 실패" },
                { status: response.status }
            );
        }

        // AI가 반환한 JSON 문자열을 객체로 파싱하여 클라이언트에 전달
        const aiResponse = JSON.parse(data.choices[0].message.content);

        // FREE 요금제인 경우에만 Logra 사용 횟수 증가
        if (user.lograSubscription === "FREE") {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    lograUsageCount: { increment: 1 },
                },
            });
        }

        return NextResponse.json(aiResponse);

    } catch (error: any) {
        console.error("OpenAI Server Error:", error);
        return NextResponse.json({ error: "서버 내부 오류가 발생했습니다." }, { status: 500 });
    }
}