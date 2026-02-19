import type { IljuInterpretation } from "../data/ilju-interpretations";
import { ILJU_BY_GAN_JI } from "../data/ilju-interpretations";
import type { SajuResult } from "./saju-calculator";

export type FiveElement = "wood" | "fire" | "earth" | "metal" | "water";

export interface ElementAnalysis {
  counts: Record<FiveElement, number>;
  excessive: FiveElement[];
  deficient: FiveElement[];
  messages: string[];
}

export interface SajuAnalysis {
  iljuKey: string;
  ilju: IljuInterpretation | null;
  iljuHeadline: string;
  element: ElementAnalysis;
}

const GAN_ELEMENT_MAP: Record<string, FiveElement> = {
  甲: "wood",
  乙: "wood",
  丙: "fire",
  丁: "fire",
  戊: "earth",
  己: "earth",
  庚: "metal",
  辛: "metal",
  壬: "water",
  癸: "water",
};

const ZHI_ELEMENT_MAP: Record<string, FiveElement> = {
  子: "water",
  丑: "earth",
  寅: "wood",
  卯: "wood",
  辰: "earth",
  巳: "fire",
  午: "fire",
  未: "earth",
  申: "metal",
  酉: "metal",
  戌: "earth",
  亥: "water",
};

const ELEMENT_ORDER: FiveElement[] = ["wood", "fire", "earth", "metal", "water"];

const ELEMENT_LABEL: Record<FiveElement, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

const EXCESSIVE_GUIDE: Record<FiveElement, string> = {
  wood: "성장 속도를 조절하고 우선순위를 나눠 추진해 보세요.",
  fire: "속도를 조절하고 휴식을 챙기면 집중력이 오래갑니다.",
  earth: "고정된 루틴에 여유를 더해 유연성을 유지해 보세요.",
  metal: "완성도 기준을 유지하되 타이밍을 놓치지 않는 결정을 의식해 보세요.",
  water: "생각이 깊어지는 만큼 실행 시점을 짧게 끊어 관리해 보세요.",
};

const DEFICIENT_GUIDE: Record<FiveElement, string> = {
  wood: "새로운 시도와 학습 시간을 주기적으로 확보해 보세요.",
  fire: "감정 표현과 관계 소통을 의식적으로 늘려 보세요.",
  earth: "기초 체력과 생활 리듬을 먼저 안정화해 보세요.",
  metal: "기준 정리와 마감 습관을 강화하면 성과가 선명해집니다.",
  water: "정리와 회복 루틴을 의식적으로 보완해 보세요.",
};

function toElement(char: string): FiveElement | null {
  return GAN_ELEMENT_MAP[char] ?? ZHI_ELEMENT_MAP[char] ?? null;
}

export function findIljuInterpretation(gan: string, ji: string): IljuInterpretation | null {
  return ILJU_BY_GAN_JI[`${gan}${ji}`] ?? null;
}

function buildElementMessages(excessive: FiveElement[], deficient: FiveElement[]): string[] {
  const messages: string[] = [];

  for (const element of excessive) {
    messages.push(`${ELEMENT_LABEL[element]} 기운이 강합니다. ${EXCESSIVE_GUIDE[element]}`);
  }

  for (const element of deficient) {
    messages.push(`${ELEMENT_LABEL[element]} 기운이 약합니다. ${DEFICIENT_GUIDE[element]}`);
  }

  if (messages.length === 0) {
    messages.push("오행 분포가 비교적 고르게 나타납니다. 현재의 생활 리듬을 안정적으로 유지해 보세요.");
  }

  return messages;
}

export function analyzeSaju(result: SajuResult): SajuAnalysis {
  const counts: Record<FiveElement, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  const chars = [
    result.year.gan,
    result.year.ji,
    result.month.gan,
    result.month.ji,
    result.day.gan,
    result.day.ji,
    result.time.gan,
    result.time.ji,
  ];

  for (const char of chars) {
    const element = toElement(char);
    if (!element) {
      throw new Error(`Unknown gan/ji character in analysis: ${char}`);
    }
    counts[element] += 1;
  }

  const total = Object.values(counts).reduce((acc, count) => acc + count, 0);
  if (total !== 8) {
    throw new Error(`Invalid element count total: ${total}`);
  }

  const excessive = ELEMENT_ORDER.filter((key) => counts[key] >= 3);
  const deficient = ELEMENT_ORDER.filter((key) => counts[key] === 0);
  const messages = buildElementMessages(excessive, deficient);

  const iljuKey = `${result.day.gan}${result.day.ji}`;
  const ilju = findIljuInterpretation(result.day.gan, result.day.ji);
  const iljuHeadline = ilju
    ? `당신은 [${ilju.title}]의 기운을 타고났습니다.`
    : `당신의 일주(${iljuKey}) 해석 데이터는 준비 중입니다.`;

  return {
    iljuKey,
    ilju,
    iljuHeadline,
    element: {
      counts,
      excessive,
      deficient,
      messages,
    },
  };
}
