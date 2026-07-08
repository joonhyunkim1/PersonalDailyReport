import type { StockMarketContent } from "@/types/briefing";
import type { ModuleContext, ModuleResult, SectionModule } from "@/lib/modules/types";
import { researchWithWebSearch } from "@/lib/openai/webSearch";
import { generateStructured } from "@/lib/openai/responses";
import { StockMarketSchema } from "@/lib/openai/schemas/stockMarket.schema";
import { MODELS } from "@/lib/openai/client";

const RESEARCH_INSTRUCTIONS = `"미국 증시 브리핑" 섹션을 위한 리서치를 수행하세요.

관심 종목: NVIDIA, Microsoft, Google, Tesla, Amazon. 관심 지수: S&P500, NASDAQ.

정확한 수치(종가, 등락률)는 web_search 결과에 오차가 있을 수 있으므로, 수치는 "약", "대략" 등의
표현과 함께 참고용으로만 제시하고, 핵심은 내러티브(왜 오르내렸는지, 무엇을 주목해야 하는지)에
집중하세요. 지어내지 마세요.

정리할 내용: 시장 요약, 주요 상승/하락 요인, AI 산업 영향, 오늘 주목할 이벤트.`;

const STRUCTURE_INSTRUCTIONS = `아래는 "미국 증시 브리핑" 섹션을 위해 수집된 리서치 내용입니다.
이를 요청된 JSON 스키마에 맞게 정리하세요. 리서치에 없는 내용을 지어내지 마세요. 정확한 수치는
"증권사 앱에서 확인" 같은 표현으로 참고용임을 명시하세요.`;

// Phase 2: two-pass pattern (docs/DESIGN.md section 6.3 / 7.5 accuracy caveat).
export const stockMarketModule: SectionModule<StockMarketContent> = {
  type: "STOCK_MARKET",
  async generate(_ctx: ModuleContext): Promise<ModuleResult<StockMarketContent>> {
    const research = await researchWithWebSearch({
      instructions: RESEARCH_INSTRUCTIONS,
      input: "오늘의 미국 증시 브리핑을 리서치해주세요.",
    });

    const structured = await generateStructured<StockMarketContent>({
      model: MODELS.mini,
      schema: StockMarketSchema,
      schemaName: "stock_market",
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
