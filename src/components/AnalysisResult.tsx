import type { Shensha } from "@/utils/saju-calculator";
import type { SajuAnalysis, FiveElement } from "../utils/saju-analyzer";

interface AnalysisResultProps {
  analysis: SajuAnalysis;
  shensha: Shensha[];
}

const ELEMENT_ORDER: FiveElement[] = ["wood", "fire", "earth", "metal", "water"];

const ELEMENT_LABEL: Record<FiveElement, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

const ELEMENT_SHORT_LABEL: Record<FiveElement, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};

const SHENSHA_ICON: Record<Shensha["name"], string> = {
  도화살: "🌺",
  역마살: "🚚",
  화개살: "🕯",
};

const PILLAR_LABEL: Record<Shensha["pillar"], string> = {
  year: "연주",
  month: "월주",
  day: "일주",
  time: "시주",
};

const SVG_SIZE = 260;
const SVG_CENTER = SVG_SIZE / 2;
const SVG_RADIUS = 84;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1] as const;
const RADAR_ANGLE_OFFSET = -Math.PI / 2;

function axisPoint(index: number, ratio: number) {
  const angle = RADAR_ANGLE_OFFSET + (Math.PI * 2 * index) / ELEMENT_ORDER.length;
  return {
    x: SVG_CENTER + Math.cos(angle) * SVG_RADIUS * ratio,
    y: SVG_CENTER + Math.sin(angle) * SVG_RADIUS * ratio,
  };
}

export function buildRadarPolygonPoints(counts: Record<FiveElement, number>): string {
  return ELEMENT_ORDER.map((element, index) => {
    const ratio = Math.max(0, Math.min(1, counts[element] / 8));
    const point = axisPoint(index, ratio);
    return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
  }).join(" ");
}

export function buildRadarGridPoints(level: number): string {
  return ELEMENT_ORDER.map((_, index) => {
    const point = axisPoint(index, level);
    return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
  }).join(" ");
}

export default function AnalysisResult({ analysis, shensha }: AnalysisResultProps) {
  const { ilju, iljuKey, iljuHeadline, element } = analysis;
  const hasImbalance = element.excessive.length > 0 || element.deficient.length > 0;
  const dataPolygon = buildRadarPolygonPoints(element.counts);

  return (
    <section className="analysis-stack" aria-live="polite">
      <article className="analysis-card shensha-section">
        <h3 className="analysis-title">특수 기운 발견!</h3>
        {shensha.length === 0 ? (
          <p className="analysis-body">특수 기운이 두드러지지 않습니다.</p>
        ) : (
          <div className="shensha-list">
            {shensha.map((item) => (
              <article key={`${item.name}-${item.pillar}`} className="shensha-card">
                <p className="shensha-name">
                  <span aria-hidden="true">{SHENSHA_ICON[item.name]}</span> {item.name}({PILLAR_LABEL[item.pillar]})
                </p>
                <p className="shensha-desc">{item.description}</p>
              </article>
            ))}
          </div>
        )}
      </article>

      <article className="analysis-card">
        <h3 className="analysis-title">일주론</h3>
        <p className="analysis-headline">{iljuHeadline}</p>
        {ilju ? (
          <div className="analysis-body">
            <p>
              <strong>성향:</strong> {ilju.personality}
            </p>
            <p>
              <strong>재물운:</strong> {ilju.wealth}
            </p>
            <p>
              <strong>직업 적성:</strong> {ilju.career}
            </p>
          </div>
        ) : (
          <div className="analysis-body">
            <p>일주 키: {iljuKey}</p>
            <p>해당 일주의 상세 해석은 다음 업데이트에서 보강될 예정입니다.</p>
          </div>
        )}
      </article>

      <article className="analysis-card">
        <h3 className="analysis-title">오행 분석</h3>
        <div className="five-elements-chart">
          <svg
            className="radar-svg"
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            role="img"
            aria-label="오행 레이더 차트"
          >
            {GRID_LEVELS.map((level) => (
              <polygon
                key={`grid-${level}`}
                className="radar-grid"
                points={buildRadarGridPoints(level)}
              />
            ))}
            {ELEMENT_ORDER.map((_, index) => {
              const outerPoint = axisPoint(index, 1);
              return (
                <line
                  key={`axis-${index}`}
                  className="radar-axis"
                  x1={SVG_CENTER}
                  y1={SVG_CENTER}
                  x2={outerPoint.x}
                  y2={outerPoint.y}
                />
              );
            })}
            <polygon className="radar-shape" points={dataPolygon} />
            {ELEMENT_ORDER.map((elementKey, index) => {
              const labelPoint = axisPoint(index, 1.2);
              return (
                <text key={`label-${elementKey}`} x={labelPoint.x} y={labelPoint.y} className="radar-label">
                  {ELEMENT_SHORT_LABEL[elementKey]} {element.counts[elementKey]}
                </text>
              );
            })}
          </svg>
        </div>

        <div className="analysis-chip-row">
          {element.excessive.map((item) => (
            <span key={`ex-${item}`} className="analysis-chip excessive">
              과다: {ELEMENT_LABEL[item]}
            </span>
          ))}
          {element.deficient.map((item) => (
            <span key={`de-${item}`} className="analysis-chip deficient">
              부족: {ELEMENT_LABEL[item]}
            </span>
          ))}
          {!hasImbalance ? <span className="analysis-chip balanced">균형</span> : null}
        </div>

        <div className="element-list">
          {ELEMENT_ORDER.map((item) => {
            const count = element.counts[item];
            const width = `${(count / 8) * 100}%`;
            return (
              <div className="element-row" key={item}>
                <span className="element-label">{ELEMENT_LABEL[item]}</span>
                <div className="element-bar-track" aria-hidden="true">
                  <div className="element-bar-fill" style={{ width }} />
                </div>
                <span className="element-count">{count}</span>
              </div>
            );
          })}
        </div>

        <ul className="analysis-message-list">
          {element.messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
