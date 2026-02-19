import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { SajuAnalysis } from "@/utils/saju-analyzer";
import type { Shensha } from "@/utils/saju-calculator";
import AnalysisResult, { buildRadarGridPoints, buildRadarPolygonPoints } from "./AnalysisResult";

const baseAnalysis: SajuAnalysis = {
  iljuKey: "甲子",
  ilju: {
    key: "갑자(甲子)",
    gan: "甲",
    ji: "子",
    title: "푸른 쥐",
    personality: "균형감 있는 성향입니다.",
    wealth: "수입과 지출의 균형이 중요합니다.",
    career: "기획과 조율 역량이 강점입니다.",
  },
  iljuHeadline: "당신은 [푸른 쥐]의 기운을 타고났습니다.",
  element: {
    counts: { wood: 2, fire: 1, earth: 2, metal: 1, water: 2 },
    excessive: [],
    deficient: [],
    messages: ["오행 분포가 비교적 고르게 나타납니다."],
  },
};

describe("AnalysisResult", () => {
  it("renders shensha cards when present", () => {
    const shensha: Shensha[] = [
      {
        pillar: "year",
        name: "도화살",
        description: "연지 기준 도화 기운으로, 대중의 관심을 끄는 매력이 있습니다.",
      },
    ];

    const html = renderToStaticMarkup(<AnalysisResult analysis={baseAnalysis} shensha={shensha} />);

    expect(html).toContain("특수 기운 발견!");
    expect(html).toContain("도화살(연주)");
  });

  it("renders fallback text when no shensha", () => {
    const html = renderToStaticMarkup(<AnalysisResult analysis={baseAnalysis} shensha={[]} />);
    expect(html).toContain("특수 기운이 두드러지지 않습니다.");
  });

  it("renders radar svg with polygon and five labels", () => {
    const html = renderToStaticMarkup(<AnalysisResult analysis={baseAnalysis} shensha={[]} />);
    expect(html).toContain("<svg");
    expect(html).toContain("class=\"radar-shape\"");
    expect(html).toContain("목 2");
    expect(html).toContain("화 1");
    expect(html).toContain("토 2");
    expect(html).toContain("금 1");
    expect(html).toContain("수 2");
  });

  it("builds deterministic radar points", () => {
    const polygon = buildRadarPolygonPoints(baseAnalysis.element.counts);
    const grid = buildRadarGridPoints(1);

    expect(polygon.split(" ")).toHaveLength(5);
    expect(grid.split(" ")).toHaveLength(5);
  });
});
