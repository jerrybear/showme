import type { SajuPillar, SajuResult as SajuResultData, TenGodLabel } from "@/utils/saju-calculator";
import type { CalendarType, Gender } from "@/utils/saju-ui-helpers";
import AnalysisResult from "./AnalysisResult";
import { analyzeSaju } from "../utils/saju-analyzer";

interface SajuResultProps {
  result: SajuResultData;
  name?: string;
  gender: Gender;
  calendarType: CalendarType;
}

const PILLAR_LABELS = ["연주", "월주", "일주", "시주"] as const;

const PILLAR_KEYS = ["year", "month", "day", "time"] as const;

export const SAJU_MEANING_MAP: Record<string, string> = {
  甲: "갑목 - 큰 나무, 곧고 강한 성장성",
  乙: "을목 - 풀과 꽃, 유연하고 섬세한 기운",
  丙: "병화 - 태양의 불, 밝고 직선적인 에너지",
  丁: "정화 - 촛불의 불, 따뜻하고 정교한 에너지",
  戊: "무토 - 산의 흙, 묵직하고 중심 잡는 힘",
  己: "기토 - 들판의 흙, 포용력과 실용성",
  庚: "경금 - 원석의 금, 강단과 결단력",
  辛: "신금 - 보석의 금, 정밀함과 품격",
  壬: "임수 - 큰 물, 흐름과 확장성",
  癸: "계수 - 이슬비의 물, 섬세함과 적응력",
  子: "자수 - 겨울 물의 시작, 지혜와 저장",
  丑: "축토 - 한겨울의 토, 인내와 축적",
  寅: "인목 - 봄의 시작, 추진력과 개척",
  卯: "묘목 - 봄의 확장, 관계와 성장",
  辰: "진토 - 전환의 토, 조율과 균형",
  巳: "사화 - 초여름의 불, 표현력과 열정",
  午: "오화 - 한낮의 불, 리더십과 존재감",
  未: "미토 - 여름 끝 토, 배려와 완성",
  申: "신금 - 가을 금의 시작, 실행력",
  酉: "유금 - 가을 금의 정점, 정확성과 질서",
  戌: "술토 - 가을 끝 토, 책임감과 보호",
  亥: "해수 - 겨울 물의 시작, 직관과 깊이",
};

export function getContrastTextColor(hex: string): "#111111" | "#F5F5F5" {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 150 ? "#111111" : "#F5F5F5";
}

export function getMeaningText(char: string): string {
  return SAJU_MEANING_MAP[char] ?? "해당 글자의 설명은 준비 중입니다.";
}

function GlyphBlock({
  char,
  kr,
  color,
  suffix,
  tenGod,
}: {
  char: string;
  kr: string;
  color: string;
  suffix: string;
  tenGod: TenGodLabel;
}) {
  const tooltipId = `tooltip-${char}-${suffix}`;
  const fg = getContrastTextColor(color);
  return (
    <div className="tooltip-wrap">
      <div
        className="glyph-box"
        style={{ backgroundColor: color, color: fg }}
        tabIndex={0}
        aria-describedby={tooltipId}
      >
        <div className="glyph-inline">
          <span className="tengod-badge">{tenGod}</span>
          <span className="glyph-hanja">{char}</span>
        </div>
        <span className="glyph-korean">{kr}</span>
      </div>
      <div id={tooltipId} role="tooltip" className="tooltip">
        {getMeaningText(char)}
      </div>
    </div>
  );
}

function PillarColumn({
  label,
  pillar,
  tenGods,
}: {
  label: string;
  pillar: SajuPillar;
  tenGods: { gan: TenGodLabel; ji: TenGodLabel };
}) {
  return (
    <article className="pillar-col">
      <h4 className="pillar-head">{label}</h4>
      <GlyphBlock
        char={pillar.gan}
        kr={pillar.ganKr}
        color={pillar.color}
        suffix={`${label}-gan`}
        tenGod={tenGods.gan}
      />
      <GlyphBlock
        char={pillar.ji}
        kr={pillar.jiKr}
        color={pillar.color}
        suffix={`${label}-ji`}
        tenGod={tenGods.ji}
      />
    </article>
  );
}

export default function SajuResult({ result, name, gender, calendarType }: SajuResultProps) {
  const analysis = analyzeSaju(result);
  const pillars = PILLAR_KEYS.map((key, index) => ({
    label: PILLAR_LABELS[index],
    data: result[key],
  }));

  const genderLabel = gender === "male" ? "남성" : "여성";
  const calendarLabel =
    calendarType === "solar" ? "양력" : calendarType === "lunar" ? "음력" : "음력(윤달)";

  return (
    <section className="result-card" aria-live="polite">
      <header className="result-header">
        <h2>사주 명식표</h2>
        <p>
          {name ? `${name} · ` : ""}
          {genderLabel} · {calendarLabel}
        </p>
        <p className="muted">양력 {result.solarDate}</p>
      </header>
      <div className="pillar-grid">
        {pillars.map((pillar) => (
          <PillarColumn
            key={pillar.label}
            label={pillar.label}
            pillar={pillar.data}
            tenGods={
              pillar.label === "연주"
                ? result.tenGods.year
                : pillar.label === "월주"
                  ? result.tenGods.month
                  : pillar.label === "일주"
                    ? result.tenGods.day
                    : result.tenGods.time
            }
          />
        ))}
      </div>
      <p className="result-footnote">음력 표기: {result.lunarDate}</p>
      <section className="daewoon-section">
        <h3 className="analysis-title">대운 흐름</h3>
        <p className="age-meta">
          현재 나이: 만 {result.currentAges.international}세 · 세는나이 {result.currentAges.korean}세
        </p>
        <div className="daewoon-flow">
          {result.daewoon.map((item, index) => (
            <article
              key={`${item.startAgeKorean}-${item.gan}${item.ji}`}
              className={`daewoon-item ${result.currentDaewoonIndex === index ? "active" : ""}`}
            >
              <p className="daewoon-ganzhi">
                {item.gan}
                {item.ji} <span>({item.ganKr}{item.jiKr})</span>
              </p>
              <p className="daewoon-age">
                만 {item.startAge}세 시작 · 세는나이 {item.startAgeKorean}세
              </p>
            </article>
          ))}
        </div>
      </section>
      <AnalysisResult analysis={analysis} shensha={result.shensha} />
    </section>
  );
}
