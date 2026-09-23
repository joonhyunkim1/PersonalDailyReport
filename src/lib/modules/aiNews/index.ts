import type { AiNewsContent } from "@/types/briefing";
import type { ModuleContext, ModuleResult, SectionModule } from "@/lib/modules/types";
import { researchWithWebSearch, type WebSearchPassResult } from "@/lib/openai/webSearch";
import { generateStructured } from "@/lib/openai/responses";
import { AiNewsSchema } from "@/lib/openai/schemas/aiNews.schema";
import { MODELS } from "@/lib/openai/client";
import { getRecentAiNewsTitles } from "@/lib/dedup/aiNewsHistory";

// "AI / 임베디드 뉴스" — merged from the former separate AI/CV news and
// 반도체/임베디드 뉴스 sections (AI is a superset of CV, and embedded news
// matches the user's major/experience more directly). One research call
// now covers both scopes instead of two, roughly halving this section's cost.
const RESEARCH_INSTRUCTIONS = `"AI / 임베디드 뉴스" 섹션을 위한 리서치를 수행하세요. 이 섹션은 두 영역을 합친 것입니다:

1) AI/Computer Vision 연구·제품 소식: OpenAI, Anthropic, NVIDIA, Google DeepMind, Meta, Hugging Face
2) 반도체/임베디드 소식: NVIDIA, Qualcomm, Intel, AMD, 삼성전자, SK하이닉스, TSMC

최근 24~48시간 이내의 것을 우선하여 총 6건(최소 5, 최대 6)을 찾으세요. 1) AI 영역에서 최소 3건,
2) 반도체/임베디드 영역에서 최소 2건을 포함하고, 서로 다른 소식이어야 합니다(같은 발표를 다른
각도로 두 번 다루지 말 것). 공식 블로그/뉴스룸 등 신뢰할 수 있는 소스를 우선하고, 최소 3개 이상의
서로 다른 도메인에서 소스를 확보하세요.
최신 소식이 없다면 없다고 명시하고 지어내지 마세요.

각 기사에 대해 다음을 정리하세요: 제목, 핵심 요약, 왜 중요한가, 연구자 관점 해설,
엔지니어(AI/CV/Embedded 취업 준비생, Jetson/PyTorch 경험 보유) 관점 해설,
출처(매체/공식 블로그 이름과 원문 URL), 발표/보도 날짜,
그리고 원문에 나온 구체적인 사실·수치 2~4개(성능 수치, 가격, 출시 일정, 파트너사, 규모 등).`;

const STRUCTURE_INSTRUCTIONS = `아래는 "AI / 임베디드 뉴스" 섹션을 위해 수집된 리서치 내용과, 검색에서 실제로
인용된 출처 목록입니다. 이를 요청된 JSON 스키마에 맞게 정리하세요. 리서치에 없는 내용을 지어내지 마세요.

- keyFacts: 리서치에 명시된 구체적인 사실·수치만 2~4개. 해석이나 전망이 아니라 확인 가능한 사실로 쓰세요.
- sourceUrl: 반드시 아래 "인용된 출처" 목록에 있는 URL 중 해당 기사의 원문을 고르세요. 목록에 맞는
  URL이 없으면 null. URL을 추측하거나 조합하지 마세요.
- sourceName: 매체/공식 블로그 이름 (예: "NVIDIA Blog", "The Verge"). 모르면 null.
- publishedDate: 발표/보도 날짜를 YYYY-MM-DD로. 리서치에 날짜가 없으면 null.`;

function buildStructureInput(research: WebSearchPassResult): string {
  if (research.citations.length === 0) return research.text;
  const sources = research.citations.map((c) => `- ${c.title}: ${c.url}`).join("\n");
  return `${research.text}\n\n[인용된 출처]\n${sources}`;
}

// Phase 2: two-pass pattern (docs/DESIGN.md section 6.3) — Pass 1 does
// web_search-backed retrieval as free text, Pass 2 (cheaper mini model)
// structures that text into the section's JSON schema.
export const aiNewsModule: SectionModule<AiNewsContent> = {
  type: "AI_NEWS",
  async generate(ctx: ModuleContext): Promise<ModuleResult<AiNewsContent>> {
    const recentTitles = await getRecentAiNewsTitles(ctx.userId);
    const researchInstructions =
      recentTitles.length > 0
        ? `${RESEARCH_INSTRUCTIONS}\n\n최근 7일간 이미 다룬 기사(아래 제목들)와 겹치지 않는 새로운 소식 위주로 찾으세요: ${recentTitles.join(" | ")}`
        : RESEARCH_INSTRUCTIONS;

    const research = await researchWithWebSearch({
      instructions: researchInstructions,
      input: "오늘의 AI/임베디드 뉴스를 리서치해주세요.",
    });

    const structured = await generateStructured<AiNewsContent>({
      model: MODELS.mini,
      schema: AiNewsSchema,
      schemaName: "ai_news",
      instructions: STRUCTURE_INSTRUCTIONS,
      input: buildStructureInput(research),
    });

    return {
      status: "SUCCESS",
      tokensInput: research.tokensInput + structured.tokensInput,
      tokensOutput: research.tokensOutput + structured.tokensOutput,
      costUsd: research.costUsd + structured.costUsd,
      content: structured.content,
    };
  },
};
