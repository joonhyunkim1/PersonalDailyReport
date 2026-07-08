import type { AiNewsContent } from "@/types/briefing";
import type { ModuleContext, ModuleResult, SectionModule } from "@/lib/modules/types";
import { researchWithWebSearch } from "@/lib/openai/webSearch";
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

최근 24~48시간 이내의 것을 우선하여 총 4건 내외(최소 3, 최대 5)를 찾되, 위 두 영역이 한쪽으로
치우치지 않도록 각 영역에서 최소 1건 이상 포함하세요. 공식 블로그/뉴스룸 등 신뢰할 수 있는
소스를 우선하고, 최소 2개 이상의 서로 다른 도메인에서 소스를 확보하세요.
최신 소식이 없다면 없다고 명시하고 지어내지 마세요.

각 기사에 대해 다음을 정리하세요: 제목, 핵심 요약, 왜 중요한가, 연구자 관점 해설,
엔지니어(AI/CV/Embedded 취업 준비생, Jetson/PyTorch 경험 보유) 관점 해설.`;

const STRUCTURE_INSTRUCTIONS = `아래는 "AI / 임베디드 뉴스" 섹션을 위해 수집된 리서치 내용입니다.
이를 요청된 JSON 스키마에 맞게 정리하세요. 리서치에 없는 내용을 지어내지 마세요.`;

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
      input: research.text,
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
